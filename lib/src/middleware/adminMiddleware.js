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
exports.adminMiddleware = void 0;
const node_path_1 = __importDefault(require("node:path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sqlite3 = require("sqlite3").verbose();
// my database
const mydpPath = node_path_1.default.resolve(__dirname, "../../../", "model/learnhub.db");
const db = new sqlite3.Database(mydpPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        return console.log(err);
});
function adminMiddleware(req, res, next) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = req.session.token ||
                ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "")) ||
                (
                // @ts-ignore
                (_b = req.headers.Authorization) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
            if (!token) {
                return res.redirect("/users/login");
            }
            else {
                const decoded = jsonwebtoken_1.default.verify(token, "your-secret-key");
                const queryIsAdmin = `SELECT isAdmin FROM users_details WHERE userId = ?`;
                const isAdminPropertyFromDatabase = {};
                const selectedIsAdmin = yield new Promise((resolve, reject) => {
                    db.all(queryIsAdmin, [decoded.userId], (err, isAdminReturned) => {
                        if (err) {
                            reject(res.status(500).json({
                                message: `isAdmin not found`,
                            }));
                        }
                        else {
                            resolve(Object.assign(isAdminPropertyFromDatabase, ...isAdminReturned));
                        }
                    });
                });
                if (isAdminPropertyFromDatabase.isAdmin === "null") {
                    return res.redirect("/users/login");
                }
                else {
                    //req.user?.userId; // Attach the user to the request for further use
                    //req.fullname;
                    req.user = { userId: req.user.userId }; // Attach the user to the request for further use
                    req.fullname = req.fullname;
                    next();
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.adminMiddleware = adminMiddleware;
