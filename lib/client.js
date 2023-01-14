require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const router = express.Router();
router.use(cookieParser("BBS"));
const toSqlDatetime = (inputDate) => {
  const date = new Date(inputDate)
  const dateWithOffest = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
  return dateWithOffest
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')
}

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
const { json } = require("express");
router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.use((req, res, next) => {
  console.log("Client Router Called");
   
  if (Object.keys(req.cookies).length > 0 && req.cookies["loginData"].userType != "S") {
    res.send("no access");
  } else {
    next();
  }
});

//################ BOOKING DATA MANAGEMENT #####################
router.post("/searchJourney", function (req, res) {  
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/get_data",
      form: {
        // sqlQuery:  "SELECT jd.JOURNEY_ID, jd.BUSID, DATE_FORMAT(jd.JOURNEY_DATE, '%e/%c/%Y %h:%i %p') AS JOURNEY_DATE , (SELECT CITY_NAME FROM city_details WHERE CITY_ID=jd.FROM_CITY) AS FROM_CITY, (SELECT CITY_NAME FROM city_details WHERE CITY_ID=jd.TO_CITY) AS TO_CITY,  (SELECT (TOTAL_SEAT-jd.BOOK_COUNT) FROM bus_details WHERE BUSID=jd.BUSID) AS AVAILABLE, COST  FROM journey_details jd WHERE (FROM_CITY='"+req.body.from+"' OR TO_CITY='"+req.body.to+"') AND  DATE(JOURNEY_DATE) >=  DATE(CURRENT_TIMESTAMP)  AND DATE(JOURNEY_DATE)>=DATE('"+ toSqlDatetime(new Date(req.body.date))+"')"

        sqlQuery:"SELECT JOURNEY_ID FROM journey_details WHERE  DATE(JOURNEY_DATE) >=  DATE(CURRENT_TIMESTAMP) AND (FROM_CITY='"+req.body.from+"' OR TO_CITY='"+req.body.to+"') AND   DATE(JOURNEY_DATE)>=DATE('"+ toSqlDatetime(new Date(req.body.date))+"') GROUP BY JOURNEY_ID"
        
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          res.send(JSON.parse(response.body));
        } else {
          res.send("0");
        }
      } else {
        res.send("error");
      }
    }
  );
});


