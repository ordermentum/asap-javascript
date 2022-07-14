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
