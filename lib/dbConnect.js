// Importing MySQL module
const mysql = require("mysql");

let dbConnect = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATDATABASE_PASSWORD,
  database: process.env.DATABASE,
});

// Connect to MySQL server
dbConnect.connect((err) => {
  if (err) {
    console.log("\x1b[41mDatabase Connection Failed " + err + "\x1b[0m");
  } else {
    console.log("\x1b[44mconnected to Database\x1b[0m");
  }
});

module.exports = dbConnect;
