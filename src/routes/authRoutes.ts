import express from "express";
import {
  handleLogin,
  handleRefresh,
  handleLogout,
  handleRegister,
} from "../controllers/authController";

const router = express.Router();

router.route("/register").post(handleRegister);
router.route("/login").post(handleLogin);
router.route("/refresh").get(handleRefresh);
router.route("/logout").post(handleLogout);

export default router;
