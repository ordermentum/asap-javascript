export const getKey = (prefix: string, keyId: string) => {
  const key = keyId.replace('/', '_').toUpperCase();
  return `${prefix}${key}`;
};

export const environmentFetcher =
  (prefix: string = 'PRIVATE_') =>
  async (keyId: string): Promise<string> => {
    const key = getKey(prefix, keyId);
    return process.env[key] || '';
  };

export default environmentFetcher;
