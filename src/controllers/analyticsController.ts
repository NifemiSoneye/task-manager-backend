import Board from "../model/Board";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Task from "../model/Task";

const handleAnalytics = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userBoards = await Board.find({ user: req?.user?.id }).select("_id");
    const boardIds = userBoards.map((b) => b._id);
    const totalBoards = userBoards.length;

    const [tasksDone, inProgress, toDo] = await Promise.all([
      Task.countDocuments({ board: { $in: boardIds }, status: "done" }),
      Task.countDocuments({ board: { $in: boardIds }, status: "in-progress" }),
      Task.countDocuments({ board: { $in: boardIds }, status: "todo" }),
    ]);

    res.json({ totalBoards, tasksDone, inProgress, toDo });
  },
);

export default handleAnalytics;
