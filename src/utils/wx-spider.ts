import * as rp from 'request-promise';
import FileCache, { existFn } from './file-cache';
import { getPath, md5, runCmd, cp } from './index';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import logger from './logger';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

const postTempHtml = fs.readFileSync(path.join(__dirname, 'postTemp.html'), 'utf8');
const xslPath = path.resolve(__dirname, './wk_catalog.xsl');

export async function getBody(link: string) {
  // todo: 更详细地识别链接

  const hash = md5(link);
  const filename = hash + '.html';
  const pathname = getPath('html/' + filename);

  const htmlCache = new FileCache(pathname, async () => {
    return await rp({ uri: link, encoding: null, timeout: 5000 });
  });
  const html = String(await htmlCache.get());

  const $ = cheerio.load(html, { decodeEntities: false });
  let content = '';

  // 文章标题下面的日期显示
  const pubDateMatch = html.match(/var ct = "(\d+)";/);
  if (pubDateMatch) {
    const pubDate = pubDateMatch[1];
    const pubDateStr = moment(parseInt(pubDate) * 1000).format('YYYY-MM-DD HH:mm');
    $('#publish_time').html(pubDateStr);
  }

  content = $('#img-content').html() || '';
  content = content.trim();

  if (!content) {
    await htmlCache.delete();
    return null;
  }

  // 替换文章中的标题标签为 p 标签
  // 除了标题外
  content = content.replace(/<h2 class="rich_media_title" id="activity-name">((.|\n)*?)<\/h2>/g, (text, title) => {
    return `THE_TMP_TITLE_H2_BEGIN${title}THE_TMP_TITLE_H2_END`;
  });
  content = content.replace(/(<\/?)h[1-6]/g, (a, b) => {
    return `${b}p`;
  });
  content = content.replace(/THE_TMP_TITLE_H2_BEGIN/g, '<h2 class="rich_media_title" id="activity-name">');
  content = content.replace(/THE_TMP_TITLE_H2_END/g, '</h2>');

  // 文章标题下面的公众号链接去除 a 标签
  content = content.replace(/(<span class="rich_media_meta rich_media_meta_nickname" id="profileBt">)(.|\n)*?<a href="javascript:void\(0\);" id="js_name">((.|\n)+?)<\/a>/, '$1$3');

  // 2019.2.7 正文内容不隐藏
  content = content.replace('id="js_content" style="visibility: hidden;"', 'id="js_content" style="visibility: visible;"');

  const imgs = [] as string[];
  const imgFilenames = [] as string[];
  const pathnames = [] as string[];

  // 替换图片 src 属性
  content = content.replace(/data-src="(http.+?)"/g, (text, link) => {
    imgs.push(link);
    let extname = 'png';
    if (link.indexOf('gif') > -1) extname = 'gif';
    if (link.indexOf('jpg') > -1) extname = 'jpg';
    if (link.indexOf('jpeg') > -1) extname = 'jpeg';

    const hash = md5(link);
    const filename = hash + '.' + extname;
    imgFilenames.push(filename);
    const pathname = getPath('asset/' + filename);
    const srcname = '../asset/' + filename;
    pathnames.push(pathname);
    return `src=${srcname}`;
  });

  if (imgs.length) {
    // 串行下载
    for (let i = 0, len = imgs.length; i < len; i++) {
      const imgLink = imgs[i];
      const pathname = pathnames[i];
      const imgCache = new FileCache(pathname, async () => {
        return await rp({ uri: imgLink, encoding: null, timeout: 5000 });
      });

      try {
        await imgCache.set();
      } catch (err) {
        logger.warn('get img %s failed', imgLink);
        logger.error(err);
      }
    }
  }

  return { content, localImgs: pathnames, imgFilenames };
}

export async function generateHtml(urls: string[]): Promise<string> {
  let body = '';

  for (let i = 0, len = urls.length; i < len; i++) {
    const res = await getBody(urls[i]);
    if (res && res.content) {
      body += `<div id="img-content">${res.content}</div>`;
    }
  }

  const html = postTempHtml.replace('POST_CONTENT', body);
  return html;
}

export async function generateHtmlThenSave(urls: string[]): Promise<string> {
  const hash = md5(urls.join(','));
  const filename = hash + '.html';
  const pathname = getPath('target-html/' + filename);

  const cache = new FileCache(pathname, async () => {
    return await generateHtml(urls);
  });
  await cache.set();

  return pathname;
}

export async function generatePdf(link: string, pathname: string) {
  // 低质量 A4 页脚页码居中 去除背景 渲染目录
  let wkhtmltopdf = path.join(__dirname, '../bin/wkhtmltopdf');

  // 防止路径中出现空格
  wkhtmltopdf = '"' + wkhtmltopdf + '"';
  const curXslPath = '"' + xslPath + '"';
  link = '"' + link + '"';
  pathname = '"' + pathname + '"';

  const command = `${wkhtmltopdf} --lowquality --page-size A4 --footer-center [page] --footer-font-size 12 --no-background toc --xsl-style-sheet ${curXslPath} ${link} ${pathname}`;
  const { stdout, stderr } = await runCmd(command);
  logger.info('generatePdf: link: %s, pathanme: %s, stdout: %s, stderr: %s', link, pathname, stdout, stderr);
}

export async function generatePdfByLinks(urls: string[]) {
  const htmlPathname = await generateHtmlThenSave(urls);
  const pdfPathname = htmlPathname.replace('target-html', 'target-pdf').replace(/\.html$/, '.pdf');

  if (await existFn(pdfPathname)) return pdfPathname;
  await generatePdf(htmlPathname, pdfPathname);
  return pdfPathname;
}

export async function saveImgs(urls: string[]) {
  let imgFilenames = [] as string[];
  let imgs = [] as string[];

  for (const url of urls) {
    const res = await getBody(url);
    if (res && res.localImgs) {
      imgFilenames = imgFilenames.concat(res.imgFilenames);
      imgs = imgs.concat(res.localImgs);
    }
  }

  const hash = md5(urls.join(','));
  const dirname = getPath('target-asset/' + hash);
  await mkdirp(dirname);

  for (let i = 0; i < imgs.length; i++) {
    const destPath = path.join(dirname, imgFilenames[i]);
    await cp(imgs[i], destPath);
  }

  return dirname;
}
