import * as multer from "multer";
import { Router } from "express";
import { getUserProfileCtrl, updateUserProfileCtrl, uploadAvatarCtrl } from "../controller/user";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.get("/", getUserProfileCtrl);

router.post("/update", updateUserProfileCtrl);

router.post("/upload_avatar", upload.single("avatar"), uploadAvatarCtrl);

export default router;
