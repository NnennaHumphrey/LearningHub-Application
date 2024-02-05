import { AuthenticatedRequest } from "../../express";
import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "node:path";
import jwt from "jsonwebtoken";

const sqlite3 = require("sqlite3").verbose();
// my database
const mydpPath = path.resolve(__dirname, "../../../", "model/learnhub.db");
const db = new sqlite3.Database(
  mydpPath,
  sqlite3.OPEN_READWRITE,
  (err: any) => {
    if (err) return console.log(err);
  }
);

async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.session.token ||
      req.headers.authorization?.replace("Bearer ", "") ||
      // @ts-ignore
      req.headers.Authorization?.replace("Bearer ", "");
    if (!token) {
      return res.redirect("/users/login");
    } else {
      const decoded = jwt.verify(token, "your-secret-key") as {
        userId: string;
      };
      const queryUser = `SELECT userId, full_name FROM users_details WHERE userId = ?`;
      const userIdFromDatabase: Record<string, string> = {};
      const selectedUserId: Record<string, string>[] = await new Promise(
        (resolve, reject) => {
          db.all(
            queryUser,
            [decoded.userId],
            (err: Error, userReturned: Record<string, string>[]) => {
              if (err) {
                reject(
                  res.status(500).json({
                    message: `userId not found`,
                  })
                );
              } else {
                resolve(Object.assign(userIdFromDatabase, ...userReturned));
              }
            }
          );
        }
      );

      if (!userIdFromDatabase) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        // get userid from the login and passing to the next function
        req.user = { userId: userIdFromDatabase.userId }; // Attach the user to the request for further use
        req.fullname = userIdFromDatabase.full_name;
        // const userDetailFromDatabase = req.login?.userDetailFromDatabase;
        // console.log("This",userDetailFromDatabase);

        next();
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export { authenticate };
