import { promises as fs, existsSync } from 'fs';
import path from 'path';

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
