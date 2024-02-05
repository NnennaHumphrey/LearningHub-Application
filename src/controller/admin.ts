import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import path from "node:path";
import { generateUUID } from "./uuidFunction";
import { AuthenticatedRequest } from "../../express";
import fs from "node:fs";

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

export async function adminDashboardDisplay(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
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
    const queryAllUser = `SELECT * FROM users_details WHERE isAdmin = ?`;
    const user_details = await new Promise<any[]>((resolve, reject) => {
      db.all(
        queryAllUser,
        ["null"],
        function (err: Error, user_details: Record<string, any>[]) {
          if (err) {
            reject(err); // Reject with the error
          } else {
            resolve(user_details); // Resolve with the data
          }
        }
      );
    });

    res.render("admin_dashboard", { course_details, user_details });
  } catch (error) {
    res.render("notes", { error }); // Render an error message
  }
}

// display add new course page
export const createNewCourseDisplayFunction = async (
  req: Request,
  res: Response
) => {
  try {
    res.render("add_new_course", {});
  } catch (error) {}
};

const newCourseObjectSchema = z.object({
  course_title: z
    .string({
      required_error: "Course title needs to be provided",
      invalid_type_error: "Course title needs to be a string",
    })
    .trim()
    .min(2, "Title need to have a min length of 2")
    .max(255, "Title cannot exceed 255 characters"),
  course_video_url: z.string({
    required_error: "course video/image link needs to be provided",
    invalid_type_error: "Course video needs to be a string",
  }),
  price: z.string().min(2),
  course_description: z.string({
    required_error: "Course description needs to be provided",
    invalid_type_error: "Course description needs to be a string",
  }),
  course_language: z.string({
    required_error: "Course language needs to be provided",
    invalid_type_error: "Course language needs to be a string",
  }),
  course_category: z.string({
    required_error: "Course category needs to be provided",
    invalid_type_error: "Course category needs to be a string",
  }),
});
//const strictNewCourseObjectSchema = newCourseObjectSchema.strict();

// add new course function
export const createNewCourseFunction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = newCourseObjectSchema.parse(req.body);
    const {
      course_title,
      course_video_url,
      price,
      course_description,
      course_language,
      course_category,
    } = validation;
    const InsertPrice = parseFloat(price);

    /*getting the user id from the authenticate middleware so
      that the current userid can be append to the note created*/

    const userId = req.user?.userId;
    const adminWhoCreateCourse = req.fullname;
    const course_thumbnail_image = req.file?.filename;
    const course_thumbnail_name = req.file?.filename;
    const dateAdded = new Date().toString();
    // console.log(dateAdded.toString())
    const generateCourseID = generateUUID().slice(9, 13);
    const sql = `INSERT INTO course_details (
        courseId,
        userId,
        full_name,
        course_title, 
        course_video_url, 
        course_description,
        price,
        course_category,
        date_added,
        last_updated,
        course_language,
        course_thumbnail_image,
        course_thumbnail_name
      ) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    if (userId === undefined) {
      console.log("2, i got here now");
      const undefinedUserId = `userId undefined, I don't know how you get here`;
    } else {
      const createNewCourse = await new Promise((resolve, reject) => {
        db.run(
          sql,
          [
            generateCourseID,
            userId,
            adminWhoCreateCourse,
            course_title,
            course_video_url,
            course_description,
            InsertPrice,
            course_category,
            dateAdded,
            dateAdded,
            course_language,
            course_thumbnail_image,
            course_thumbnail_name,
          ],
          function (err: any) {
            if (err) {
              console.log("sqlite", err);
              reject(err);
            } else {
              console.log("success here is the detail");
              resolve(`new course with ${course_title} created successfully`);
              const token = req.session.token;
              req.user = { userId };
              // res.redirect("/admin/dashboard");
            }
          }
        );
      });

      res.json({
        createNewCourse,
      });
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodErrorMessage = error.issues.map((issue) => issue.message);
      res.json({
        zodErrorMessage,
      });
    } else if (
      error &&
      error.code === "SQLITE_CONSTRAINT" &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      res.json({ sqliteError: `Course title already exists` });
    } else {
      console.log("I have", error);
    }
  }
};

