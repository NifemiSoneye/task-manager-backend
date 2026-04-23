import express from "express";
import {
  getBoard,
  getAllBoards,
  createNewBoard,
  updateBoard,
  deleteBoard,
} from "../controllers/boardController";
import verifyJWT from "../middleware/verifyJWT";
const router = express.Router();
router.use(verifyJWT);

router.route("/").get(getAllBoards).post(createNewBoard);
router.route("/:id").get(getBoard).patch(updateBoard).delete(deleteBoard);

export default router;
