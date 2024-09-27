const axios = require('axios');

// 定义 /api/video 路由的处理函数
const video = async (req, res) => {
    try {
        // 从请求体中提取 bvid、cookie 和 wbiQuery
        const { bvid, cookie, wbiQuery } = req.body;

        // 第一步：获取 cid
        const cidResponse = await axios.get(`https://api.bilibili.com/x/player/pagelist`, {
            params: { bvid, jsonp: 'jsonp' }
        });

        // 确认获取到的 JSON 结构无误，并从第一个 data 对象中提取 cid
        if (cidResponse.data.code === 0 && cidResponse.data.data.length > 0) {
            const cid = cidResponse.data.data[0].cid; // 提取第一个对象中的 cid

            // 将 wbiQuery 字符串转换为对象形式的查询参数
            const queryParams = wbiQuery.split('&').reduce((acc, curr) => {
                const [key, value] = curr.split('=');
                acc[key] = value;
                return acc;
            }, {});

            // 第二步：使用 WBI 签名，获取视频播放 URL
            const playUrlResponse = await axios.get('https://api.bilibili.com/x/player/wbi/playurl', {
                params: {
                    bvid,
                    cid,
                    qn: 0,
                    fnval: 80,
                    fnver: 0,
                    fourk: 1,
                    ...queryParams  // 将解析后的 WBI 签名查询参数传递
                },
                headers: {
                    Cookie: `SESSDATA=${cookie}`
                }
            });

            // 将获取到的播放 URL 数据返回给前端
            res.json(playUrlResponse.data);
        } else {
            // 如果没有获取到 cid，则返回错误信息
            res.status(400).json({ message: '未能获取到有效的 cid' });
        }
    } catch (error) {
        console.error('Error fetching video data:', error);
        res.status(500).send('服务器内部错误');
    }
};

module.exports = { video };
