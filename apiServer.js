require("dotenv").config();
const express = require("express");
const app = express();
const API_PORT = process.env.API_SERVER_PORT;
var today = new Date();

var cors = require("cors");
app.use(cors());
let dbConnect = require("./lib/dbConnect.js");
let mysql = require("mysql");

app.set("view engine", "ejs");

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const apiLogger = function (req, res, next) {
  console.info(
    "\x1b[100mConnecting API URL /signup. TIME " +
      today.toLocaleString() +
      "\x1b[0m"
  );
  next();
};
app.use(apiLogger);

function generateRandom(length) {
  let result = "";
  let character =
    "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = character.length;
  for (let i = 0; i < length; i++) {
    result += character.charAt(Math.floor(Math.random() * charactersLength));
  } 
  return result;
}

app.post("/get_data", function (req, res) {
  let sqlQuery = req.body.sqlQuery;
  console.log(sqlQuery);
  dbConnect.query(sqlQuery, 1, (error, results, fields) => {
    if (error) {
      console.log("Db error while selecting " + error.message);
      process.exit(1);
    }
    res.send(results);
  });
});

app.post("/insert_data", function (req, res) {
  let table = req.body.table;
  let index = req.body.index;
  let values = req.body.value;
  let query = `INSERT INTO ` + table + ` (` + index + `) VALUES ` + values;
  console.log(query);
  dbConnect.query(query, (err, rows) => {
    if (err) {
      console.log("Db error while Inserting " + err);
      process.exit(1);
    } else {
      res.send("1");
    }
  });
});

app.post("/update_data", function (req, res) {
  let table = req.body.table;
  let value = req.body.value;
  let conditions = req.body.conditions;
  let query = `UPDATE  ` + table + ` SET ` + value + ` WHERE ` + conditions;
  console.log(query);
  dbConnect.query(query, (err, rows) => {
    if (err) {
      console.log("Db error while Updating " + err);
      process.exit(1);
    } else {
      res.send("1");
    }
  });
});

app.post("/delete_data", function (req, res) {
  let table = req.body.table;
  let conditions = req.body.conditions;
  let query = `DELETE FROM ` + table + ` WHERE  ` + conditions;
  console.log(query);
  dbConnect.query(query, (err, rows) => {
    if (err) {
      console.log("Db error while Deleting " + err);
      process.exit(1);
    } else {
      res.send("1");
    }
  });
});

app.post("/checkEmail", function (req, res) {
  let email = req.body.email;
  let sqlQuery = "SELECT email FROM USER_DETAILS WHERE EMAIL='" + email + "'";

  dbConnect.query(sqlQuery, 1, (error, results, fields) => {
    if (error) {
      console.log("Db error while selecting " + error.message);
      process.exit(1);
    }
    if (Object.keys(results).length == 0) {
      let username = email.split("@")[0];
      dbConnect.query(
        "SELECT userid FROM user_details where userid='" + username + "'",
        1,
        (error, results2, fields) => {
          if (error) {
            console.log("Db error while selecting " + error.message);
            process.exit(1);
          }
          if (Object.keys(results2).length == 0) {
            username = username.slice(0, 25);
            let data = {
              validEmail: "1",
              username: username,
            };
            res.send(data);
          } else {
            username = username + generateRandom(4);
            console.log(username);
            username = username.slice(0, 25);
            console.log(username);
            let data = {
              validEmail: "1",
              username: username,
            };
            res.send(data);
          }
        }
      );
    } else {
      let data = {
        validEmail: "0",
        username: " ",
      };
      res.send(data);
    }
  });
});

app.post("/checkLogin", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  let sqlQuery =
    "SELECT userid,email,password,type,name FROM USER_DETAILS WHERE EMAIL='" +
    email +
    "' and password='" +
    password +
    "'";

  dbConnect.query(sqlQuery, 1, (error, results, fields) => {
    if (error) {
      console.log("Db error while selecting " + error.message);
      process.exit(1);
    }
    if (Object.keys(results).length > 0) {
      let data = {
        success: "1",
        username: results[0].userid,
        type: results[0].type,
        name: results[0].name,
      };
      res.send(data);
    } else {
      let data = {
        success: "0",
        username: "",
        type: "",
        name: "",
      };
      res.send(data);
    }
  });
});

app.post("/send_password", function (req, res) {
  let email = req.body.email;
  let sqlQuery =
    "SELECT userid,email,password FROM USER_DETAILS WHERE EMAIL='" +
    email +
    "'";

  dbConnect.query(sqlQuery, 1, (error, results, fields) => {
    if (error) {
      console.log("Db error while selecting " + error.message);
      process.exit(1);
    }
    if (Object.keys(results).length > 0) {
      if (results[0].email == email) {
        res.send(results[0].password);
      } else {
        res.send("0");
      }
    } else {
      res.send("0");
    }
  });
});

app.listen(API_PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", API_PORT);
});
