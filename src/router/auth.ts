import { Router } from "express";
import {
  loginCtrl,
  logoutCtrl,
  registerCtrl,
  sendOTPCtrl,
} from "../controller/auth";

const router = Router();

router.post("/login", loginCtrl);

router.get("/logout", logoutCtrl);

router.post("/register", registerCtrl);

router.post("/send_otp", sendOTPCtrl);

export default router;
