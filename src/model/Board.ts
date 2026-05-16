import mongoose, { Schema, Document } from "mongoose";

import { IBoard } from "../types";

interface IBoardDocument extends IBoard, Document {}

const boardSchema = new Schema<IBoardDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    favourite: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IBoardDocument>("Board", boardSchema);
