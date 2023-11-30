var _expressPackage = require("express");
var _bodyParserPackage = require("body-parser");

const kcvldbConfig = require("./kcvldbconfig");
const database = require("./database");

const sPort = 3200;
let sDB = "<";
let cCurrentDate = "";
//Initilize app with express web framework
var app = _expressPackage();
//To parse result in json format
app.use(_bodyParserPackage.json());
app.use(_expressPackage.json());

//Here we will enable CORS, so that we can access api on cross domain.
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  next();
});

//Lets set up our local server now.
var server = app.listen(process.env.PORT || sPort, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

// Define a function to handle the common logic
function handleMachineRunningStatus(req, res, reportName) {
  // Collection of parameter.
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });

  const code = req.query.code;
  console.log(formattedDate + " : " + code);

  const parameters = [{ name: "v_MCCode", value: code }];

  database.executeStoredProcedure(
    res,
    kcvldbConfig,
    reportName,
    parameters
  );
}

// ########################################
// ###### API
// ########################################

app.get("/", wIntro);

// ########################################
// ###### FUNCTION
// ########################################
function wIntro(req, res) {
  res.send("🚀 Kiswire KCVL API now running on port " + sPort);
}

// Route for /d14
app.get("/d14", function (req, res) {
  handleMachineRunningStatus(req, res, "RPT_D14_Machine_Running_Status");
});

// Route for /d15
app.get("/d15", function (req, res) {
  handleMachineRunningStatus(req, res, "RPT_D15_Machine_Running_Status");
});

// Route for /d16
app.get("/d16", function (req, res) {
  handleMachineRunningStatus(req, res, "RPT_D16_Machine_Running_Status");
});



// app.get("/d14", function (_req, _res) {
//   // Collection of parameter.
//   const d14date = new Date();
//   const fd14date  = d14date.toLocaleString('en-US',{weekday:'short',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric',hour12: true})
//   var code = _req.query.code;
//   console.log(fd14date + " : " + code)

//   const parameters = [{ name: "v_MCCode", value: code }];

//   database.executeStoredProcedure(
//     _res,
//     kcvldbConfig,
//     "RPT_D14_Machine_Running_Status",
//     parameters
//   );
// });

// app.get("/d15", function (_req, _res) {
//   // Collection of parameter.
//   const d15date = new Date();
//   const fd15date  = d15date.toLocaleString('en-US',{weekday:'short',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric',hour12: true})
//   var code = _req.query.code;
//   console.log(fd15date +" : " + code)

//   const parameters = [{ name: "v_MCCode", value: code }];

//   database.executeStoredProcedure(
//     _res,
//     kcvldbConfig,
//     "RPT_D15_Machine_Running_Status",
//     parameters
//   );
// });

// app.get("/d16", function (_req, _res) {
//   // Collection of parameter.
//   const d16date = new Date();
//   const fd16date  = d16date.toLocaleString('en-US',{weekday:'short',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric',hour12: true})
//   var code = _req.query.code;
//   console.log(fd16date + " : " + code)

//   const parameters = [{ name: "v_MCCode", value: code }];

//   database.executeStoredProcedure(
//     _res,
//     kcvldbConfig,
//     "RPT_D16_Machine_Running_Status",
//     parameters
//   );
// });