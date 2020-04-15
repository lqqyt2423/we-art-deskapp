import * as fs from 'fs';
import * as util from 'util';

const fsStat = util.promisify(fs.stat);
const fsWriteFile = util.promisify(fs.writeFile);
const fsReadFile = util.promisify(fs.readFile);
const fsUnlink = util.promisify(fs.unlink);

export async function existFn(pathname): Promise<boolean> {
  try {
    await fsStat(pathname);
    return true;
  } catch (e) {
    return false;
  }
}

export default class FileCache {
  constructor(private readonly pathname: string,
    private readonly getFn: () => Promise<Buffer | String>) { }

  public async exist(): Promise<boolean> {
    return await existFn(this.pathname);
  }

  public async get(): Promise<Buffer | String> {
    const isExist = await this.exist();
    if (isExist) return fsReadFile(this.pathname);

    const buf = await this.getFn();
    await fsWriteFile(this.pathname, buf);
    return buf;
  }

  public async set(): Promise<void> {
    const isExist = await this.exist();
    if (!isExist) await this.get();
  }

  public async delete() {
    const isExist = await this.exist();
    if (isExist) await fsUnlink(this.pathname);
  }
}
