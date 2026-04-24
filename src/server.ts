import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import RootRouter from "./routes/root";
import authRoutes from "./routes/authRoutes";
import boardRoutes from "./routes/boardRoutes";
import dependentTaskRoutes from "./routes/dependentTaskRoutes";
import independentTaskRoutes from "./routes/independentTaskRoute";
const app = express();
const PORT = process.env.PORT || 3500;
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", RootRouter);
app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/boards", dependentTaskRoutes);
app.use("/tasks", independentTaskRoutes);

app.all(/.*/, (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 not found" });
  } else {
    res.type("txt").send("404 not found");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
