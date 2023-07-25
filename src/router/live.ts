import { Router, Request, Response } from "express";
import { getLiveroomInfoCtrl, getUserAvatarCtrl } from "../controller/live";

const router = Router();

router.get("/get_info", getLiveroomInfoCtrl);

router.get("/avatar/:username", getUserAvatarCtrl)

export default router;