// edit course display page
export const updatedCourseDisplayFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = req.params.id;

    const editQuery = `SELECT * FROM course_details WHERE courseId = ?`;
    const courseToEditDisplay: Record<string, any> = {};
    const displayDeleteCourseInfo = await new Promise((resolve, reject) => {
      db.all(
        editQuery,
        [courseId],
        function (err: any, courseDetailFromDatabase: Record<string, any>[]) {
          if (err) {
            reject(`Error fetching course detail`);
          } else {
            resolve(
              Object.assign(courseToEditDisplay, ...courseDetailFromDatabase)
            );
          }
        }
      );
    });
    const imageFromPc = courseToEditDisplay.course_thumbnail_name;

    console.log("before", courseToEditDisplay.course_category);
    console.log("after", imageFromPc);
    return res.render("edit_course", { courseToEditDisplay, imageFromPc });
  } catch (error) {}
};
// update course schema
const updateCourseObjectSchema = z.object({
  course_title: z
    .string({
      required_error: "Course title needs to be provided",
      invalid_type_error: "Course title needs to be a string",
    })
    .trim()
    .min(2, "Title need to have a min length of 2")
    .max(255, "Title need to have a max length of 255"),
  course_video_url: z.string({
    required_error: "course video/image link needs to be provided",
    invalid_type_error: "Course video needs to be a string",
  }),
  courseId: z.string(),
  price: z.string().min(2),
  course_description: z.string({
    required_error: "Course description needs to be provided",
    invalid_type_error: "Course description needs to be a string",
  }),
  course_language: z.string({
    required_error: "Course language needs to be provided",
    invalid_type_error: "Course language needs to be a string",
  }),
  course_category: z.string({
    required_error: "Course category needs to be provided",
    invalid_type_error: "Course category needs to be a string",
  }),
});

// new note middle control
export const updateCourseFunction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = updateCourseObjectSchema.parse(req.body);
    console.log(req.body);
    const {
      course_title,
      course_video_url,
      price,
      courseId,
      course_description,
      course_language,
      course_category,
    } = validation;
    const InsertPrice = parseFloat(price);
    const last_updated = new Date().toString();
    const course_thumbnail_image = req.file?.filename;
    const course_thumbnail_name = req.file?.filename;
    console.log("my thumb", course_thumbnail_image);
    /*getting the user id from the authenticate middleware so
      that the current userid can be append to the note created*/
    const sql = `UPDATE course_details 
      SET
        course_title = ?,
        course_video_url = ?,
        course_description = ?,
        price = ?,
        course_category = ?,
        last_updated = ?,
        course_language = ?,
        course_thumbnail_image = ?,
        course_thumbnail_name = ?
      WHERE
        courseId = ?
    `;
    const insertUpdateCourse = await new Promise((resolve, reject) => {
      db.run(
        sql,
        [
          course_title,
          course_video_url,
          course_description,
          InsertPrice,
          course_category,
          last_updated,
          course_language,
          course_thumbnail_image,
          course_thumbnail_name,
          courseId,
        ],
        function (err: Error) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.group("I am successful");
            resolve(`course with Id:${courseId} updated successfully`);
            //req.jwtSecret = {secretKey: jwtSecret}
          }
        }
      );
    });
    res.json({ courseUpdateMessage: insertUpdateCourse });
    //res.redirect("/admin/dashboard");
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodErrorMessage = error.issues.map((issue) => issue.message);
      res.json({
        zodErrorMessage,
      });
    } else if (
      error &&
      error.code === "SQLITE_CONSTRAINT" &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      res.json({ sqliteError: `Course title already exists` });
    }
  }
};

// delete course page
export const deleteCourseFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, course_title } = req.body;

    // getting the file name for deletion
    const fileNameSql = `SELECT course_thumbnail_name FROM course_details WHERE courseId = ?`;
    const filenameFromDatabaseObject: Record<string, string> = {};
    const deleteFileOnPc = await new Promise((resolve, reject) => {
      db.all(
        fileNameSql,
        [courseId],
        (err: Error, filenameFromDatabase: Record<string, string>[]) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log("Filename", filenameFromDatabase);
            resolve(
              Object.assign(filenameFromDatabaseObject, ...filenameFromDatabase)
            );
          }
        }
      );
    });

    const deleteSql = `DELETE FROM course_details WHERE courseId = ?`;
    const deleteCourse = await new Promise((resolve, reject) => {
      db.run(deleteSql, [courseId], (err: Error) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          const filePath = path.resolve(
            __dirname,
            "../../../",
            "uploads",
            `${filenameFromDatabaseObject.course_thumbnail_name}`
          );
          console.log(filePath);
          // Use fs.unlink to delete the file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            } else {
              console.log("File deleted successfully");
            }
          });
          resolve(`course ${course_title} deleted successfully`);
        }
      });
    });

    res.json({ deletedMessage: deleteCourse });
    // return res.redirect("/admin/dashboard");
  } catch (error) {
    res.json({
      message: error,
    });
  }
};

// delete course page
export const deleteUserFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, user_name } = req.body;
    console.log("1", userId);
    console.log("2", user_name);
    const deleteSql = `DELETE FROM users_details WHERE userId = ?`;
    const deleteUser = await new Promise((resolve, reject) => {
      db.run(deleteSql, [userId], (err: Error) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(`user ${user_name} deleted successfully`);
        }
      });
    });

    res.json({ deletedMessage: deleteUser });
    // return res.redirect("/admin/dashboard");
  } catch (error) {
    res.json({
      message: error,
    });
  }
};
