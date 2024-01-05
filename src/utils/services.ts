import * as rp from 'request-promise';
import { getConfig, setConfig } from '.';
import { mac } from 'address/promises';

const version = '2.0.0';
const apiPrefix = 'https://service-46wyxxm7-1251676417.sh.apigw.tencentcs.com/api/we-art-desk';

export async function getAd(): Promise<string> {
  let endpoint = `${apiPrefix}/ad`;
  endpoint += '?version=' + version;
  const data = await rp.get(endpoint, { json: true });

  return data.data.ad;
}

export async function authLicence(code: string): Promise<boolean> {
  const endpoint = `${apiPrefix}/auth_licence`;
  const macAddress = await mac();
  const reqData = { code, mac: macAddress, version };
  const data = await rp.post(endpoint, { json: reqData });
  return data.data.valid;
}

let isVip = null;
export async function getIsVip(): Promise<boolean> {
  if (isVip !== null) return isVip;
  const { authCode } = await getConfig();
  if (!authCode) {
    isVip = false;
    return isVip;
  }
  try {
    isVip = await authLicence(authCode);
    return isVip;
  } catch (err) {
    isVip = false;
    return isVip;
  }
}

export async function setIsVip(code: string) {
  try {
    isVip = await authLicence(code);
    if (isVip) {
      await setConfig({ authCode: code });
    }
    return isVip;
  } catch (err) {
    isVip = false;
    return isVip;
  }
}
