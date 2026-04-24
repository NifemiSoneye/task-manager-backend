import express from "express";
import {
  getTasksByBoard,
  updateTask,
  createTask,
  deleteTask,
} from "../controllers/taskController";
import verifyJWT from "../middleware/verifyJWT";
const router = express.Router();
router.use(verifyJWT);

router.route("/:id").patch(updateTask).delete(deleteTask);

export default router;
