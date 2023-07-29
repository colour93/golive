import { NextFunction, Request, Response } from "express";

import {
  getUserAvatarByUsername,
  getUserLiveInfoByUsername,
} from "../service/user";
import { readFileSync } from "fs";
import path = require("path");

const config = require(process.env.CONFIG_PATH);

const defaultAvatar = readFileSync(path.resolve("assets", "avatar.png"));

export async function getLiveroomInfoCtrl(req: Request, res: Response) {
  const roomId = req.query.roomId as string;

  if (!roomId) {
    res.send({
      code: 400,
      msg: "请求错误，请检查参数",
    });
    return;
  }

  const userLiveInfo = await getUserLiveInfoByUsername(roomId);

  if (!userLiveInfo) {
    res.send({
      code: 404,
      msg: "没有找到该房间或用户",
    });
    return;
  }

  res.send({
    code: 0,
    msg: "获取成功",
    data: userLiveInfo,
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
