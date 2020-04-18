import * as rp from 'request-promise';

const version = '1.0.0';

export async function get(): Promise<string> {
  let endpoint = 'https://shuke.applinzi.com/api/we-art-desk/ad';
  endpoint += '?version=' + version;
  const data = await rp.get(endpoint, { json: true });

  return data.data.ad;
}