router.post("/searchResult", function (req, res) {   

    request.post(
      {
        url: "http://localhost:" + API_PORT + "/get_data",
        form: {

          sqlQuery:"SELECT * FROM journey_details WHERE  DATE(JOURNEY_DATE) >=  DATE(CURRENT_TIMESTAMP) AND (FROM_CITY='"+req.body.from+"' OR TO_CITY='"+req.body.to+"')  AND DATE(JOURNEY_DATE)>=DATE('"+ toSqlDatetime(new Date(req.body.date))+"') AND JOURNEY_ID='"+req.body.journey_id+"' "
          
        },
        headers: {
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (!error) {
          if (response.body != "") {

           let rows=JSON.parse(response.body)
           
           var graph = new Graph();
for(let j=0;j<rows.length;j++){
  graph.addEdge(rows[j].FROM_CITY, rows[j].TO_CITY);
}

let from=req.body.from;
let to=req.body.to;


let bestRoute;
if(Object.keys(graph.neighbors).length>0){
  
  bestRoute= shortestPath(graph, parseInt(from), parseInt(to));
if(bestRoute==-1){
  console.log("No route found "+bestRoute);
//no best route foud
}

else
{
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
      sqlQuery: "SELECT JOURNEY_ID,  (SELECT (TOTAL_SEAT-jd.BOOK_COUNT) FROM bus_details WHERE BUSID=jd.BUSID) AS AVAILABLE, jd.BUSID,  SUM(jd.COST) AS COST, DATE_FORMAT(jd.JOURNEY_DATE, '%e/%c/%Y %h:%i %p')  AS JOURNEY_DATE, (SELECT CITY_NAME FROM city_details WHERE CITY_ID='"+req.body.from+"') AS FROM_CITY, (SELECT CITY_NAME FROM city_details WHERE CITY_ID='"+req.body.to+"') AS TO_CITY, jd.BOOK_COUNT FROM journey_details jd WHERE JOURNEY_ID='"+req.body.journey_id+"'  "+temp
    },
    headers: {
      "Content-Type": "application/json",
    },
  },
  function (error, response2, body) {
    if (!error) {


      
      if (response2.body != "") {
       let data=JSON.parse(response2.body);
            res.render("bus_search",{data:data,bestRoute:bestRoute});
      } else {
        res.send("0");
      }
    } else {
      res.render("500");
    }
  }
);

}

















}else{  
bestRoute= -1;
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



router.post("/bookNow", (req, res) => {
console.log(req.body)
let journey_id=req.body.journey_id;
let bestRoute=(req.body.bestRoute).split(",");
let req_seat=req.body.req_seat;

if(bestRoute.length>0){ // checking the seat is full
  for(let k=0;k<bestRoute.length-1;k++){
router.post("/getCity", (req, res) => {
  request.post(
    {
      url: "http://localhost:" + API_PORT + "/get_data",
      form: {
        sqlQuery: "SELECT (SELECT (TOTAL_SEAT-jd.BOOK_COUNT) FROM bus_details WHERE BUSID=jd.BUSID) AS AVAILABLE FROM JOURNEY_DETAILS jd WHERE jd.FROM_CITY="+busRoute[k]+" AND TO_CITY="+busRoute[k+1],
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
let data = JSON.stringify(response.body);
if(data[0].AVAILABLE==0){
   res.send("2");// REQUESTED BUS WAS FULLY BOOKED
    res.end();
}
        } else {
         res.send("10"); // garbage response
          res.end();
        }
      } else {
        res.send("error");
       res.end();
      }
    }
  );
});
}}



  request.post(
    {
      url: "http://localhost:" + API_PORT + "/get_data",
      form: {
        sqlQuery:  "SELECT MAX(CAST(SUBSTRING(JOURNEY_ID,4,length(JOURNEY_ID)-3) AS unsigned)) as TICKET FROM `booking_details`",
      },
    },
    function (error, response, body) {
      if (!error) {
        if (response.body != "") {
          let user;
          var data = JSON.parse(response.body);
          if (!Object.keys(req.cookies).length > 0) {
            user=req.cookies["loginData"].user;
          }


          let table = "booking_details";
          let index = "TICKET, USERID, JOURNEY_ID, FROM_CITY, TO_CITY, REQ_SEAT";
          let cityName = req.body.cityName;

          for(let l=0;l<bestRoute.length-1;l++){


          let value = " ('TIK" + (data[0].TICKET + 1) +"', '"+req.cookies["loginData"].user+"', '"+journey_id+"', "+bestRoute[l]+", "+bestRoute[l+1]+", "+req_seat+" ) ";
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
                   res.end();
                } else {
                    res.send("0");
                     res.end();
                }
              } else {
                  res.send("error");
                   res.end();
              }
            }
          );

          }

















        } else {
          res.send("0");
          return;
        }
      } else {
        res.send("error");
        return;
      }
    }
  );






});




 
function Graph() {
  var neighbors = this.neighbors = {}; // Key = vertex, value = array of neighbors.

  this.addEdge = function (u, v) {
    if (neighbors[u] === undefined) {  // Add the edge u -> v.
      neighbors[u] = [];
    }
    neighbors[u].push(v);
    if (neighbors[v] === undefined) {  // Also add the edge v -> u in order
      neighbors[v] = [];               // to implement an undirected graph.
    }                                  // For a directed graph, delete
    neighbors[v].push(u);              // these four lines.
  };

  return this;
}

function bfs(graph, source) {
  var queue = [ { vertex: source, count: 0 } ],
      visited = { [source]: true },
      tail = 0;
  while (tail < queue.length) {
    var u = queue[tail].vertex,
        count = queue[tail++].count;  // Pop a vertex off the queue.
    //print('distance from ' + source + ' to ' + u + ': ' + count);
    graph.neighbors[u].forEach(function (v) {
      if (!visited[v]) {
        visited[v] = true;
        queue.push({ vertex: v, count: count + 1 });
      }
    });
  }
}




function shortestPath(graph, source, target) {
  if (source == target) {   // Delete these four lines if
            // you want to look for a cycle
    return;                 // when the source is equal to
  }                         // the target.
  var queue = [ source ],
      visited = { [source]: true },
      predecessor = {},
      tail = 0;
  while (tail < queue.length) {
    var u = queue[tail++],  // Pop a vertex off the queue.
        neighbors = graph.neighbors[u];
    for (var i = 0; i < neighbors.length; ++i) {
      var v = neighbors[i];
      if (visited[v]) {
        continue;
      }
      visited[v] = true;
      if (v === target) {   // Check if the path is complete.
        var path = [ v ];   // If so, backtrack through the path.
        while (u !== source) {
          path.push(u);
          u = predecessor[u];
        }
        path.push(u);
        path.reverse();
      //  print(path.join(' &rarr; '));
        return path;
      }
      predecessor[v] = u;
      queue.push(v);
    }
  }
//  print('there is no path from ' + source + ' to ' + target);
  return -1;
}


router.use(function (err, req, res) {
    if (err) req.send("error");
  });

module.exports = router;