import createError from "http-errors";
import express, {
  Request as ExpressRequest,
  Request,
  Response,
  NextFunction,
} from "express";
import { ZodError, z } from "zod";
import bcrypt from "bcrypt";
import path from "node:path";
import { generateUUID } from "./uuidFunction";

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

export function signupPage(req: Request, res: Response, next: NextFunction) {
  res.render("signup", {});
}

// new user schema
const newUserSchema = z.object({
  full_name: z
    .string({
      required_error: "fullname needs to be provided",
      invalid_type_error: "fullname needs to be a string",
    })
    .trim()
    .min(2, "fullname need to have a min length of 2")
    .max(50, "fullname need to have a max length of 50"),
  email: z
    .string({
      required_error: "email needs to be provided",
      invalid_type_error: "email needs to be a string",
    })
    .email(),
  gender: z.string().max(6),
  phone_no: z.string().max(14),
  password: z
    .string({
      required_error: "password needs to be provided",
      invalid_type_error: "pass needs to be a string",
    })
    .min(6, "password must be at least 6 characters"),
});
// const strictNewUserSchema = newUserSchema.strict();

export async function signupUserFunction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validation = newUserSchema.parse(req.body);
    const { full_name, gender, email, phone_no, password } = validation;
    const { isAdmin } = req.body;
    const insertIsAdmin = isAdmin === "true" ? "true" : "null";
    //console.log(isAdmin);
    // Check for duplicate email
    const sql = `SELECT email FROM users_details`;
    const selectEmailFromDatabase: Record<string, string>[] = await new Promise(
      (resolve, reject) => {
        db.all(sql, (error: Error, users: Record<string, string>[]) => {
          if (error) {
            reject(error);
          } else {
            resolve(users);
          }
        });
      }
    );
    //res.render("signup", { selectEmailFromDatabase})
    const checkDuplicateemail = selectEmailFromDatabase.find(
      (element: Record<string, string>) => element.Email === email
    );
    // checking if the email already exists
    if (checkDuplicateemail) {
      res.json({ EmailExistError: `User with ${email} already exist` });
    } else {
      // Encrypt password
      const hashedPassword = await bcrypt.hash(password, 10);
      const generateUserID: string = generateUUID();
      //const generateAdminId: boolean = true;
      //   const idToInsert =
      //     generateUserID === null ? generateAdminId : generateUserID;
      // Store the new user
      const insertSql = `INSERT INTO users_details (
          userId, 
          full_name,
          gender, 
          email, 
          phone_no, 
          password,
          isAdmin
         ) 
         VALUES (?,?,?,?,?,?,?)`;
      const insertUserDetailIntoDatabase = await new Promise(
        (resolve, reject) => {
          db.run(
            insertSql,
            [
              generateUserID,
              full_name,
              gender,
              email,
              phone_no,
              hashedPassword,
              insertIsAdmin,
            ],
            function (err: Error) {
              if (err) {
                // return `Error in database operation: ${err}`;
                reject(err);
              } else {
                resolve(`New User with ${email} created`);
              }
            }
          );
        }
      );
      // res.json({
      //   message: insertUserDetailIntoDatabase,
      // });
      console.log(insertUserDetailIntoDatabase);
      res.json({ insertUserDetailIntoDatabase });
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodErrorMessage = error.issues.map((issue) => issue.message);
      res.json({ zodErrorMessage });
    } else if (
      error &&
      error.code === "SQLITE_CONSTRAINT" &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      if (error.message.includes("users_details.phone_no")) {
        const phoneNoError = ` user with phone number already exist`;
        res.json({ phoneNoError });
      } else if (error.message.includes("users_details.email")) {
        const EmailExistError = `user with email already exist`;
        res.json({ EmailExistError });
      } else {
        const unknownError = `something went wrong, hold we will fix it soon`;
        res.json({ unknownError });
      }
    }
  }
}
