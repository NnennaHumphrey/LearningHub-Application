import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../express";
import path from "node:path";
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
export async function displayIndexPage(
  req: AuthenticatedRequest,
  res: Response
) {
  const userDetailFromDatabase = req.session?.userDetailFromDatabase;
  const queryAllCourse = `SELECT * FROM course_details`;
  const course_details = await new Promise<any[]>((resolve, reject) => {
    db.all(
      queryAllCourse,
      function (err: Error, course_details: Record<string, any>[]) {
        if (err) {
          reject(err); // Reject with the error
        } else {
          resolve(course_details); // Resolve with the data
        }
      }
    );
  });
  res.render("index", { userDetailFromDatabase, course_details });
}
