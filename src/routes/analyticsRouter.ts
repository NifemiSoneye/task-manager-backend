// analyticsRouter.ts
import express from "express";
import handleAnalytics from "../controllers/analyticsController";
import verifyJWT from "../middleware/verifyJWT";

const router = express.Router();

router.get("/", verifyJWT, handleAnalytics);

export default router;
