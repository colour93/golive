import * as argon2 from "argon2";
import { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { sendOTP, verifyOTP } from "../service/otp";
import { checkEmail, checkNickname, checkUsername } from "../utils/regex";

const userRepo = AppDataSource.getRepository(User);

export async function loginCtrl(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.send({
      code: 400,
      msg: "请求错误",
    });
    return;
  }

  let user =
    (await userRepo.findOne({ where: { username } })) ||
    (await userRepo.findOne({ where: { email: username } }));

  if (!user) {
    res.send({
      code: 401,
      msg: "登陆失败，不存在该用户",
    });
    return;
  }

  if (!(await argon2.verify(user.password, password))) {
    res.send({
      code: 401,
      msg: "登陆失败，用户名或密码错误",
    });
    return;
  }

  req.session.username = user.username;
  res.send({
    code: 0,
    msg: "登陆成功",
  });
}

export async function logoutCtrl(req: Request, res: Response) {
  delete req.session.username;
  res.send({
    code: 0,
    msg: "登出成功",
  });
}

export async function registerCtrl(req: Request, res: Response) {
  const { username, nickname, email, otp, password } = req.body;

  if (!checkUsername(username)) {
    res.send({
      code: 400,
      msg: "用户名只应包含字母、数字、短横线与下划线，且至少 3 位至多 16 位",
    });
    return;
  }

  if (!checkEmail(email)) {
    res.send({
      code: 400,
      msg: "请输入正确的邮箱",
    });
    return;
  }

  if (!checkNickname(nickname)) {
    res.send({
      code: 400,
      msg: "昵称中不应包含空格",
    });
    return;
  }

  const otpStatus = await verifyOTP(email, otp);

  if (!otpStatus) {
    res.send({
      code: 401,
      msg: "验证码不正确或已过期",
    });
    return;
  }

  try {
    const newUser = new User();
    newUser.username = username;
    newUser.nickname = nickname;
    newUser.email = email;
    newUser.password = password;

    await userRepo.save(newUser);

    req.session.username = newUser.username;

    res.send({
      code: 0,
      msg: "注册成功",
    });
  } catch (error) {
    // 检查是否是唯一
    if (error.code === "SQLITE_CONSTRAINT") {
      res.send({
        code: 400,
        msg: "用户名或邮箱已被注册",
      });
    } else {
      res.send({
        code: 500,
        msg: "未知错误",
        data: error,
      });
    }
  }
}

export async function sendOTPCtrl(req: Request, res: Response) {
  const { email } = req.body;

  const result = await sendOTP(email, "register");

  res.send(
    result
      ? {
          code: 0,
          msg: "发送成功",
        }
      : {
          code: 400,
          msg: "发送失败，请稍后再试，或检查邮箱是否正确",
        }
  );
}
