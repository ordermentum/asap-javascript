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

let httpAgent: http.Agent;
let httpsAgent: https.Agent;

const getDefaultAxiosConfig = (): AxiosRequestConfig => {
  if (!httpAgent) {
    httpAgent = new http.Agent({ keepAlive: true });
  }
  if (!httpsAgent) {
    httpsAgent = new https.Agent({ keepAlive: true });
  }
  return { httpAgent, httpsAgent };
};

export type Options = {
  issuer: string;
  service: string;
  publicKey: string;
  privateKey: string;
  cache?: boolean;
};

export const createClient = (
  { issuer, service, publicKey, privateKey }: Options,
  authConfig: Partial<
    Pick<
      AuthHeaderConfig,
      'insecureMode' | 'additionalClaims' | 'tokenExpiryMs'
    >
  > = {},
  axiosOptions: AxiosRequestConfig = {}
) => {
  const DEFAULT_TOKEN_EXPIRY_MS = 60 * 5 * 1000; // 5 minute expiry
  const headers = JSON.stringify(axiosOptions.headers ?? {});
  const issuerServiceKey = `${issuer}:${service}:${headers}`;

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

  client.interceptors.request.use(asapInterceptor);
  serviceToClientMap.set(issuerServiceKey, client);

  return client;
};

export default createAsapInterceptor;
