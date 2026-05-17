import express from "express";
import {
  handleLogin,
  handleRefresh,
  handleLogout,
  handleRegister,
} from "../controllers/authController";
import authLimiter from "../middleware/authLimiter";

const router = express.Router();

router.route("/register").post(authLimiter, handleRegister);
router.route("/login").post(authLimiter, handleLogin);
router.route("/refresh").get(handleRefresh);
router.route("/logout").post(handleLogout);

export default router;
