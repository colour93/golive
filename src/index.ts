import { preload } from "./preload";
preload();

import * as express from "express";
import * as https from "https";
import * as http from "http";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import { AppDataSource } from "./data-source";

import axios from "axios";

import route from "./router";
import { readFileSync } from "fs";
import path = require("path");
import { runBinaryFile } from "./daemon";

const config = require(process.env.CONFIG_PATH);

runBinaryFile();

axios.defaults.baseURL = `http://${
  config.livego.api_host === "localhost" ? "127.0.0.1" : config.livego.api_host
}:${config.livego.api_port}`;

AppDataSource.initialize()
  .then(async () => {
    const app = express();

    app.use(
      session({
        secret: config.session_secret,
        resave: false,
        saveUninitialized: false,
      })
    );

    app.use(bodyParser.json());

    if (process.env.ENV !== "dev") app.use("/", express.static("static"));

    app.use("/api", route);

    console.log("server is starting...");

    const httpServer = http.createServer(app);
    httpServer.listen(config.port, config.host, () => {
      console.log(`http: http://${config.host}:${config.port}`);
    });

    if (config.tls?.enable) {
      const httpsServer = https.createServer(
        {
          key: readFileSync(path.resolve("config", "cert.key")),
          cert: readFileSync(path.resolve("config", "cert.pem")),
        },
        app
      );
      httpsServer.listen(config.tls.port, config.host, () => {
        console.log(`https: https://${config.host}:${config.tls.port}`);
      });
    }
  })
  .catch((error) => console.log(error));
