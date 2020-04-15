import { runCmd } from './index';
import * as assert from 'assert';

describe('utils/index.ts', () => {
  it('runCmd success', async () => {
    const { stdout } = await runCmd('wkhtmltopdf -V');
    assert(stdout);
  });

  it('runCmd failed', async () => {
    try {
      await runCmd('somenullcmd');
      assert(false);
    } catch (err) {
      assert((err.message as string).includes('Command failed'));
      assert((err.message as string).includes('command not found'));
    }
  });
});
