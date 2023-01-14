require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser("BBS"));
const cookieOption = {
  maxAge: 60 * 1000 * 60 * 24,
};
const admin = require("./lib/admin.js");
const client = require("./lib/client.js");
const BBS_PORT = process.env.BBS_SERVER_PORT;
const API_PORT = process.env.API_SERVER_PORT;
const EMAIL_PORT = process.env.EMAIL_SERVER_PORT;
var cors = require("cors");
app.use(cors());
var request = require("request");
var today = new Date();
var OTP = 0;
app.set("view engine", "ejs");
app.use("/admin", admin);
app.use("/client", client);

function generateRandom(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

var bodyParser = require("body-parser");
const { Console } = require("winston/lib/winston/transports");
const { MemoryStore } = require("express-session");
const e = require("express");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/bootstrap",express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery"));
app.use("/jquery-confirm",express.static(__dirname + "/node_modules/jquery-confirm"));
app.use("/datatables",express.static(__dirname + "/node_modules/datatables/media"));
app.use("/toast",express.static(__dirname + "/node_modules/jquery-toast-plugin/dist"));
app.use("/select2", express.static(__dirname + "/node_modules/select2/dist"));
app.use("/font-awesome",express.static(__dirname + "/node_modules/font-awesome"));
app.use("/base-css", express.static(__dirname + "/static/css"));
app.use("/base-js", express.static(__dirname + "/static/js"));
app.use("/images", express.static(__dirname + "/static/images"));
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true,
    store: new MemoryStore(),
    express: 86400 * 1000,
  })
);

const checkUser = function (req, res, next) {  // ########### MIDDLEWARE CHECK TYPE OF USER, SET SESSION FOR AUTHENTICATION ##################
  if (req.session.otp == "" || req.session.otp == undefined)
    req.session.otp = 0;
  let validUrl = new Array(
    "",
    "/",
    "/index",
    "/book",
    "/bus_details",
    "/city_details",
    "/contact_us",
    "/dashboard",
    "/fix_journey",
    "/my_bookings",
    "/passenger",
    "/profile",
    "/timetable",
    "/user_details"
  );
  if (validUrl.indexOf(req.session.curUrl) != -1) {
    req.session.preUrl = req.session.curUrl;
  }
  if (validUrl.indexOf(req.originalUrl) != -1) {
    req.session.curUrl = req.originalUrl;
  }
  if (req.session.curUrl == undefined) req.session.curUrl = "/";
  if (req.session.preUrl == undefined) req.session.preUrl = "/";
  if (req.method == "POST") {
    next();
  } else {
    request.post(
      {
        url: "http://localhost:" + API_PORT + "/get_data",
        form: {
          sqlQuery: "SELECT count(*) as cnt FROM user_details",
        },
      },
      function (error, response, body) {
        if (!error) {
          let data = JSON.parse(response.body);
          if (data[0].cnt == 0) {
            let preUrl = "/";
            if (req.session.preUrl != "") preUrl = req.session.preUrl;
            res.render("signup", {
              user: "Admin User",
              preUrl: perUrl,
            });
          } else {
            next();
          }
        } else {
          res.render("500");
        }
      }
    );
  }
};
app.use(checkUser);

// ############# BBS MENU LIST ROUTING #######################

