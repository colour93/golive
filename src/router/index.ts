import { Router, Request, Response } from "express";

const config = require(process.env.CONFIG_PATH);
const packageInfo = require("../../package.json");

import authRouter from "./auth";
import liveRouter from "./live";
import liveroomRouter from "./liveroom";
import userRouter from "./user";
import { authMid } from "../middleware/auth";
import { getUserProfileByUsername } from "../service/user";

const router = Router();

router.get("/overview", async (req: Request, res: Response) => {
  let { username } = req.session;
  if (username) {
    const user = await getUserProfileByUsername(username);
    if (!user) {
      delete req.session.username;
      username = undefined;
    }
  }
  res.send({
    app: packageInfo.name,
    version: packageInfo.version,
    streamServer: `rtmp://${config.livego.stream_host}:${config.livego.rtmp_port}/${config.livego.app_name}`,
    liveroomBase: config.tls
      ? `https://${config.host}:${config.tls.port}/#/live`
      : `http://${config.host}:${config.port}/#/live`,
    user: username,
  });
});

router.use("/auth", authRouter);
router.use("/live", liveRouter);
router.use("/liveroom", authMid, liveroomRouter);
router.use("/user", authMid, userRouter);

export default router;
