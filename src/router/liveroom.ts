import { Router, Request, Response } from "express";
import { getStreamKey } from "../controller/liveroom";

const router = Router();

router.get("/get_key", getStreamKey);

export default router;
