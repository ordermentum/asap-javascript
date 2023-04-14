import {
  createAuthHeaderGenerator,
  AuthHeaderConfig,
} from '@ordermentum/asap-core';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import http from 'http';
import https from 'https';

export const createAsapInterceptor = (authConfig: AuthHeaderConfig) => {
  const headerGenerator = createAuthHeaderGenerator({
    ...authConfig,
  });
  return (config: AxiosRequestConfig) => {
    const header = headerGenerator();
    const headers = config.headers ?? {};
    headers.Authorization = header;
    return { ...config, headers };
  };
};

export const serviceToClientMap = new Map<string, AxiosInstance>();

const getDefaultAxiosConfig = (): AxiosRequestConfig => ({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

export type Options = {
  issuer: string;
  service: string;
  publicKey: string;
  privateKey: string;
  cache?: boolean;
};

export const createClient = (
  { issuer, service, publicKey, privateKey }: Options,
  authConfig: Pick<
    AuthHeaderConfig,
    'insecureMode' | 'additionalClaims' | 'tokenExpiryMs'
  > = {},
  axiosOptions: AxiosRequestConfig = {}
) => {
  const DEFAULT_TOKEN_EXPIRY_MS = 60 * 5 * 1000; // 5 minute expiry
  const issuerServiceKey = `${issuer}:${service}`;

  // Check if cache has a client
  if (!authConfig.insecureMode && serviceToClientMap.has(issuerServiceKey))
    return serviceToClientMap.get(issuerServiceKey)!;

  const axiosCreateOpts = {
    ...getDefaultAxiosConfig(),
    ...axiosOptions,
  };

  if (!privateKey && !authConfig.insecureMode)
    return axios.create(axiosCreateOpts);

  // Create an interceptor for the service
  const asapInterceptor = createAsapInterceptor({
    ...authConfig,
    privateKey,
    keyId: `${issuer}/${publicKey}`,
    issuer,
    audience: service,
    tokenExpiryMs: DEFAULT_TOKEN_EXPIRY_MS,
  });

  const client = axios.create(axiosCreateOpts);
  // @ts-ignore
  client.interceptors.request.use(asapInterceptor);
  serviceToClientMap.set(issuerServiceKey, client);

  return client;
};

export default createAsapInterceptor;
