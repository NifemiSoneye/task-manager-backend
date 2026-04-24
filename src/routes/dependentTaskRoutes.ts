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

router.route("/:boardId/tasks").get(getTasksByBoard).post(createTask);

export default router;
