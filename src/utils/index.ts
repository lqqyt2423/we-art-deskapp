import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export function getPath(pathname: string): string {
  return path.join(os.homedir(), '.we-art-deskapp', pathname);
}

export function md5(data: Buffer | string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}