app.get("", function (req, res) {
  request.post(
    {
      // load city name start
      url: "http://localhost:" + API_PORT + "/get_data",
      form: {
        sqlQuery: "SELECT *  FROM city_details",
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
    function (error, response2, body) {
      if (!error) {
        if (response2.body != "") {
          let isAdmin = 'S';
          if (req.cookies["loginData"]!=null || req.cookies["loginData"]!=undefined) {
isAdmin=req.cookies["loginData"].userType;
          }
          res.render("index", {
            cityData: JSON.parse(response2.body),
            isAdmin:isAdmin            
          });
        } else {
          res.send("0");
        }
      } else {
        res.render("500");
      }
    }
  );
});

app.get("/index", function (req, res) {
  res.render("index");
});

app.get("/book/:journey_id/:bestRoute", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
let bestRoute=(req.params.bestRoute).split(",");

    let temp=" AND ( ";
    if(bestRoute.length>0){
    for(let k=0;k<bestRoute.length-1;k++){
    temp=temp+" (FROM_CITY = "+bestRoute[k]+" AND TO_CITY="+bestRoute[k+1]+" ) OR ";
    }}
    temp=temp.substring(0, temp.length - 4)
    temp=temp+"  ) ";
    
    
    

    request.post(
      {
        // load city name start
        url: "http://localhost:" + API_PORT + "/get_data",
        form: {
          sqlQuery: "SELECT JOURNEY_ID,  (SELECT (TOTAL_SEAT-jd.BOOK_COUNT) FROM bus_details WHERE BUSID=jd.BUSID) AS AVAILABLE, jd.BUSID,  SUM(jd.COST) AS COST, DATE_FORMAT(jd.JOURNEY_DATE, '%e/%c/%Y %h:%i %p')  AS JOURNEY_DATE, (SELECT CITY_NAME FROM city_details WHERE CITY_ID='"+bestRoute[0]+"') AS FROM_CITY, (SELECT CITY_NAME FROM city_details WHERE CITY_ID='"+bestRoute[(bestRoute.length-1)]+"') AS TO_CITY, jd.BOOK_COUNT, (SELECT REMARKS FROM bus_details WHERE BUSID=jd.BUSID) as REMARKS FROM journey_details jd WHERE JOURNEY_ID='"+req.params.journey_id+"'  "+temp,
        },
        headers: {
          "Content-Type": "application/json",
        },
      },
      function (error, response2, body) {
        if (!error) {
          if (response2.body != "") {
            console.log(response2.body.BUSID)
            let data=JSON.parse(response2.body);
                res.render("book",{data:data,journey_id:req.params.journey_id, bestRoute:(req.params.bestRoute).toString()});
          } else {
            res.send("0");
          }
        } else {
          res.render("500");
        }
      }
    );





  }
});

app.get("/bus_details", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
    if (req.cookies["loginData"].userType != "A") {
      res.render("no_access", {
        access: "Admin",
      });
    } else {
      request.post(
        {
          url: "http://localhost:" + API_PORT + "/get_data",
          form: {
            sqlQuery: "SELECT *  FROM bus_details",
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
        function (error, response, body) {
          if (!error) {
            if (response.body != "") {
              res.render("bus_details", {
                data: JSON.parse(response.body),
              });
            } else {
              res.send("0");
            }
          } else {
            res.render("500");
          }
        }
      );
    }
  }
});

app.get("/city_details", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
    if (req.cookies["loginData"].userType != "A") {
      res.render("no_access", {
        access: "Admin",
      });
    } else {
      request.post(
        {
          url: "http://localhost:" + API_PORT + "/get_data",
          form: {
            sqlQuery: "SELECT *  FROM city_details",
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
        function (error, response, body) {
          if (!error) {
            if (response.body != "") {
              res.render("city_details", {
                data: JSON.parse(response.body),
              });
            } else {
              res.send("0");
            }
          } else {
            res.render("500");
          }
        }
      );
    }
  }
});

app.get("/contact_us", function (req, res) {
  res.render("contact_us");
});

app.get("/dashboard", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
    if (req.cookies["loginData"].userType != "A") {
      res.render("no_access", {
        access: "Admin",
      });
    } else {
      res.render("dashboard");
    }
  }
});

app.get("/fix_journey", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
    if (req.cookies["loginData"].userType != "A") {
      res.render("no_access", {
        access: "Admin",
      });
    } else {
      request.post(
        {
          url: "http://localhost:" + API_PORT + "/get_data",
          form: {
            sqlQuery: "SELECT *  FROM bus_details",
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
        function (error, response1, body) {
          if (!error) {
            if (response1.body != "") {
              request.post(
                {
                  // load city name start
                  url: "http://localhost:" + API_PORT + "/get_data",
                  form: {
                    sqlQuery: "SELECT *  FROM city_details",
                  },
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
                function (error, response2, body) {
                  if (!error) {
                    if (response2.body != "") {
                      res.render("fix_journey", {
                        busData: JSON.parse(response1.body),
                        cityData: JSON.parse(response2.body),
                      });
                    } else {
                      res.send("0");
                    }
                  } else {
                    res.render("500");
                  }
                }
              ); // city name loading ajax end
            } else {
              res.send("0");
            }
          } else {
            res.render("500");
          }
        }
      );
    }
  }
});

app.get("/my_bookings", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
    if (req.cookies["loginData"].userType != "S") {
      res.render("no_access", {
        access: "Client",
      });
    } else {
      res.render("my_bookings");
    }
  }
});

