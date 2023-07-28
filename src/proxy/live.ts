import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

const livegoOptions = require(process.env.CONFIG_PATH).livego;

router.use(
  "/:roomid.flv",
  createProxyMiddleware({
    target: `http://localhost:${livegoOptions.flv_port}`,
    pathRewrite: {
      "^/live": `/${livegoOptions.app_name}/`,
    },
    changeOrigin: true,
    logLevel: process.env.ENV.includes("dev") ? "debug" : "info",
  })
);

router.use(
  ["/:roomid.m3u8", "/:roomid/:timestamp.ts"],
  createProxyMiddleware({
    target: `http://localhost:${livegoOptions.hls_port}`,
    pathRewrite: {
      "^/live": `/${livegoOptions.app_name}`,
    },
    changeOrigin: true,
    logLevel: process.env.ENV.includes("dev") ? "debug" : "info",
  })
);

export default router;
