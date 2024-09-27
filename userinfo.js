const axios = require('axios');

async function userinfo(req, res) {
    const { cookie } = req.body;

    if (!cookie) {
        return res.status(400).json({ error: 'Cookie 参数是必须的' });
    }

    try {
        // 通过 axios 发送 GET 请求，认证方式使用 Cookie
        const response = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
            headers: {
                Cookie: `SESSDATA=${cookie}`
            }
        });

        // 获取原始数据
        const userData = response.data;

        // 如果用户已登录，尝试获取 face 图片并转换为 base64
        if (userData.code === 0 && userData.data.isLogin) {
            const faceUrl = userData.data.face;
            const faceImage = await getBase64Image(faceUrl);
            userData.data.face = faceImage; // 将 face 字段替换为 base64 图片

            // 返回处理后的数据
            return res.json(userData);
        } else {
            return res.json(userData); // 返回原始数据
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '请求 Bilibili API 时出错' });
    }
}

// 辅助函数：下载图片并转换为 base64
async function getBase64Image(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:${response.headers['content-type']};base64,${base64}`;
}

module.exports = { userinfo };
