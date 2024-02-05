const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("learnhub.db", (err) => {
  if (err) return console.log(err);
});

const user_table = `CREATE TABLE users_details (
    userId TEXT PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    gender VARCHAR(30),
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_no CHAR(14) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    isAdmin VARCHAR(5)

)`;

const course_table = `CREATE TABLE course_details (
    courseId TEXT PRIMARY KEY,
    userId TEXT,
    full_name VARCHAR(50), 
    course_title VARCHAR(255) NOT NULL UNIQUE,
    course_video_url TEXT NOT NULL, 
    course_description TEXT,
    price NUMERIC,
    course_category TEXT NOT NULL,
    course_language TEXT,
    date_added DATE,
    last_updated DATE,
    total_no_of_enrollment INTEGER,
    course_thumbnail_image,
    course_thumbnail_name,
    FOREIGN KEY (userId) REFERENCES users_details(userId),
    FOREIGN KEY (full_name) REFERENCES users_details(full_name),
    FOREIGN KEY (total_no_of_enrollment) REFERENCES course_enrollment (courseId)
)`;

const enrollment_table = `CREATE TABLE course_enrollment (
    enrollment_Id TEXT PRIMARY KEY,
    courseId TEXT, 
    course_title VARCHAR(255) NOT NULL,
    userId TEXT,
    FOREIGN KEY (userId) REFERENCES users_details(userId),
    FOREIGN KEY (courseId) REFERENCES course_details(courseId),
    FOREIGN KEY (course_title) REFERENCES course_details(course_title)
)`;

db.run(user_table, (err) => {
  if (err) console.log(err);
  else {
    console.log("user_table created successfully");
  }
});
db.run(course_table, (err) => {
  if (err) console.log(err);
  else {
    console.log("course_table created successfully");
  }
});
db.run(enrollment_table, (err) => {
  if (err) console.log(err);
  else {
    console.log("enrollment_table created successfully");
  }
});

db.close();
