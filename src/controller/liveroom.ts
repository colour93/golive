import axios from "axios";
import { NextFunction, Request, Response } from "express";
import {
  getUserProfileByUsername,
  updateUserProfileByUsername,
} from "../service/user";

class LiveGoKeyResponse {
  status: number;
  data: string;
}

export async function getStreamKey(req: Request, res: Response) {
  const { username } = req.session;

  const user = await getUserProfileByUsername(username);

  if (!user) {
    res.send({
      code: 404,
      msg: "未找到该用户",
    });
    return;
  }

  if (user.verified === 0) {
    res.send({
      code: 403,
      msg: "用户未认证",
    });
    return;
  }

  try {
    const result = (await axios
      .get("/control/get", {
        params: {
          room: username,
        },
      })
      .then((resp) => resp.data)) as LiveGoKeyResponse;

    const key = result.data;

    const msg = (await updateUserProfileByUsername(username, { key }))
      ? "获取密钥成功"
      : "获取密钥成功，更新数据库失败";

    res.send({
      code: 0,
      msg,
      data: {
        key,
      },
    });
  } catch (error) {
    if (error.response) {
      res.send({
        code: 500,
        msg: "连接 LiveGo 遇到内部错误",
      });
      console.log(error.response.data);
      console.log(error.response.status);
    } else if (error.request) {
      console.log(error);
      res.send({
        code: 500,
        msg: "连接 LiveGo 失败",
      });
    } else {
      res.send({
        code: 500,
        msg: "内部错误",
      });
      console.log("Error:", error.message);
    }
  }
}
