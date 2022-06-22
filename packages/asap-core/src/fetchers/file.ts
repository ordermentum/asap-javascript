import { promises as fs, existsSync, readFileSync } from 'fs';
import path from 'path';

const testPublicKey = readFileSync(
  path.join(__dirname, '../keys_for_test/public_key_for_tests.pem')
).toString('utf-8');

export const createPublicKeyFetcher =
  (directory: string) =>
  async (keyId: string): Promise<string> => {
    const full = path.join(directory, `${keyId}.pem`);

    if (!existsSync(full)) {
      throw new Error(`Invalid Key ${keyId} not found in ${full}`);
    }

    const file = await fs.readFile(full);
    return file.toString('utf-8');
  };

/**
 * Creates a fetcher that returns a static public key for testing
 * The idea is when the library is initiated in insecure mode,
 * it uses a pair of test keys and does not rely on the calling service
 * to provide a key pair.
 * We'll be ignore arguments passed to this key loader
 * @requires Authenticator (../authenticator) to be initiated in insecure mode
 * @note ONLY FOR USE IN INSECURE MODE
 */
export const createTestPublicKeyFetcher =
  () =>
  async (_keyId: string): Promise<string> =>
    testPublicKey;

export default createPublicKeyFetcher;
