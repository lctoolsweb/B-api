# B-API 快速调用b站api
由于本项目的特殊性，可能随时停止开发或删档
## 目录结构

- `server.js`: 服务器入口文件。
- `checkcookie.js`: 处理检查 Cookie 的逻辑。
- `epvideo.js`: 获取番剧视频流信息的处理文件。
- `login.js`: 登录。
- `userinfo.js`: 获取用户信息。
- `video.js`: 处理视频信息和下载。
- `videodownload.js`: 处理视频和音频下载。

## 安装


1. 安装依赖：


```bash
npm install
```

## 使用 
 
1. 启动服务器：


```bash
node server.js
```
服务器将会在 `http://0.0.0.0:9877` 上运行。
 
2. 访问 API 端点：
 
  - `GET /api/generate_qr`: 生成二维码
 
  - `GET /api/check_qr_status`: 检查二维码扫码状态
 
  - `POST /api/checkcookie`: 检查 Cookie
 
  - `POST /api/userinfo`: 获取用户信息
 
  - `POST /api/video`: 获取视频流信息
 
  - `POST /api/epvideo`: 获取番剧视频流信息
 
  - `POST /api/videodownload`: 下载视频和音频

## 依赖 
 
- `express`: Web 应用框架
 
- `axios`: HTTP 客户端
 
- `qrcode`: 二维码生成库
 
- `md5`: 哈希库
 
- `ws`: WebSocket 库
 
- `fs-extra`: 文件系统操作库

## 许可证 

本项目使用 MIT 许可证。详细信息请查看 LICENSE 文件。

## 路由
### 1. 生成二维码 
 
- **请求方式** : `GET`
 
- **端点** : `/api/generate_qr`
 
- **请求体** : 无
- **返回** : `{ qrCodeUrl: string, qrcode_key: string }`


---


### 2. 检查二维码扫码状态 
 
- **请求方式** : `GET`
 
- **端点** : `/api/check_qr_status`
 
- **请求参数** : 
  - `qrcode_key`: 二维码的唯一标识符
 
- **返回** :

```
{
  "scanStatus": string,
  "sessdata": string (可选),
  "biliJct": string (可选),
  "wbiQuery": string (可选)
}
```


---


### 3. 检查 Cookie 
 
- **请求方式** : `POST`
 
- **端点** : `/api/checkcookie`
 
- **请求体** :

```
{
  "cookie": string
}
```
 
- **返回** 
```
{
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": {
        "refresh": false,
        "timestamp": 1684466082562
    }
}
```
false代表当前cookie已失效
---


### 4. 获取用户信息 
 
- **请求方式** : `POST`
 
- **端点** : `/api/userinfo`
 
- **请求体** :

```
{
  "cookie": string
}
```
 
- **返回** :

```
{
  "code": number,
  "data": {
    "isLogin": boolean,
    "face": base64,
    ...
  }
}
```


---


### 5. 获取视频流信息 
 
- **请求方式** : `POST`
 
- **端点** : `/api/video`
 
- **请求体** :

```
{
  "bvid": string,
  "cookie": string,
  "wbiQuery": string
}
```
 
- **返回** : 返回播放 URL 数据


---


### 6. 获取番剧视频流信息 
 
- **请求方式** : `POST`
 
- **端点** : `/api/epvideo`
 
- **请求体** :

```
{
  "ep_id": string,
  "cookie": string
}
```
 
- **返回** : 返回播放 URL 数据


---


### 7. 下载视频和音频 
 
- **请求方式** : `POST`
 
- **端点** : `/api/videodownload`
 
- **请求体** :

```
{
  "videoUrl": string,
  "audioUrl": string
}
```
 
- **返回** :

```
{
  "video": string,
  "audio": string
}
```

#### 鸣谢
[bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect/)