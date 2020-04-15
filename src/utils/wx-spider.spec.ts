import { initMkdirp } from './index';
import { getBody, generateHtmlThenSave, generatePdf } from './wx-spider';
import * as assert from 'assert';

const link = 'https://mp.weixin.qq.com/s/ZUKGcBnC-Z4V8szY4XXshw';

describe('wx-spider', () => {
  before(async () => {
    await initMkdirp();
  });

  it('getBody', async () => {
    const body = await getBody(link);
    assert(body);
  });

  it('generateHtmlThenSave', async () => {
    const links = [link];
    await generateHtmlThenSave(links);
  });

  it('generatePdf', async () => {
    const links = [link];
    const htmlPathname = await generateHtmlThenSave(links);
    const pdfPathname = htmlPathname.replace('target-html/', 'target-pdf/').replace(/\.html$/, '.pdf');
    await generatePdf(htmlPathname, pdfPathname);
  });
});
