const axios = require('axios');

// 检查Cookie的路由
async function checkCookie(req, res) {
  const { cookie, biliJct } = req.body;

  if (!cookie || !biliJct) {
    return res.status(400).json({ error: '缺少cookie或biliJct参数' });
  }

  try {
    const response = await axios.get('https://passport.bilibili.com/x/passport-login/web/cookie/info', {
      headers: {
        Cookie: `SESSDATA=${cookie}; bili_jct=${biliJct}`
      },
      params: {
        csrf: biliJct // 可选参数
      }
    });

    // 将返回内容原封不动地返回给路由
    res.json(response.data);
  } catch (error) {
    console.error('请求失败', error);
    res.status(500).json({ error: '请求失败' });
  }
}

module.exports = { checkCookie };
