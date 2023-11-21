var _expressPackage = require("express");
var _bodyParserPackage = require("body-parser");

const kcvldbConfig = require("./kcvldbconfig");
const database = require("./database");

const sPort = 3200;
let sDB = "<";

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

// ########################################
// ###### API
// ########################################

app.get("/", wIntro);
app.get("/mrsd13", getMRSd13);

// ########################################
// ###### FUNCTION
// ########################################
function wIntro(req, res) {
  res.send("🚀 Kiswire KCVL API now running on port " + sPort);
}
function getMRSd13(req, res) {
  res.send("🚀 getMRSd13" + sPort);
}
// function getMRSd14(req, res) {
//   console.log('MRSd14')
//   // const group = req.query.group;
//   const MCCode = req.query.MCCode;

//   const parameters = [{ name: "v_MCCode", value: MCCode }];
//   console.log (parameters)
//   database.executeStoredProcedure(
//     res,
//     kcvldbConfig,
//     "RPT_D14_Machine_Running_Status",
//     parameters
//   );
// }
app.get("/d14", function (_req, _res) {
  // Collection of parameter.
  var code = _req.query.code;
  console.log("d14" + code)

  const parameters = [{ name: "v_MCCode", value: code }];

  database.executeStoredProcedure(
    _res,
    kcvldbConfig,
    "RPT_D14_Machine_Running_Status",
    parameters
  );
});

app.get("/d15", function (_req, _res) {
  // Collection of parameter.
  var code = _req.query.code;
  console.log("d15" + code)

  const parameters = [{ name: "v_MCCode", value: code }];

  database.executeStoredProcedure(
    _res,
    kcvldbConfig,
    "RPT_D15_Machine_Running_Status",
    parameters
  );
});

app.get("/d16", function (_req, _res) {
  // Collection of parameter.
  var code = _req.query.code;
  console.log("d16" + code)

  const parameters = [{ name: "v_MCCode", value: code }];

  database.executeStoredProcedure(
    _res,
    kcvldbConfig,
    "RPT_D16_Machine_Running_Status",
    parameters
  );
});