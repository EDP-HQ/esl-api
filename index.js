var _expressPackage = require("express");
var _bodyParserPackage = require("body-parser");

const kcsbsalesdbConfig = require("./kcsbsalesdbconfig");
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
// app.get("/kcsbsales/login", kcsbSalesLogin);
// app.get("/kcsbsales/commonselect", commonSelect);
// app.get("/kcsbsales/commonarea", commonArea);
// app.get("/kcsbsales/destination", destinationSelect);
// app.get("/kcsbsales/destcode", destcode);
// app.get("/kcsbsales/buyer", buyerSelect);
// app.get("/kcsbsales/buyercode", buyerID);
// app.get("/kcsbsales/findorder", findOrder);
// app.get("/kcsbsales/sujum", getSujuM);
// app.get("/kcsbsales/sujus", getSujuS);

// ########################################
// ###### FUNCTION
// ########################################
function wIntro(req, res) {
  res.send("🚀 Kiswire KCVL API now running on port " + sPort);
}

// function kcsbSalesLogin(req, res) {
//   // const group_id = req.query.group_id;
//   const user_id = req.query.user_id;
//   const user_pass = req.query.user_pass;

//   const Sqlquery =
//     "SELECT * FROM tblSalesUser WHERE UserID='" +
//     user_id +
//     "' AND UserPwd='" +
//     user_pass +
//     "'";
//   database.executeQuery(res, kcsbsalesdbConfig, Sqlquery);
// }

// function commonSelect(req, res) {
//   const group = req.query.group;

//   const Sqlquery =
//     "SELECT RTRIM(IName) as name, RTRIM(CodeID) AS code FROM tblCommon WHERE GroupID='" +
//     group +
//     "' ORDER BY IName;";
//   // console.log(Sqlquery);
//   database.executeQuery(res, kcsbsalesdbConfig, Sqlquery);
// }

// function commonArea(req, res) {
//   const group = req.query.group;

//   const Sqlquery =
//     "SELECT RTRIM(IName) as name, RTRIM(CodeID) AS code FROM tblCommon WHERE GroupID='" +
//     group +
//     "' ORDER BY CodeID;";
//   // console.log(Sqlquery);
//   database.executeQuery(res, kcsbsalesdbConfig, Sqlquery);
// }

// function destinationSelect(req, res) {
//   const group = req.query.group;

//   const Sqlquery =
//     "SELECT RTRIM(DestName) as name, RTRIM(DestCode) AS code FROM tblMDest;";
//   // console.log(Sqlquery);
//   database.executeQuery(res, kcsbsalesdbConfig, Sqlquery);
// }

// function destcode(req, res) {
//   const destcode = req.query.destcode;

//   const Sqlquery =
//     "SELECT * FROM tblMDest WHERE DestCode='" + destcode + "';";
//   // console.log("SQL", Sqlquery);
//   database.executeQuery(res, kcsbsalesdbConfig, Sqlquery);
// }

// function buyerSelect(req, res) {
//   const group = req.query.group;

//   const Sqlquery =
//     "SELECT RTRIM(HName) AS name, RTRIM(BuyerCode) AS code FROM tblMBuyer ORDER BY HName;";
//   // console.log("SQL", Sqlquery);
//   database.executeQuery(res, kcsbsalesdbConfig, Sqlquery);
// }

// function buyerID(req, res) {
//   const buyercode = req.query.buyercode;

//   const Sqlquery =
//     "SELECT * FROM tblMBuyer WHERE BuyerCode='" + buyercode + "';";
//   // console.log("SQL", Sqlquery);
//   database.executeQuery(res, kcsbsalesdbConfig, Sqlquery);
// }

// function findOrder(req, res) {
//   const orderid = req.query.orderid;
//   const destination = req.query.destination;
//   const customer = req.query.customer;
//   const dateform = req.query.dateform;
//   const dateto = req.query.dateto;
//   const nation = req.query.nation;

//   var sqlStatement = "";
//   var sqlColum =
//     "SujuNo, BuyerCode,BuyerName,EndBuyerName,DestCode,DestName,EndNationID,EndNationName,CONVERT(datetime,OrderDate) as OrderDate,PoNo,ConditionID,InputDate";
//   var sqlWhere = " WHERE ";
//   var sqlFrom = " tblSujuM ";
//   var sqlCondition = "";

