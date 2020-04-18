import { get } from './ad';
import * as assert from 'assert';

describe('utils/ad.ts', () => {
  it('get ad success', async () => {
    const msg = await get();
    assert(msg);
  });
});
