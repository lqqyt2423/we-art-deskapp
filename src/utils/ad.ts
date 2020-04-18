// https://raw.githubusercontent.com/lqqyt2423/we-art-deskapp/master/message.json

import * as rp from 'request-promise';

const version = require('../../package.json').version as string;

export async function get(): Promise<string> {
  let endpoint = 'http://localhost:2423/api/we-art-desk/ad';
  endpoint += '?version=' + version;
  const data = await rp.get(endpoint, { json: true });

  return data.data.ad;
}
