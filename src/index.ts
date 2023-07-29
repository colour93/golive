import { preload } from "./preload";
preload();

import * as express from "express";
import * as https from "https";
import * as http from "http";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import { AppDataSource } from "./data-source";

import axios from "axios";

import { wssCtrl } from "./ws";

import route from "./router";
import liveProxy from "./proxy/live";
import { readFileSync } from "fs";
import path = require("path");
import { runBinaryFile } from "./daemon";

const config = require(process.env.CONFIG_PATH);

const sessionParser = session({
  secret: config.session_secret,
  resave: false,
  saveUninitialized: false,
});

declare module "express-session" {
  interface SessionData {
    username: string;
  }
}

export default sessionParser;

runBinaryFile();

axios.defaults.baseURL = `http://127.0.0.1:${config.livego.api_port}`;

AppDataSource.initialize()
  .then(async () => {
    const app = express();

    app.use(sessionParser);

    app.use(bodyParser.json());

    if (process.env.ENV !== "dev") app.use("/", express.static("static"));

    app.use("/api", route);

    app.use("/live", liveProxy);

    console.log("server is starting...");

    const httpServer = http.createServer(app);

    httpServer.on("upgrade", wssCtrl);

    httpServer.listen(config.port, () => {
      console.log(`http & ws listen on ${config.port}`);
    });

    if (config.tls?.enable) {
      const httpsServer = https.createServer(
        {
          key: readFileSync(path.resolve("config", "cert.key")),
          cert: readFileSync(path.resolve("config", "cert.pem")),
        },
        app
      );

      httpsServer.on("upgrade", wssCtrl);

      httpsServer.listen(config.tls.port, () => {
        console.log(
          `https & wss listen on ${config.tls.port}, host: ${config.host}`
        );
      });
    }
  })
  .catch((error) => console.log(error));

// TODO: tsconfig.json 修改 typeRoots 无效
declare module "express-session" {
  interface SessionData {
    username: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      file: {
        buffer: Buffer;
        originalname: string;
      };
    }
  }
}
