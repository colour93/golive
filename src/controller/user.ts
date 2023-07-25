import * as argon2 from "argon2";
import { NextFunction, Request, Response } from "express";
import {
  getUserProfileByUsername,
  updateUserProfileByUsername,
} from "../service/user";
import { checkNickname } from "../utils/regex";

export async function getUserProfileCtrl(req: Request, res: Response) {
  const { username } = req.session;

  const profile = await getUserProfileByUsername(username);

  res.send(
    profile
      ? {
          code: 0,
          msg: "获取成功",
          data: profile,
        }
      : {
          code: 404,
          msg: "未找到该用户",
        }
  );
}

export async function updateUserProfileCtrl(req: Request, res: Response) {
  const { username } = req.session;
  const { nickname, password } = req.body;
  let updateObj: any = {};

  if (nickname) {
    if (!checkNickname(nickname)) {
      res.send({
        code: 400,
        msg: "昵称中不应包含空格",
      });
      return;
    } else {
      updateObj.nickname = nickname;
    }
  }

  if (password) updateObj.password = await argon2.hash(password);

  const result = await updateUserProfileByUsername(username, updateObj);

  res.send(
    result
      ? {
          code: 0,
          msg: "更新成功",
        }
      : {
          code: 400,
          msg: "请求错误",
        }
  );
}

export async function uploadAvatarCtrl(req: Request, res: Response) {
  const { username } = req.session;

  const avatarBuffer = req.file.buffer;
  const avatarExt = req.file.originalname
    .split(".")
    .pop()
    .toLowerCase()
    .replace(/jpg/, "jpeg");

  const result = await updateUserProfileByUsername(username, {
    avatar: avatarBuffer,
    avatarExt,
  });

  res.send(
    result
      ? {
          code: 0,
          msg: "上传成功",
        }
      : {
          code: 400,
          msg: "请检查图片格式，仅支持 jpg | jpeg | png | webp",
        }
  );
}
