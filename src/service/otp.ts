import * as nodemailer from "nodemailer";

import { AppDataSource } from "../data-source";
import { OTP } from "../entity/OTP";
import { readFileSync } from "fs";
import path = require("path");
import { checkEmail } from "../utils/regex";

const mailOptions = require(process.env.CONFIG_PATH).mail;

const otpRepo = AppDataSource.getRepository(OTP);

const mailTransporter = nodemailer.createTransport(mailOptions.options);

/**
 * 发送验证码
 * @param email
 * @returns true: 发送成功 | false: 发送失败
 */
export async function sendOTP(
  email: string,
  type: "register" | "resetPassword"
): Promise<boolean> {
  if (!checkEmail(email)) return false;

  // cd 1分钟
  const oldOTP = await otpRepo
    .createQueryBuilder("otp")
    .where("otp.email = :email", { email })
    .andWhere("otp.used = :used", { used: 0 })
    .orderBy("otp.created", "DESC")
    .getOne();
  if (oldOTP && new Date().getTime() - oldOTP.created.getTime() < 60 * 1000)
    return false;

  const code = generateRandomNumber();

  const otp = new OTP();
  otp.email = email;
  otp.code = code;

  const databaseResult = await otpRepo.save(otp);

  if (!databaseResult) return false;

  let desc = "";
  switch (type) {
    case "register":
      desc = "您正在注册 GoLive，这是您的验证码，5分钟内有效";
      break;

    case "resetPassword":
      desc = "您正在重置 GoLive 账户密码，这是您的验证码，5分钟内有效";
      break;

    default:
      break;
  }

  const content = readFileSync(path.resolve("assets", "otp_mail.html"), "utf-8")
    .replace(/\{\{code\}\}/, code)
    .replace(/\{\{desc\}\}/, desc);

  const result = await mailTransporter.sendMail({
    from: mailOptions.from,
    to: email,
    subject: code,
    html: content,
  });

  return result ? true : false;
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  const otp = await otpRepo
    .createQueryBuilder("otp")
    .where("otp.email = :email", { email })
    .andWhere("otp.used = :used", { used: 0 })
    .orderBy("otp.created", "DESC")
    .getOne();

  const result = !(
    !otp ||
    new Date().getTime() - otp.created.getTime() > 5 * 60 * 1000 ||
    otp.code != code
  );

  if (result) {
    otp.used = 1;
    await otpRepo.save(otp);
  }

  return result;
}

function generateRandomNumber(): string {
  let randomNumber = Math.floor(Math.random() * 1000000).toString();
  while (randomNumber.length < 6) {
    randomNumber = "0" + randomNumber;
  }
  return randomNumber;
}
