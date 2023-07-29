import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

const livegoOptions = require(process.env.CONFIG_PATH).livego;

router.use(
  "/:roomId.flv",
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
  ["/:roomId.m3u8", "/:roomId/:timestamp.ts"],
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
