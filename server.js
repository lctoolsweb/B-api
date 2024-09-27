const express = require('express');
const cors = require('cors');
const { generateQR, checkQRStatus } = require('./login');
const { checkCookie } = require('./checkcookie');
const { userinfo } = require('./userinfo');
const { video } = require('./video');  
const { videodownload, downloadsPath } = require('./videodownload');
const {epvideo} =  require('./epvideo');
const app = express();
const port = 9877;

app.use(cors()); // 允许所有跨域请求
app.use(express.json());

// 生成二维码的路由
app.get('/api/generate_qr', generateQR);

// 检查二维码扫码状态并获取 SESSDATA 和 WBI 签名
app.get('/api/check_qr_status', checkQRStatus);

// 检查cookie是否需要刷新
app.post('/api/checkcookie', checkCookie);

// 获取用户信息
app.post('/api/userinfo', userinfo);

// 获取视频流信息
app.post('/api/video', video);

// 获取番剧视频流信息
app.post('/api/epvideo', epvideo);
// 获取视频下载接口
app.post('/api/videodownload', videodownload); // 使用 videodownload 函数

// 提供下载的静态文件目录
app.use('/downloads', express.static(downloadsPath));


app.listen(port, '0.0.0.0', () => {
  console.log(`服务器正在运行在 http://0.0.0.0:${port}`);
});
