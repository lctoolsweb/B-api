const axios = require('axios');


const epvideo = async (req, res) => {
    try {
        // 从请求体中提取 ep_id 和 cookie
        const { ep_id, cookie } = req.body;

        // 发送请求获取视频播放 URL
        const playUrlResponse = await axios.get('https://api.bilibili.com/pgc/player/web/playurl', {
            params: {
                ep_id,
            },
            headers: {
                Cookie: `SESSDATA=${cookie}`,
                Referer: 'https://www.bilibili.com'  // 设置 Referer
            }
        });

        // 将获取到的播放 URL 数据返回给前端
        res.json(playUrlResponse.data);
    } catch (error) {
        console.error('Error fetching video data:', error);
        res.status(500).send('服务器内部错误');
    }
};

module.exports = { epvideo };
