import mongoose, { Schema, Document } from "mongoose";

import { IUser } from "../types";

interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: [String],
    default: [],
  },
});

export default mongoose.model<IUserDocument>("User", userSchema);
