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
exports.displayIndexPage = void 0;
const node_path_1 = __importDefault(require("node:path"));
const sqlite3 = require("sqlite3").verbose();
// my database
const mydpPath = node_path_1.default.resolve(__dirname, "../../../", "model/learnhub.db");
const db = new sqlite3.Database(mydpPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        return console.log(err);
});
function displayIndexPage(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const userDetailFromDatabase = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userDetailFromDatabase;
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
        res.render("index", { userDetailFromDatabase, course_details });
    });
}
exports.displayIndexPage = displayIndexPage;
