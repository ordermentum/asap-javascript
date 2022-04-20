export const getKey = (prefix: string, keyId: string) => {
  const key = keyId.replace('/', '_').toUpperCase();
  return `${prefix}${key}`;
};

export const createPublicKeyFetcher =
  (prefix: string = 'PRIVATE_', base64 = false) =>
  async (keyId: string): Promise<string> => {
    const key = getKey(prefix, keyId);
    const value = process.env[key];
    if (value && base64) {
      return Buffer.from(value, 'base64').toString('ascii');
    }
    return value ?? '';
  };

export default createPublicKeyFetcher;
