const axios = require('axios');
const md5 = require('md5');
const QRCode = require('qrcode');

// mixinKeyEncTab 用于对 imgKey 和 subKey 进行字符顺序打乱编码
const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
];

// 对 imgKey 和 subKey 进行字符顺序打乱编码
const getMixinKey = (orig) => mixinKeyEncTab.map(n => orig[n]).join('').slice(0, 32);

// 为请求参数进行 wbi 签名
function encWbi(params, img_key, sub_key) {
  const mixin_key = getMixinKey(img_key + sub_key),
    curr_time = Math.round(Date.now() / 1000),
    chr_filter = /[!'()*]/g;

  Object.assign(params, { wts: curr_time }); // 添加 wts 字段
  const query = Object
    .keys(params)
    .sort()
    .map(key => {
      const value = params[key].toString().replace(chr_filter, '');
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');

  const wbi_sign = md5(query + mixin_key); // 计算 w_rid

  return query + '&w_rid=' + wbi_sign;
}

// 获取最新的 img_key 和 sub_key
async function getWbiKeys(sessdata) {
  const res = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
    headers: {
      Cookie: `SESSDATA=${sessdata}`,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      Referer: 'https://www.bilibili.com/',
    },
  });
  const { data: { wbi_img: { img_url, sub_url } } } = res.data;

  return {
    img_key: img_url.slice(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.')),
    sub_key: sub_url.slice(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.')),
  };
}

// 生成二维码
async function generateQR(req, res) {
  try {
    const response = await axios.get(
      'https://passport.bilibili.com/x/passport-login/web/qrcode/generate'
    );
    let { url, qrcode_key } = response.data.data;

    url = decodeURIComponent(url.replace(/\\u0026/g, '&'));

    QRCode.toDataURL(url, (err, qrCodeUrl) => {
      if (err) {
        console.error('二维码生成失败', err);
        return res.status(500).json({ error: '二维码生成失败' });
      }

      res.json({ qrCodeUrl, qrcode_key });
    });
  } catch (error) {
    console.error('获取二维码失败', error);
    res.status(500).json({ error: '获取二维码失败' });
  }
}

// 检查二维码扫码状态并获取 SESSDATA 和 WBI 签名
async function checkQRStatus(req, res) {
  const qrcodeKey = req.query.qrcode_key;
  if (!qrcodeKey) {
    return res.status(400).json({ error: '缺少qrcode_key参数' });
  }

  try {
    const response = await axios.get(
      `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${qrcodeKey}`,
      { withCredentials: true }
    );

    const data = response.data;

    if (data.code === 0 && data.data.code === 0) {
      const cookies = response.headers['set-cookie'];
      const sessdataCookie = cookies.find(cookie => cookie.startsWith('SESSDATA='));
      const biliJctCookie = cookies.find(cookie => cookie.startsWith('bili_jct='));

      const sessdata = sessdataCookie
        ? decodeURIComponent(sessdataCookie.split(';')[0].split('=')[1])
        : null;

      const biliJct = biliJctCookie
        ? decodeURIComponent(biliJctCookie.split(';')[0].split('=')[1])
        : null;

      if (sessdata) {
        const wbiKeys = await getWbiKeys(sessdata);
        const params = { foo: '114', bar: '514', baz: 1919810 };
        const wbiQuery = encWbi(params, wbiKeys.img_key, wbiKeys.sub_key);

        res.json({
          scanStatus: '扫码成功',
          sessdata,
          biliJct,
          wbiQuery,
        });
      } else {
        res.json({ scanStatus: '扫码成功，但未找到 SESSDATA' });
      }
    } else {
      res.json({ scanStatus: data.data.message });
    }
  } catch (error) {
    console.error('检测扫码状态失败', error);
    res.status(500).json({ error: '检测扫码状态失败' });
  }
}

module.exports = {
  generateQR,
  checkQRStatus
};
