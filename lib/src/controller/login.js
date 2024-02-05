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
exports.handleUserLogin = exports.loginPage = void 0;
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_path_1 = __importDefault(require("node:path"));
const sqlite3 = require("sqlite3").verbose();
// my database
const mydpPath = node_path_1.default.resolve(__dirname, "../../../", "model/learnhub.db");
const db = new sqlite3.Database(mydpPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        return console.log(err);
});
function loginPage(req, res, next) {
    res.render("login", {});
}
exports.loginPage = loginPage;
// Zod to validate
const userSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        required_error: "email needs to be provided",
        invalid_type_error: "email needs to be a string",
    })
        .email(),
    password: zod_1.z
        .string({
        required_error: "password needs to be provided",
        invalid_type_error: "password needs to be a string",
    })
        .min(6, "password must be at least 6 characters"),
});
const strictNewUserSchema = userSchema.strict();
function handleUserLogin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const validation = strictNewUserSchema.parse(req.body);
            const { email, password } = validation;
            // checking the database for the record of that user
            const sql = `SELECT * FROM users_details WHERE email = ?;`;
            //   this is now an array of object for each record
            const userDetailFromDatabase = {};
            const selectEmailFromDatabase = yield new Promise((resolve, reject) => {
                db.all(sql, [email], (err, users) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(Object.assign(userDetailFromDatabase, ...users));
                    }
                });
            });
            //unauthorized, kindly sign up or request access from admin;
            if (userDetailFromDatabase.email !== email) {
                return res.json({
                    noSuchUserError: `User with email ${email} does not exist,`,
                });
            }
            else {
                //   if that user exist, check for password
                const matchPassword = yield bcrypt_1.default.compare(password, userDetailFromDatabase.password);
                if (!matchPassword) {
                    const invalidPassword = `Invalid password, kindly try again`;
                    res.render("login", { invalidPassword: invalidPassword });
                }
                else {
                    const token = jsonwebtoken_1.default.sign({ userId: userDetailFromDatabase.userId }, "your-secret-key", { expiresIn: "1h" });
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
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const zodErrorMessage = error.issues.map((issue) => issue.message);
                res.json({ zodErrorMessage });
            }
            else {
                console.log("This is an ", error);
                res.json({ unknownError: error });
            }
        }
    });
}
exports.handleUserLogin = handleUserLogin;
