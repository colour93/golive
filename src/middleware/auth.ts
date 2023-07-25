import { NextFunction, Request, Response } from "express";

import { User } from "../entity/User";
import { AppDataSource } from "../data-source";

const userRepo = AppDataSource.getRepository(User);

export async function authMid(req: Request, res: Response, next: NextFunction) {
  const { username } = req.session;

  if (!username) {
    res.send({
      code: 401,
      msg: "未登录",
    });
    return;
  }

  if (!(await userRepo.findOne({ where: { username } }))) {
    delete req.session.username;
    res.send({
      code: 401,
      msg: "登陆状态过期，请重新登录",
    });
    return;
  }

  next();
}
