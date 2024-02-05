import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
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

export async function displayLearnerDashboard(
  req: AuthenticatedRequest,
  res: Response
) {
  const queryAllCourse = `SELECT * FROM course_details`;
  const allCoursesFromDatabase = await new Promise((resolve, reject) => {
    db.all(
      queryAllCourse,
      (err: Error, allCoursesFromDatabase: Record<string, any>[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(allCoursesFromDatabase);
        }
      }
    );
  });

  res.render("learner_dashboard", { allCoursesFromDatabase });
}
