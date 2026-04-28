import User from "../model/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

const handleRegister = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      username,
      password,
      email,
    }: { username: string; password: string; email: string } = req.body;
    if (!username || !password || !email) {
      res
        .status(400)
        .json({ Message: "Username ,password and email are required." });
      return;
    }
    const duplicate = await User.findOne({ email: email }).exec();
    if (duplicate) {
      res.sendStatus(409);
      return;
    }
    const hashedPwd: string = await bcrypt.hash(password, 10);

    const userObject = { username, password: hashedPwd, email };
    const user = await User.create(userObject);

    if (user) {
      res.status(201).json({ message: `New user ${username} created` });
    } else {
      res.status(400).json({ message: "Invalid user data recieved" });
    }
  },
);

const handleLogin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const cookies = req.cookies;
    const { email, password }: { email: string; password: string } = req.body;
    if (!email || !password) {
      res.status(400).json({ Message: "Username and password are required." });
      return;
    }
    const foundUser = await User.findOne({ email: email }).exec();
    if (!foundUser) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    } // unauthorized
    //evaluate password
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      // create JWTs
      const accessToken = jwt.sign(
        {
          UserInfo: {
            email: foundUser.email,
            id: foundUser._id.toString(),
          },
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "10m" },
      );
      const newRefreshToken = jwt.sign(
        { email: foundUser.email },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "15m" },
      );

      let newRefreshTokenArray = !cookies?.jwt
        ? (foundUser.refreshToken ?? [])
        : (foundUser.refreshToken?.filter((rt) => rt !== cookies.jwt) ?? []);
      if (cookies.jwt) {
        const refreshToken = cookies.jwt;
        const foundToken = await User.findOne({ refreshToken }).exec();

        if (!foundToken) {
          console.log("attempted refresh token reuse at login");

          newRefreshTokenArray = [];
        }
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        });
      }
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await foundUser.save();
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 20 * 1000,
      });
      res.json({ accessToken });
    } else {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  },
);
const handleRefresh = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const refreshToken = cookies.jwt;
    res.clearCookie("jwt", { httpOnly: true, sameSite: "lax", secure: false });
    const foundUser = await User.findOne({ refreshToken }).exec();

    //Detected refresh token reuse
    if (!foundUser) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        async (
          err: jwt.VerifyErrors | null,
          decoded: jwt.JwtPayload | string | undefined,
        ) => {
          if (!decoded || typeof decoded === "string")
            return res.sendStatus(403);
          if (err) return res.sendStatus(403);
          console.log("attempted refresh token reuse");
          const hackedUser = await User.findOne({
            email: decoded.email,
          }).exec();
          if (!hackedUser) return;
          hackedUser.refreshToken = [];
          const result = await hackedUser.save();
          console.log(result);
        },
      );
      res.sendStatus(403);
      return;
    }

    const newRefreshTokenArray =
      foundUser.refreshToken?.filter((rt) => rt !== refreshToken) ?? [];
    //evaluate jwt
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (
        err: jwt.VerifyErrors | null,
        decoded: jwt.JwtPayload | string | undefined,
      ) => {
        if (err) {
          foundUser.refreshToken = [...newRefreshTokenArray];
          const result = await foundUser.save();
        }
        const payload = decoded as {
          email: string;
        };
        if (err || foundUser.email != payload.email) return res.sendStatus(403);

        // Refresh token was still valid
        const accessToken = jwt.sign(
          {
            UserInfo: {
              email: payload.email,
              id: foundUser._id.toString(),
            },
          },
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: "10m" },
        );

        const newRefreshToken = jwt.sign(
          { email: foundUser.email },
          process.env.REFRESH_TOKEN_SECRET as string,
          { expiresIn: "15m" },
        );
        //Saving refreshToken with current user
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundUser.save();

        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 20 * 1000,
        });
        res.json({ accessToken });
      },
    );
  },
);
const handleLogout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt.trim();
  const foundUser = await User.findOne({
    refreshToken: { $in: [refreshToken] },
  }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res.sendStatus(403);
  }

  foundUser.refreshToken =
    foundUser.refreshToken?.filter((rt) => rt !== refreshToken) ?? [];
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(204).json({ message: "Cookie cleared" });
};

export { handleLogin, handleLogout, handleRefresh, handleRegister };
