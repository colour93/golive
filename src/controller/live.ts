import { NextFunction, Request, Response } from "express";

import {
  getUserAvatarByUsername,
  getUserInfoByUsername,
} from "../service/user";
import { readFileSync } from "fs";
import path = require("path");

const config = require(process.env.CONFIG_PATH);
const livegoOptions = config.livego;

const defaultAvatar = readFileSync(path.resolve("assets", "avatar.png"));

export async function getLiveroomInfoCtrl(req: Request, res: Response) {
  const { roomid } = req.query;

  if (!roomid) {
    res.send({
      code: 400,
      msg: "请求错误，请检查参数",
    });
    return;
  }

  const user = await getUserInfoByUsername(roomid);

  if (!user) {
    res.send({
      code: 404,
      msg: "没有找到该房间或用户",
    });
    return;
  }

  const stream =
    user.verified === 1
      ? {
          rtmp: `rtmp://${config.host}:${livegoOptions.rtmp_port}/${livegoOptions.app_name}/${roomid}`,
          flv: `http://${config.host}:${livegoOptions.flv_port}/${livegoOptions.app_name}/${roomid}.flv`,
          hls: `http://${config.host}:${livegoOptions.hls_port}/${livegoOptions.app_name}/${roomid}.m3u8`,
        }
      : null;

  res.send({
    code: 0,
    msg: "获取成功",
    data: {
      user,
      stream,
    },
  });
}

export async function getUserAvatarCtrl(req: Request, res: Response) {
  const { username } = req.params;

  const result = await getUserAvatarByUsername(username);

  if (!result) {
    res.status(404).send();
    return;
  }

  const { avatar, avatarExt } = result;

  const avatarData = avatar || defaultAvatar;
  const avatarExtData = avatarExt || "png";

  res.setHeader("content-type", "image/" + avatarExtData).send(avatarData);
}
