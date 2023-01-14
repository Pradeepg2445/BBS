require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const router = express.Router();
router.use(cookieParser("BBS"));
const cookieOption = {
  maxAge: 60 * 1000 * 60 * 24,
};
const BBS_PORT = process.env.BBS_SERVER_PORT;
const API_PORT = process.env.API_SERVER_PORT;
const EMAIL_PORT = process.env.EMAIL_SERVER_PORT;
var cors = require("cors");
router.use(cors());
var request = require("request");
var today = new Date();
var bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.use((req, res, next) => {
  console.log("Admin Router Called");
  if (req.cookies["loginData"].userType != "A") {
    res.send("no access");
  } else {
    next();
  }
});

// ########### CITY DATA MANAGEMENT #############
router.post("/addCity", (req, res) => {
  let table = "city_details";
  let index = "city_name";
  let cityName = req.body.cityName;
  let value = " ('" + cityName + "') ";
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
          res.send("1");
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});

router.post("/getCity", (req, res) => {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/get_data",
      form: {
        sqlQuery: "SELECT *  FROM city_details",
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          res.send(JSON.stringify(response.body));
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});

router.post("/deleteCity", (req, res) => {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/delete_data",
      form: {
        table: "city_details",
        conditions: " city_id=" + req.body.city_id,
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          res.send(response.body);
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});

router.post("/updateCity", (req, res) => {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/update_data",
      form: {
        table: "city_details",
        value: " city_name='" + req.body.cityName + "' ",
        conditions: " city_id=" + req.body.city_id,
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          res.send(response.body);
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});

// ########### BUS DATA MANAGEMENT #############

router.post("/addBus", (req, res) => {
  let table = "bus_details";
  let index = "busid, total_seat, remarks";
  let busid = req.body.busid;
  let toseat = req.body.toseat;
  let remarks = req.body.remarks;
  let value = " ('" + busid + "', '" + toseat + "', '" + remarks + "') ";
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
          res.send("1");
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});

router.post("/getBus", (req, res) => {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/get_data",
      form: {
        sqlQuery: "SELECT *  FROM city_details",
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          res.send(JSON.stringify(response.body));
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});

router.post("/deleteBus", (req, res) => {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/delete_data",
      form: {
        table: "bus_details",
        conditions: " busid='" + req.body.busid + "'",
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          res.send(response.body);
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});

router.post("/updateBus", (req, res) => {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/update_data",
      form: {
        table: "bus_details",
        value:
          "  total_seat=" +
          req.body.toseat +
          ", cost=" +
          req.body.cpp +
          ", remarks='" +
          req.body.remarks +
          "'",
        conditions: " busid='" + req.body.busid + "'",
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          res.send(response.body);
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});

router.post("/checkBusId", (req, res) => {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/get_data",
      form: {
        sqlQuery:
          "SELECT count(*) as cnt  FROM bus_details where busid='" +
          req.body.busid +
          "'",
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          let data = JSON.parse(response.body);
          if (data[0].cnt == 0) {
            res.send("0");
          } else {
            res.send("1");
          }
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});

//################### JOURNEY_DETAILS DATA MANAGEMENT #################

router.post("/addJourney", (req, res) => {
  let table = "journey_details";
  let index ="JOURNEY_ID, ROUTE_ID, BUSID, FROM_CITY, TO_CITY, JOURNEY_DATE, COST, BOOK_COUNT";
  let busid = req.body.busid;
  let date = req.body.date;
  let cpp = req.body.cpp;
  let city = req.body.city;

  request.post(
    {
      url: "http://localhost:" + API_PORT + "/get_data",
      form: {
        sqlQuery:
          "SELECT MAX(CAST(SUBSTRING(JOURNEY_ID,4,length(JOURNEY_ID)-3) AS unsigned)) as JOURNEY_ID FROM `journey_details`",
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          var data = JSON.parse(response.body);

          var insertValues = " ";
          for (let i = 0; i < city.length - 1; i++) {
            let str = "( 'JNY" + (data[0].JOURNEY_ID + 1) +"', " +(i + 1) +", '" +  busid +"', " +city[i] + ", " + city[i + 1] +  ", '" +  date[i] + "', " + cpp[i] + ", 0 ),";
            insertValues = insertValues + str;
          }
          insertValues = insertValues.substring(0, insertValues.length - 1);
          request.post(
            {
              url: "http://localhost:" + API_PORT + "/insert_data",
              form: {
                table: table,
                index: index,
                value: insertValues,
              },
            },
            function (error, response, body) {
              if (!error) {
                if (response.body == 1) {
                  res.send("1");
                } else {
                  res.send("0");
                }
              } else {
                res.send("error");
              }
            }
          );
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});





















router.use(function (err, req, res) {
  if (err) req.send("error");
});

module.exports = router;
