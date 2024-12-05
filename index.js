const express = require("express");
const { exec } = require('child_process');
const path = require('path');

// Replace these with your actual file paths if needed
const esldbConfig = require("./esldbconfig");
const database = require("./database");

// Configuration variables from the file you provided
const sPort = 3222; // Port for the Express server

// Initialize app with Express
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// To parse result in JSON format
app.use(express.json());

// Enable CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  next();
});

// Start the Express server
var server = app.listen(process.env.PORT || sPort, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

// Define a function to handle the common logic for stored procedures
function handleMachineRunningStatus(req, res, reportName) {
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

  // Execute the stored procedure directly
  database.executeStoredProcedure(res, esldbConfig, reportName, (dbResult) => {
    res.send(dbResult);
  });
}

// Function to execute Java code
function executeDeviceSdkApplication(callback) {
  const jarFile = path.join(__dirname, 'esl-app', 'sdk', 'sdk-1.0.8.jar');
  const javaCommand = `java -cp ${jarFile}DeviceSdkApplicationExample`;

  exec(javaCommand, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error executing Java code: ${error}`);
          callback(error, null);
          return;
      }

      if (stderr) {
          console.error(`Java stderr: ${stderr}`);
          callback(stderr, null);
          return;
      }

      console.log(`Java stdout: ${stdout}`);
      callback(null, stdout);
  });
}

// ########################################
// ###### API
// ########################################

app.get("/", wIntro);

// ########################################
// ###### FUNCTION
// ########################################
function wIntro(req, res) {
  res.send("🚀 Kiswire ESLTag API now running on port " + sPort);
}

// Route for /user
app.get("/user", function (req, res) {
  handleMachineRunningStatus(req, res, "ESLUser");
});

// Route for /tag/regist
app.post("/tag/regist", function (req, res) {
  const postData = req.body;

  // Example of calling a Java method from the JAR file
  const params = 'yourMethodName ' + JSON.stringify(postData); // Replace 'yourMethodName' with the actual method name
  executeJavaFunction(params, (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err });
    } else {
      res.send({ success: true, result: result });
    }
  });
});

// Route for /batchBind/image
app.post("/batchBind/image", function (req, res) {
  const postData = req.body;

  // Example of calling a Java method from the JAR file
  const params = 'yourMethodName ' + JSON.stringify(postData); // Replace 'yourMethodName' with the actual method name
  executeJavaFunction(params, (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err });
    } else {
      res.send({ success: true, result: result });
    }
  });
});

app.post("/execute-sdk", function (req, res) {
  executeDeviceSdkApplication((err, result) => {
      if (err) {
          res.status(500).send({ success: false, error: err });
      } else {
          res.send({ success: true, result: result });
      }
  });
});
