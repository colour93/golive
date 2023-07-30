# 路由表

## HTTP

> 以下路由均以 `/api` 为基础

| path | 说明 |
|:-----|:----|
| /overview | api 总体信息，包括推拉流服务器地址、直播间前端地址 |
| /auth/login | - |
| /auth/logout | - |
| /auth/register | - |
| /auth/send_otp | 发送验证码 |
| /liveroom/get_key | 获取推流密钥 |
| /live/get_info | 获取直播间信息，包括拉流地址、直播用户信息 |
| /live/avatar/:username | 用户头像 |
| /user | 获取用户信息（鉴权） |
| /user/update | 更新用户信息 |
| /user/upload_avatar | 上传头像 |

## WS

> 以下路由均以 `/ws` 为基础

| path | 说明 |
| :--- | :--- |
| [/chat](#/chat) | 在线统计与聊天 |

### /chat

| action | data 字段 | 方向 |
| :----- | :------ | :--: |
| updateClientsCount | roomId: string; count: number | SC |
| sendMessage | message: string | CS |
| receiveMessage | roomId: string; sender: UserInfo; message: string | SC |