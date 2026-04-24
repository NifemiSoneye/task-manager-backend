import mongoose, { Schema, Document } from "mongoose";

import { ITask } from "../types";

interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["todo", "inprogress", "done"],
    default: "todo",
  },
  order: {
    type: Number,
    default: 0,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Board",
  },
});

export default mongoose.model<ITaskDocument>("Task", taskSchema);