//   if (orderid != "") {
//     if (sqlCondition != "") {
//       sqlCondition = sqlCondition + " AND SujuNo LIKE '" + orderid + "%'";
//     } else {
//       sqlCondition = sqlCondition + " SujuNo LIKE '" + orderid + "%'";
//     }
//   }

//   if (destination != "-") {
//     if (sqlCondition != "") {
//       sqlCondition = sqlCondition + " AND DestCode = '" + destination + "'";
//     } else {
//       sqlCondition = sqlCondition + " DestCode = '" + destination + "'";
//     }
//   }

//   if (customer != "-") {
//     if (sqlCondition != "") {
//       sqlCondition = sqlCondition + " AND BuyerCode = '" + customer + "'";
//     } else {
//       sqlCondition = sqlCondition + " BuyerCode = '" + customer + "'";
//     }
//   }

//   if (dateform != "-") {
//     if (sqlCondition != "") {
//       sqlCondition = sqlCondition + " AND OrderDate > '" + dateform + "'";
//     } else {
//       sqlCondition = sqlCondition + " OrderDate > '" + dateform + "'";
//     }
//   }

//   if (dateto != "-") {
//     if (sqlCondition != "") {
//       sqlCondition = sqlCondition + " AND OrderDate < '" + dateto + "'";
//     } else {
//       sqlCondition = sqlCondition + " OrderDate < '" + dateto + "'";
//     }
//   }

//   if (nation != "-") {
//     if (sqlCondition != "") {
//       sqlCondition = sqlCondition + " AND EndNationID = '" + nation + "'";
//     } else {
//       sqlCondition = sqlCondition + " EndNationID = '" + nation + "'";
//     }
//   }

//   if (sqlCondition != "") {
//     sqlStatement =
//       "SELECT " + sqlColum + " FROM " + sqlFrom + " WHERE " + sqlCondition;
//   } else {
//     sqlStatement = "SELECT " + sqlColum + " FROM " + sqlFrom;
//   }

//   // console.log (sqlStatement)
//   database.executeQuery(res, kcsbsalesdbConfig, sqlStatement);
// }

// function getSujuM(req, res) {
//   // const group = req.query.group;
//   const sujuno = req.query.sujuno;

//   const parameters = [{ name: "p_SujuNo", value: sujuno }];
//   // console.log (parameters)
//   database.executeStoredProcedure(
//     res,
//     kcsbsalesdbConfig,
//     "UP_tblSuju_Select",
//     parameters
//   );
// }

// function getSujuS(req, res) {
//   // const group = req.query.group;
//   const sujuno = req.query.sujuno;

//   const parameters = [{ name: "p_SujuNo", value: sujuno }];

//   database.executeStoredProcedure(
//     res,
//     kcsbsalesdbConfig,
//     "UP_tblSuju_Select",
//     parameters
//   );
// }

// ########################################
// ###### DEMO
// ########################################

app.get("/demo1", function (_req, _res) {
  var name = _req.query.name;
  var isAuthor = _req.query.isAuthor;

  // database.statementQuery("SELECT * FROM tblSalesUser")
  database.executeQuery(_res, kcsbsalesdbConfig, "SELECT * FROM tblSalesUser");

  // const responseData = {
  //     // Include specific properties from the request object
  //     // For example:
  //     method: _req.method,
  //     url: _req.url,
  //     // Include additional data if needed
  //     message: result_1
  // };
  // // Send the response object
  // _res.send(responseData);
});

app.get("/demo2", function (_req, _res) {
  // sql statement
  var Sqlquery = "SELECT * FROM tblSalesUser";
  database.executeQuery(_res, kcsbsalesdbConfig, Sqlquery);
});

app.get("/demo3", function (_req, _res) {
  // Collection of parameter.

  const parameters = [{ name: "p_SujuNo", value: "RJN636" }];

  database.executeStoredProcedure(
    _res,
    kcsbsalesdbConfig,
    "UP_tblSuju_Select",
    parameters
  );
});
