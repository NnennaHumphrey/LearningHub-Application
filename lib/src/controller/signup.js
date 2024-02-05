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
exports.signupUserFunction = exports.signupPage = void 0;
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const node_path_1 = __importDefault(require("node:path"));
const uuidFunction_1 = require("./uuidFunction");
const sqlite3 = require("sqlite3").verbose();
// my database
const mydpPath = node_path_1.default.resolve(__dirname, "../../../", "model/learnhub.db");
const db = new sqlite3.Database(mydpPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        return console.log(err);
});
function signupPage(req, res, next) {
    res.render("signup", {});
}
exports.signupPage = signupPage;
// new user schema
const newUserSchema = zod_1.z.object({
    full_name: zod_1.z
        .string({
        required_error: "fullname needs to be provided",
        invalid_type_error: "fullname needs to be a string",
    })
        .trim()
        .min(2, "fullname need to have a min length of 2")
        .max(50, "fullname need to have a max length of 50"),
    email: zod_1.z
        .string({
        required_error: "email needs to be provided",
        invalid_type_error: "email needs to be a string",
    })
        .email(),
    gender: zod_1.z.string().max(6),
    phone_no: zod_1.z.string().max(14),
    password: zod_1.z
        .string({
        required_error: "password needs to be provided",
        invalid_type_error: "pass needs to be a string",
    })
        .min(6, "password must be at least 6 characters"),
});
// const strictNewUserSchema = newUserSchema.strict();
function signupUserFunction(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const validation = newUserSchema.parse(req.body);
            const { full_name, gender, email, phone_no, password } = validation;
            const { isAdmin } = req.body;
            const insertIsAdmin = isAdmin === "true" ? "true" : "null";
            //console.log(isAdmin);
            // Check for duplicate email
            const sql = `SELECT email FROM users_details`;
            const selectEmailFromDatabase = yield new Promise((resolve, reject) => {
                db.all(sql, (error, users) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(users);
                    }
                });
            });
            //res.render("signup", { selectEmailFromDatabase})
            const checkDuplicateemail = selectEmailFromDatabase.find((element) => element.Email === email);
            // checking if the email already exists
            if (checkDuplicateemail) {
                res.json({ EmailExistError: `User with ${email} already exist` });
            }
            else {
                // Encrypt password
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const generateUserID = (0, uuidFunction_1.generateUUID)();
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
                const insertUserDetailIntoDatabase = yield new Promise((resolve, reject) => {
                    db.run(insertSql, [
                        generateUserID,
                        full_name,
                        gender,
                        email,
                        phone_no,
                        hashedPassword,
                        insertIsAdmin,
                    ], function (err) {
                        if (err) {
                            // return `Error in database operation: ${err}`;
                            reject(err);
                        }
                        else {
                            resolve(`New User with ${email} created`);
                        }
                    });
                });
                // res.json({
                //   message: insertUserDetailIntoDatabase,
                // });
                console.log(insertUserDetailIntoDatabase);
                res.json({ insertUserDetailIntoDatabase });
            }
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const zodErrorMessage = error.issues.map((issue) => issue.message);
                res.json({ zodErrorMessage });
            }
            else if (error &&
                error.code === "SQLITE_CONSTRAINT" &&
                error.message.includes("UNIQUE constraint failed")) {
                if (error.message.includes("users_details.phone_no")) {
                    const phoneNoError = ` user with phone number already exist`;
                    res.json({ phoneNoError });
                }
                else if (error.message.includes("users_details.email")) {
                    const EmailExistError = `user with email already exist`;
                    res.json({ EmailExistError });
                }
                else {
                    const unknownError = `something went wrong, hold we will fix it soon`;
                    res.json({ unknownError });
                }
            }
        }
    });
}
exports.signupUserFunction = signupUserFunction;
