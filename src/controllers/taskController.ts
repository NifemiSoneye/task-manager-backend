import Task from "../model/Task";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

const getTasksByBoard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { boardId } = req.params;
    const tasks = await Task.find({
      board: boardId,
    }).lean();
    res.json(tasks);
  },
);
const createTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title || !boardId) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }
    const duplicate = await Task.findOne({ title, board: boardId }).lean();
    if (duplicate) {
      res.status(409).json({
        message: "Duplicate Title",
      });
      return;
    }
    const taskcount = await Task.countDocuments({ board: boardId });
    const taskObject = {
      title,
      board: boardId,
      order: taskcount,
    };
    const task = await Task.create(taskObject);

    if (task) {
      res.status(201).json({ message: `New Task ${title} created , `, task });
    } else {
      res.status(400).json({ message: "Invalid Task data recieved" });
    }
  },
);
const updateTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description, priority, dueDate, status, order, board } =
      req.body;
    if (!id || !title) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }
    const task = await Task.findById(id).exec();

    if (!task) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }

    const duplicate = await Task.findOne({ title, board }).lean();
    if (duplicate && duplicate?._id.toString() !== id) {
      res.status(409).json({
        message: "Duplicate Title",
      });
      return;
    }
    task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;
    if (order !== undefined) task.order = order;

    const updatedTask = await task.save();

    res.json({ message: `${updatedTask.title} updated` });
  },
);
const deleteTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        message: "Task ID required",
      });
      return;
    }
    const task = await Task.findById(id).exec();

    if (!task) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }
    const result = await task?.deleteOne();

    res.json(`Board ${task?.title} with ID ${id} deleted`);
  },
);

export { getTasksByBoard, updateTask, createTask, deleteTask };
