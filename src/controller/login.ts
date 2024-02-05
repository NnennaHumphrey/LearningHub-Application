import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import bcrypt from "bcrypt";
import { error } from "console";
import jwt from "jsonwebtoken";
import path from "node:path";
import { AuthenticatedRequest } from "../../express";

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

export function loginPage(req: Request, res: Response, next: NextFunction) {
  res.render("login", {});
}
// Zod to validate
const userSchema = z.object({
  email: z
    .string({
      required_error: "email needs to be provided",
      invalid_type_error: "email needs to be a string",
    })
    .email(),
  password: z
    .string({
      required_error: "password needs to be provided",
      invalid_type_error: "password needs to be a string",
    })
    .min(6, "password must be at least 6 characters"),
});
const strictNewUserSchema = userSchema.strict();
export async function handleUserLogin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const validation = strictNewUserSchema.parse(req.body);
    const { email, password } = validation;

    // checking the database for the record of that user
    const sql = `SELECT * FROM users_details WHERE email = ?;`;
    //   this is now an array of object for each record
    const userDetailFromDatabase: Record<string, any> = {};
    const selectEmailFromDatabase: Record<string, any>[] = await new Promise(
      (resolve, reject) => {
        db.all(sql, [email], (err: Error, users: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(Object.assign(userDetailFromDatabase, ...users));
          }
        });
      }
    );

    //unauthorized, kindly sign up or request access from admin;
    if (userDetailFromDatabase.email !== email) {
      return res.json({
        noSuchUserError: `User with email ${email} does not exist,`,
      });
    } else {
      //   if that user exist, check for password
      const matchPassword = await bcrypt.compare(
        password,
        userDetailFromDatabase.password
      );
      if (!matchPassword) {
        const invalidPassword = `Invalid password, kindly try again`;
        res.render("login", { invalidPassword: invalidPassword });
      } else {
        const token = jwt.sign(
          { userId: userDetailFromDatabase.userId },
          "your-secret-key",
          { expiresIn: "1h" }
        );

        req.session.token = token;
        req.session.userDetailFromDatabase = userDetailFromDatabase;
        // req.user = { userId: userDetailFromDatabase.userId };
        console.log("The useer is", userDetailFromDatabase);
        res.json({ userDetailFromDatabase });
        // if (userDetailFromDatabase.isAdmin === "null") {
        //   res.redirect("/");
        // } else {
        //   res.redirect("/admin/dashboard");
        // }
      }
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodErrorMessage = error.issues.map((issue) => issue.message);
      res.json({ zodErrorMessage });
    } else {
      console.log("This is an ", error);
      res.json({ unknownError: error });
    }
  }
}