app.get("/passenger", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
    if (req.cookies["loginData"].userType != "A") {
      res.render("no_access", {
        access: "Admin",
      });
    } else {
      res.render("passenger");
    }
  }
});

app.get("/profile", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
    res.render("profile");
  }
});

app.get("/timetable", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
    if (req.cookies["loginData"].userType != "A") {
      res.render("no_access", {
        access: "Admin",
      });
    } else {
      request.post(
        {
          url: "http://localhost:" + API_PORT + "/get_data",
          form: {
            sqlQuery:
              "SELECT jd.BUSID, DATE_FORMAT(jd.JOURNEY_DATE, '%e/%c/%Y %h:%i %p') AS JOURNEY_DATE , (SELECT CITY_NAME FROM city_details WHERE CITY_ID=jd.FROM_CITY) AS FROM_CITY, (SELECT CITY_NAME FROM city_details WHERE CITY_ID=jd.TO_CITY) AS TO_CITY, BOOK_COUNT, (SELECT (TOTAL_SEAT-jd.BOOK_COUNT) FROM bus_details WHERE BUSID=jd.BUSID) AS AVAILABLE, COST, jd.COST*jd.BOOK_COUNT as REVENUE FROM journey_details jd",
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
        function (error, response, body) {
          if (!error) {
            if (response.body != "") {
              res.render("timetable", {
                data: JSON.parse(response.body),
              });
            } else {
              res.send("0");
            }
          } else {
            res.render("500");
          }
        }
      );
    }
  }
});

app.get("/user_details", function (req, res) {
  if (!Object.keys(req.cookies).length > 0) {
    res.clearCookie("loginData");
    res.render("login");
  } else {
    if (req.cookies["loginData"].userType != "A") {
      res.render("no_access", {
        access: "Admin",
      });
    } else {
      res.render("user_details");
    }
  }
});

// ######## LOADING THE LEFT NAVE BAR FOR ALL PAGES ###########

app.post("/nave_bar", function (req, res) {
  var username = "Anonymous";
  var login = 0;
  let cookie = "";
  if (Object.keys(req.cookies).length > 0) {
    login = req.cookies["loginData"].isLoggedin;
    if (login == 1) {
      username = req.cookies["loginData"].name;
      isAdmin = req.cookies["loginData"].userType;
    } else {
      username = "Anonymous";
      login = 0;
      isAdmin = 0;
    }
  } else {
    username = "Anonymous";
    login = 0;
    isAdmin = 0;
  }
  res.render("nave_bar", {
    username: username,
    url: req.session.curUrl,
    login: login,
  });
});

//############# USER LOGIN SIGNP DATA MANAGEMENT

app.get("/login", function (req, res) {
  res.clearCookie("loginData");
  res.render("login");
});

app.get("/signup", function (req, res) {
  res.clearCookie("loginData");
  let preUrl = "/";
  if (req.session.preUrl != "") preUrl = req.session.preUrl;
  res.render("signup", {
    user: " ",
    preUrl: preUrl,
  });
});

app.get("/logout", function (req, res) {
  res.clearCookie("loginData");
  //clear login cookie
  res.redirect("/");
});

app.post("/send_otp", function (req, res) {
  let length = 5;
  let otp = "";
  let character = "1234567890";
  const charactersLength = character.length;
  for (let i = 0; i < length; i++) {
    otp += character.charAt(Math.floor(Math.random() * charactersLength));
  }
  req.session.otp = otp;
  console.log(req.session.otp);
  let html =
    '<html style="background:aliceblue;">' +
    '<center><font color="green"><h3>Hello ' +
    req.body.email +
    ",</h3></font>" +
    "<p>Please use the following One Time Password (OTP) : <B>" +
    otp +
    "</B>. Do not share this OTP WITH anyone. The OTP is valid for this session.</p> " +
    "Thank You!" +
    "</center>" +
    "</html>";
  request.post(
    {
      url: "http://localhost:" + EMAIL_PORT + "/send_mail",
      form: {
        email: req.body.email,
        html: html,
        subject: "OTP FROM BBS",
      },
    },
    function (error, response, body) {
      if (!error) {
        res.send(response.body);
      } else {
        res.render(error.message);
      }
    }
  );
});

app.post("/check_otp", function (req, res) {
  let otp = req.body.otp;
  console.log("check" + req.session.otp);
  if (req.session.otp == otp) {
    req.session.isEmailVerified = 1;
    res.send("1");
  } else {
    req.session.isEmailVerified = 0;
    res.send("0");
  }
});

