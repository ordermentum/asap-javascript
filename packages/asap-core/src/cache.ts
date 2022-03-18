import NodeCache from 'node-cache';

const cacheOptions = {
  stdTTL: 24 * 60 * 60, // 24 hours
  checkperiod: 10, // 10 seconds
};

export const keyCache = new NodeCache(cacheOptions);
export default keyCache;
