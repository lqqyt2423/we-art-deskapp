import { initMkdirp } from './index';
import { getBody } from './wx-spider';
import * as assert from 'assert';

describe('wx-spider', () => {
  before(async () => {
    await initMkdirp();
  });

  it('getBody', async () => {
    const link = 'https://mp.weixin.qq.com/s/ZUKGcBnC-Z4V8szY4XXshw';
    const body = await getBody(link);
    assert(body);
  });
});
