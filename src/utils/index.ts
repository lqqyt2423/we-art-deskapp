import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import * as mkdirp from 'mkdirp';
import { exec } from 'child_process';
import * as util from 'util';
import logger from './logger';
import * as fs from 'fs';

const execAsync = util.promisify(exec);

export async function initMkdirp() {
  await mkdirp(getPath('asset'));
  await mkdirp(getPath('html'));
  await mkdirp(getPath('target-html'));
  await mkdirp(getPath('target-pdf'));
}

export function getPath(pathname: string): string {
  return path.join(os.homedir(), '.we-art-deskapp', pathname);
}

export function md5(data: Buffer | string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

export async function runCmd(command: string) {
  logger.info('runCmd:', command);
  return await execAsync(command);
}

export async function cp(src: string, dest: string) {
  await new Promise((resolve, reject) => {
    fs.createReadStream(src)
      .pipe(fs.createWriteStream(dest))
      .on('error', reject)
      .on('finish', resolve);
  });
}
