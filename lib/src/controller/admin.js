"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserFunction = exports.deleteCourseFunction = exports.updateCourseFunction = exports.updatedCourseDisplayFunction = exports.createNewCourseFunction = exports.createNewCourseDisplayFunction = exports.adminDashboardDisplay = void 0;
const zod_1 = require("zod");
const node_path_1 = __importDefault(require("node:path"));
const uuidFunction_1 = require("./uuidFunction");
const node_fs_1 = __importDefault(require("node:fs"));
const sqlite3 = require("sqlite3").verbose();
// my database
const mydpPath = node_path_1.default.resolve(__dirname, "../../../", "model/learnhub.db");
const db = new sqlite3.Database(mydpPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        return console.log(err);
});
function adminDashboardDisplay(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const queryAllCourse = `SELECT * FROM course_details`;
            const course_details = yield new Promise((resolve, reject) => {
                db.all(queryAllCourse, function (err, course_details) {
                    if (err) {
                        reject(err); // Reject with the error
                    }
                    else {
                        resolve(course_details); // Resolve with the data
                    }
                });
            });
            const queryAllUser = `SELECT * FROM users_details WHERE isAdmin = ?`;
            const user_details = yield new Promise((resolve, reject) => {
                db.all(queryAllUser, ["null"], function (err, user_details) {
                    if (err) {
                        reject(err); // Reject with the error
                    }
                    else {
                        resolve(user_details); // Resolve with the data
                    }
                });
            });
            res.render("admin_dashboard", { course_details, user_details });
        }
        catch (error) {
            res.render("notes", { error }); // Render an error message
        }
    });
}
exports.adminDashboardDisplay = adminDashboardDisplay;
// display add new course page
const createNewCourseDisplayFunction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render("add_new_course", {});
    }
    catch (error) { }
});
exports.createNewCourseDisplayFunction = createNewCourseDisplayFunction;
const newCourseObjectSchema = zod_1.z.object({
    course_title: zod_1.z
        .string({
        required_error: "Course title needs to be provided",
        invalid_type_error: "Course title needs to be a string",
    })
        .trim()
        .min(2, "Title need to have a min length of 2")
        .max(255, "Title cannot exceed 255 characters"),
    course_video_url: zod_1.z.string({
        required_error: "course video/image link needs to be provided",
        invalid_type_error: "Course video needs to be a string",
    }),
    price: zod_1.z.string().min(2),
    course_description: zod_1.z.string({
        required_error: "Course description needs to be provided",
        invalid_type_error: "Course description needs to be a string",
    }),
    course_language: zod_1.z.string({
        required_error: "Course language needs to be provided",
        invalid_type_error: "Course language needs to be a string",
    }),
    course_category: zod_1.z.string({
        required_error: "Course category needs to be provided",
        invalid_type_error: "Course category needs to be a string",
    }),
});
//const strictNewCourseObjectSchema = newCourseObjectSchema.strict();
// add new course function
const createNewCourseFunction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const validation = newCourseObjectSchema.parse(req.body);
        const { course_title, course_video_url, price, course_description, course_language, course_category, } = validation;
        const InsertPrice = parseFloat(price);
        /*getting the user id from the authenticate middleware so
          that the current userid can be append to the note created*/
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const adminWhoCreateCourse = req.fullname;
        const course_thumbnail_image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.filename;
        const course_thumbnail_name = (_c = req.file) === null || _c === void 0 ? void 0 : _c.filename;
        const dateAdded = new Date().toString();
        // console.log(dateAdded.toString())
        const generateCourseID = (0, uuidFunction_1.generateUUID)().slice(9, 13);
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
        }
        else {
            const createNewCourse = yield new Promise((resolve, reject) => {
                db.run(sql, [
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
                ], function (err) {
                    if (err) {
                        console.log("sqlite", err);
                        reject(err);
                    }
                    else {
                        console.log("success here is the detail");
                        resolve(`new course with ${course_title} created successfully`);
                        const token = req.session.token;
                        req.user = { userId };
                        // res.redirect("/admin/dashboard");
                    }
                });
            });
            res.json({
                createNewCourse,
            });
        }
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const zodErrorMessage = error.issues.map((issue) => issue.message);
            res.json({
                zodErrorMessage,
            });
        }
        else if (error &&
            error.code === "SQLITE_CONSTRAINT" &&
            error.message.includes("UNIQUE constraint failed")) {
            res.json({ sqliteError: `Course title already exists` });
        }
        else {
            console.log("I have", error);
        }
    }
});
exports.createNewCourseFunction = createNewCourseFunction;
// edit course display page
const updatedCourseDisplayFunction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = req.params.id;
        const editQuery = `SELECT * FROM course_details WHERE courseId = ?`;
        const courseToEditDisplay = {};
        const displayDeleteCourseInfo = yield new Promise((resolve, reject) => {
            db.all(editQuery, [courseId], function (err, courseDetailFromDatabase) {
                if (err) {
                    reject(`Error fetching course detail`);
                }
                else {
                    resolve(Object.assign(courseToEditDisplay, ...courseDetailFromDatabase));
                }
            });
        });
        const imageFromPc = courseToEditDisplay.course_thumbnail_name;
        console.log("before", courseToEditDisplay.course_category);
        console.log("after", imageFromPc);
        return res.render("edit_course", { courseToEditDisplay, imageFromPc });
    }
    catch (error) { }
});
exports.updatedCourseDisplayFunction = updatedCourseDisplayFunction;
// update course schema
const updateCourseObjectSchema = zod_1.z.object({
    course_title: zod_1.z
        .string({
        required_error: "Course title needs to be provided",
        invalid_type_error: "Course title needs to be a string",
    })
        .trim()
        .min(2, "Title need to have a min length of 2")
        .max(255, "Title need to have a max length of 255"),
    course_video_url: zod_1.z.string({
        required_error: "course video/image link needs to be provided",
        invalid_type_error: "Course video needs to be a string",
    }),
    courseId: zod_1.z.string(),
    price: zod_1.z.string().min(2),
    course_description: zod_1.z.string({
        required_error: "Course description needs to be provided",
        invalid_type_error: "Course description needs to be a string",
    }),
    course_language: zod_1.z.string({
        required_error: "Course language needs to be provided",
        invalid_type_error: "Course language needs to be a string",
    }),
    course_category: zod_1.z.string({
        required_error: "Course category needs to be provided",
        invalid_type_error: "Course category needs to be a string",
    }),
});
// new note middle control
const updateCourseFunction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        const validation = updateCourseObjectSchema.parse(req.body);
        console.log(req.body);
        const { course_title, course_video_url, price, courseId, course_description, course_language, course_category, } = validation;
        const InsertPrice = parseFloat(price);
        const last_updated = new Date().toString();
        const course_thumbnail_image = (_d = req.file) === null || _d === void 0 ? void 0 : _d.filename;
        const course_thumbnail_name = (_e = req.file) === null || _e === void 0 ? void 0 : _e.filename;
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
        const insertUpdateCourse = yield new Promise((resolve, reject) => {
            db.run(sql, [
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
            ], function (err) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.group("I am successful");
                    resolve(`course with Id:${courseId} updated successfully`);
                    //req.jwtSecret = {secretKey: jwtSecret}
                }
            });
        });
        res.json({ courseUpdateMessage: insertUpdateCourse });
        //res.redirect("/admin/dashboard");
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const zodErrorMessage = error.issues.map((issue) => issue.message);
            res.json({
                zodErrorMessage,
            });
        }
        else if (error &&
            error.code === "SQLITE_CONSTRAINT" &&
            error.message.includes("UNIQUE constraint failed")) {
            res.json({ sqliteError: `Course title already exists` });
        }
    }
});
exports.updateCourseFunction = updateCourseFunction;
// delete course page
const deleteCourseFunction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, course_title } = req.body;
        // getting the file name for deletion
        const fileNameSql = `SELECT course_thumbnail_name FROM course_details WHERE courseId = ?`;
        const filenameFromDatabaseObject = {};
        const deleteFileOnPc = yield new Promise((resolve, reject) => {
            db.all(fileNameSql, [courseId], (err, filenameFromDatabase) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log("Filename", filenameFromDatabase);
                    resolve(Object.assign(filenameFromDatabaseObject, ...filenameFromDatabase));
                }
            });
        });
        const deleteSql = `DELETE FROM course_details WHERE courseId = ?`;
        const deleteCourse = yield new Promise((resolve, reject) => {
            db.run(deleteSql, [courseId], (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    const filePath = node_path_1.default.resolve(__dirname, "../../../", "uploads", `${filenameFromDatabaseObject.course_thumbnail_name}`);
                    console.log(filePath);
                    // Use fs.unlink to delete the file
                    node_fs_1.default.unlink(filePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                        }
                        else {
                            console.log("File deleted successfully");
                        }
                    });
                    resolve(`course ${course_title} deleted successfully`);
                }
            });
        });
        res.json({ deletedMessage: deleteCourse });
        // return res.redirect("/admin/dashboard");
    }
    catch (error) {
        res.json({
            message: error,
        });
    }
});
exports.deleteCourseFunction = deleteCourseFunction;
// delete course page
const deleteUserFunction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, user_name } = req.body;
        console.log("1", userId);
        console.log("2", user_name);
        const deleteSql = `DELETE FROM users_details WHERE userId = ?`;
        const deleteUser = yield new Promise((resolve, reject) => {
            db.run(deleteSql, [userId], (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(`user ${user_name} deleted successfully`);
                }
            });
        });
        res.json({ deletedMessage: deleteUser });
        // return res.redirect("/admin/dashboard");
    }
    catch (error) {
        res.json({
            message: error,
        });
    }
});
exports.deleteUserFunction = deleteUserFunction;
