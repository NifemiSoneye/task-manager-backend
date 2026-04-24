import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DATABASE_URI as string);
  } catch (err: unknown) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;
