const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const WebSocket = require('ws');

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ port: 8180 }); // 使用合适的端口

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
});

// 下载视频和音频的接口
const videodownload = async (req, res) => {
  const { videoUrl, audioUrl } = req.body;
  const timestamp = Date.now();

  try {
    // 创建一个空的数组来保存下载进度
    const progress = {
      video: { loaded: 0, total: 0 },
      audio: { loaded: 0, total: 0 },
    };

    // 下载视频
    const videoPath = await downloadFile(videoUrl, `${timestamp}-video.mp4`, progress.video);
    // 下载音频
    const audioPath = await downloadFile(audioUrl, `${timestamp}-audio.mp3`, progress.audio);

    // 设置10分钟后自动删除文件
    setTimeout(() => {
      fs.remove(videoPath)
        .then(() => console.log(`已删除文件: ${videoPath}`))
        .catch(err => console.error(`删除文件失败: ${videoPath}`, err));

      fs.remove(audioPath)
        .then(() => console.log(`已删除文件: ${audioPath}`))
        .catch(err => console.error(`删除文件失败: ${audioPath}`, err));
    }, 10 * 60 * 1000); // 10分钟

    res.json({
      video: `https://b.moraxs.cn/downloads/${timestamp}-video.mp4`,
      audio: `https://b.moraxs.cn/downloads/${timestamp}-audio.mp3`,
    });
  } catch (error) {
    console.error('下载失败:', error);
    res.status(500).json({ error: '下载失败' });
  }
};

// 下载文件的辅助函数
const downloadFile = async (url, filename, progress) => {
  const writer = fs.createWriteStream(path.join(__dirname, 'downloads', filename));
  
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      'Referer': 'https://www.bilibili.com',
    },
  });

  // 获取文件总大小
  progress.total = parseInt(response.headers['content-length'], 10);

  // 实时发送下载进度到前端
  response.data.on('data', (chunk) => {
    progress.loaded += chunk.length;

    // 将当前进度发送给所有连接的 WebSocket 客户端
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'progress',
          progress: {
            loaded: (progress.loaded / (1024 * 1024)).toFixed(2), // MB
            total: (progress.total / (1024 * 1024)).toFixed(2) // MB
          }
        }));
      }
    });
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(writer.path)); // 返回文件路径
    writer.on('error', reject);
  });
};

// 提供下载的静态文件目录
const downloadsPath = path.join(__dirname, 'downloads');

module.exports = { videodownload, downloadsPath };
