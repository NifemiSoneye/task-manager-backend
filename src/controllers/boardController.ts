import Board from "../model/Board";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

const getAllBoards = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const boards = await Board.find({ user: req?.user?.id }).lean();
    res.json(boards);
  },
);

const createNewBoard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { title } = req.body;
    const user = req.user?.id;
    if (!title || !user) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }
    const duplicate = await Board.findOne({ title, user: req.user?.id }).lean();
    if (duplicate) {
      res.status(409).json({
        message: "Duplicate Title",
      });
      return;
    }
    const boardObject = {
      title,
      user,
    };
    const board = await Board.create(boardObject);

    if (board) {
      res.status(201).json({ message: `New Board ${title} created , `, board });
    } else {
      res.status(400).json({ message: "Invalid Board data recieved" });
    }
  },
);
const getBoard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        message: "Board ID required",
      });
      return;
    }
    const board = await Board.findById(id).exec();

    if (!board) {
      res.status(404).json({
        message: "Board not found",
      });
      return;
    }
    if (board?.user.toString() !== req.user?.id) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    res.json(board);
  },
);
const updateBoard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title } = req.body;

    if (!id || !title) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }

    const board = await Board.findById(id).exec();
    if (!board) {
      res.status(404).json({
        message: "Board not found",
      });
      return;
    }
    if (board?.user.toString() !== req.user?.id) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const duplicate = await Board.findOne({ title, user: req.user?.id }).lean();

    if (duplicate && duplicate?._id.toString() !== id) {
      res.status(409).json({
        message: "Duplicate Title",
      });
      return;
    }

    board.title = title;

    const updatedBoard = await board.save();
    res.json({ message: `${updatedBoard.title} updated` });
  },
);

const deleteBoard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        message: "Board ID required",
      });
      return;
    }
    const board = await Board.findById(id).exec();

    if (!board) {
      res.status(404).json({
        message: "Board not found",
      });
      return;
    }

    if (board?.user.toString() !== req.user?.id) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const result = await board?.deleteOne();

    res.json(`Board ${board?.title} with ID ${id} deleted`);
  },
);

export { getAllBoards, getBoard, createNewBoard, updateBoard, deleteBoard };
