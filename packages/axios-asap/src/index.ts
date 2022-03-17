import {
  createAuthHeaderGenerator,
  AuthHeaderConfig,
} from '@ordermentum/asap-core';
import { AxiosRequestConfig } from 'axios';

export const createAsapInterceptor = (authConfig: AuthHeaderConfig) => {
  const headerGenerator = createAuthHeaderGenerator(authConfig);

  return (config: AxiosRequestConfig) => {
    const header = headerGenerator();
    const headers = config.headers ?? {};
    headers.Authorization = header;
    return { ...config, headers };
  };
};

export default createAsapInterceptor;
