import * as fs from "fs";
import path = require("path");

export function preload() {
  if (!["win32", "linux"].includes(process.platform))
    throw new Error(`unsupported platform ${process.platform}`);

  if (process.env.ENV === "dev") console.log("running on dev mode");

  if (!fs.existsSync("config")) fs.mkdirSync("config");
  if (!fs.statSync("config").isDirectory())
    throw new Error("'config' is not a directory, please check");

  if (process.env.ENV !== "dev" && !fs.existsSync("config.json"))
    throw new Error("please check 'config.json'");
  if (process.env.ENV === "dev" && !fs.existsSync("config.dev.json"))
    throw new Error("please check 'config.dev.json'");

  process.env.CONFIG_PATH =
    process.env.ENV === "dev"
      ? path.resolve("config.dev.json")
      : path.resolve("config.json");

  const config = require(process.env.CONFIG_PATH);
  if (config.tls?.enable) {
    if (!fs.existsSync(path.resolve("config", "cert.key")))
      throw new Error("please check 'config/cert.key' or close tls mode");
    if (!fs.existsSync(path.resolve("config", "cert.pem")))
      throw new Error("please check 'config/cert.pem' or close tls mode");
  }

  if (process.env.ENV !== "dev" && fs.existsSync(path.resolve("src", "static")))
    throw new Error("please check 'src/static' or run on dev mode");
}
