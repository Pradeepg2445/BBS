require("dotenv").config();
const express = require("express");

const nodemailer = require("nodemailer");
const app = express();
const EMAIL_PORT = process.env.EMAIL_SERVER_PORT;
var today = new Date();

var cors = require("cors");
app.use(cors());

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/send_mail", function (req, res) {
  let emailId = req.body.email;
  let subject = req.body.subject;
  let html = req.body.html;
  var tranporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  var maiOptions = {
    from: process.env.EMAIL_ID,
    to: emailId,
    subject: subject,
    html: html,
  };
  tranporter.sendMail(maiOptions, function (error, info) {
    if (error) {
      console.log("Error while send email - " + error);
      process.exit(1);
    } else {
      console.log("Email was send to " + emailId);

      res.send("1");
    }
  });
});

app.listen(EMAIL_PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", EMAIL_PORT);
});
