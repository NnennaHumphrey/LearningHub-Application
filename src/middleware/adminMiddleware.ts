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

async function adminMiddleware(
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
      const queryIsAdmin = `SELECT isAdmin FROM users_details WHERE userId = ?`;
      const isAdminPropertyFromDatabase: Record<string, string> = {};
      const selectedIsAdmin: Record<string, string>[] = await new Promise(
        (resolve, reject) => {
          db.all(
            queryIsAdmin,
            [decoded.userId],
            (err: Error, isAdminReturned: Record<string, string>[]) => {
              if (err) {
                reject(
                  res.status(500).json({
                    message: `isAdmin not found`,
                  })
                );
              } else {
                resolve(
                  Object.assign(isAdminPropertyFromDatabase, ...isAdminReturned)
                );
              }
            }
          );
        }
      );

      if (isAdminPropertyFromDatabase.isAdmin === "null") {
        return res.redirect("/users/login");
      } else {
        //req.user?.userId; // Attach the user to the request for further use
        //req.fullname;
        req.user = { userId: req.user!.userId }; // Attach the user to the request for further use
        req.fullname = req.fullname;
        next();
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export { adminMiddleware };