app.post("/send_password", function (req, res) {
  let email = req.body.email;
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/send_password",
      form: {
        email: email,
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != 0) {
          let html =
            '<html style="background:aliceblue;">' +
            '<center><font color="green"><h3>Hello ' +
            req.body.email +
            ",</h3></font>" +
            "<p>Please use the following  Password  : <B>" +
            response.body +
            "</B>. Do not share this password with anyone</p> " +
            "Thank You!" +
            "</center>" +
            "</html>";
          request.post(
            {
              url: "http://localhost:" + EMAIL_PORT + "/send_mail",
              form: {
                email: email,
                html: html,
                subject: "PASSWORD FROM BBS",
              },
            },
            function (error, response, body) {
              if (!error) {
                res.send(response.body);
              } else {
                res.render(error.message);
              }
            }
          );
        } else {
          res.send("0");
        }
      } else {
        res.send("0");
      }
    }
  );
});

app.post("/checkLogin", function (req, res) {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/checkLogin",
      form: {
        email: req.body.email,
        password: req.body.password,
      },
    },
    function (error, response, body) {
      if (!error) {
        let loginJson = JSON.parse(response.body);
        console.log(loginJson.success);
        if (loginJson.success == 1) {
          let data = {
            status: "1",
            moveTo: req.session.preUrl,
          };
          let loginData = {
            user: loginJson.username,
            isLoggedin: loginJson.success,
            userType: loginJson.type,
            name: loginJson.name,
          };
          res.cookie("loginData", loginData, cookieOption);
          res.send(data);
        } else {
          let loginData = {
            user: loginJson.username,
            isLoggedin: loginJson.success,
            userType: loginJson.type,
            name: loginJson.name,
          };
          res.cookie("loginData", loginData, cookieOption);
          let data = {
            status: "0",
            moveTo: "/login",
          };
          res.send(data);
        }
      } else {
        res.render("500");
      }
    }
  );
});

app.post("/checkEmail", function (req, res) {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/checkEmail",
      form: {
        email: req.body.email,
      },
    },
    function (error, response, body) {
      if (!error) {
        res.send(response.body);
      } else {
        res.render("500");
      }
    }
  );
});

app.post("/isEailVerified", function (req, res) {
  if (req.session.isEmailVerified == 1) {
    res.send("1");
  } else {
    res.send("0");
  }
});

app.post("/signup", function (req, res) {
  req.session.isEmailVerified = 0;
  res.clearCookie("loginData");
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/get_data",
      form: {
        sqlQuery: "SELECT count(*) as cnt FROM user_details",
      },
    },
    function (error, response, body) {
      if (!error) {
        let table = "user_details";
        let index = "userid, name, email, phone, password, address, type";
        let email = req.body.email;
        let name = req.body.name;
        let password = req.body.password;
        let address = req.body.address;
        let phone = req.body.phone;
        let username = req.body.username;
        let type = "A";
        let data = JSON.parse(response.body);
        if (data[0].cnt) type = "S";
        let value =
          "( '" +
          username +
          "', '" +
          name +
          "', '" +
          email +
          "', " +
          phone +
          ", '" +
          password +
          "', '" +
          address +
          "', '" +
          type +
          "' )";
        request.post(
          {
            url: "http://localhost:" + API_PORT + "/insert_data",
            form: {
              table: table,
              index: index,
              value: value,
            },
          },
          function (error, response, body) {
            if (!error) {
              if (response.body == 1) {
                let loginData = {
                  user: username,
                  isLoggedin: "1",
                  userType: type,
                  name: name,
                };
                res.cookie("loginData", loginData, cookieOption);
                req.session.userName = username;
                res.send(response.body);
              }
            } else {
              res.render("500");
            }
          }
        );
      } else {
        res.render("500");
      }
    }
  );
});

app.get("/getuser", (req, res) => {
  res.send(req.cookies);
});

app.get("/404", function (req, res) {
  res.render("404");
});

app.get("/500", function (req, res) {
  res.render("500");
});

app.get("/no_access", function (req, res) {
  res.render("no_access");
});

app.get("/table", function (req, res) {
  res.render("table");
});

app.use(function (err, req, res) {
  if (err) req.render("404");
});


app.listen(BBS_PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", BBS_PORT);
});
