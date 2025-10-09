const express = require("express");
const { exec } = require('child_process');
const path = require('path');

// Replace these with your actual file paths if needed
const esldbConfig = require("./esldbconfig");
const swrdbconfig = require("./swrdbconfig");
const database = require("./database");

const multer = require('multer');  //저장소 관련
const fs = require('fs');

const directoryPath = path.join(__dirname, '../esl-app/public/upload');

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

// *****  Set storage engine ***** 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, 'public/uploads'); // Specify the destination folder
    cb(null, directoryPath); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    //cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PNG files are allowed'), false);
  }
};

// *****  const upload = multer({ storage: storage });
const upload = multer({ storage: storage, fileFilter: fileFilter }); //filter for png only

app.post('/upload/png', upload.single('file'), function (req, res) {
  console.log(new Date() + ' -> /upload/png', req.file.originalname);

  // Check for multer upload errors
  if (req.fileValidationError) {
    console.error('File validation error:', req.fileValidationError);
    return res.status(400).json({ error: 'File validation error' });
  }

  // Check if a file was provided
  if (!req.file) {
    console.error('No file provided');
    return res.status(400).json({ error: 'No file provided' });
  }
  // Log successful file upload
  console.log('File uploaded:', req.file.filename);
  return res.status(200).json({ message: 'File uploaded successfully', uploadfile: req.file.filename });
});

app.get("/", wIntro);

app.get("/esl/opensearch", function (req, res) {
  console.log(new Date() + ' -> /esl/opensearch')
  try {
    // console.log ('-> /esl/opensearch')
    const parameters = [
    ];

    console.log('parameters', parameters)
    const storedProcedure = "UPS_ASYNC_ESLTAG_OPEN"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/esl/inventorysearch", function (req, res) {
  console.log(new Date() + ' -> /esl/inventorysearch')
  try {
    // console.log ('-> /esl/opensearch')
    const parameters = [
      { name: "SBIN_LOCATION", value: req.query.SBIN_LOCATION}
    ];

    console.log('parameters', parameters)
    const storedProcedure = "UPS_ASYNC_ESLTAG_OPEN_INVENTORY"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/esl/d1binsearch_ini", function (req, res) {
  console.log(new Date() + ' -> /esl/d1binsearch_ini')
  try {
    // console.log ('-> /esl/binsearch')
    const parameters = [
    ];

    console.log('parameters', parameters)
    const storedProcedure = "UPS_ASYNC_ESLTAG_D1TYPE_INI"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/esl/d1binsearch_open", function (req, res) {
  console.log(new Date() + ' -> /esl/d1binsearch_open')
  try {
    // console.log ('-> /esl/binsearch')
    const parameters = [
    ];

    console.log('parameters', parameters)
    const storedProcedure = "UPS_ASYNC_ESLTAG_D1TYPE_OPEN"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/esl/d1binsearch_close", function (req, res) {
  console.log(new Date() + ' -> /esl/d1binsearch_close')
  try {
    // console.log ('-> /esl/d1search')
    const parameters = [
      { name: "SBIN_LOCATION", value: req.query.SBIN_LOCATION },
      { name: "SESL_TAG_ID", value: req.query.SESL_TAG_ID}
    ];

    console.log('parameters', parameters)
    const storedProcedure = "UPS_ASYNC_ESLTAG_BINLOCATION_CLOSE"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/esl/d1search", function (req, res) {
  console.log(new Date() + ' -> /esl/d1search')
  try {
    // console.log ('-> /esl/d1search')
    const parameters = [
      { name: "SDATE", value: req.query.SDATE },
      { name: "SBIN_LOCATION", value: req.query.SBIN_LOCATION}
    ];

    console.log('parameters', parameters)
    const storedProcedure = "UPS_ASYNC_ESLTAG_D1TYPE"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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

// Rack Monitoring Dashboard API Endpoints
app.get("/rack/dashboard/overview", function (req, res) {
  console.log(new Date() + ' -> /rack/dashboard/overview')
  try {
    const parameters = [];
    console.log('parameters', parameters)
    const storedProcedure = "USP_SFC_KBAS090_PRINT_R10_M"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/rack/types/summary", function (req, res) {
  console.log(new Date() + ' -> /rack/types/summary')
  try {
    const parameters = [];
    console.log('parameters', parameters)
    const storedProcedure = "USP_SFC_KBAS090_PRINT_R10_M"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/rack/monitoring/realtime", function (req, res) {
  console.log(new Date() + ' -> /rack/monitoring/realtime')
  try {
    const parameters = [];
    console.log('parameters', parameters)
    const storedProcedure = "USP_SFC_KBAS090_PRINT_R10_M"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/rack/alerts/warnings", function (req, res) {
  console.log(new Date() + ' -> /rack/alerts/warnings')
  try {
    const parameters = [];
    console.log('parameters', parameters)
    const storedProcedure = "USP_SFC_KBAS090_PRINT_R10_M"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Rack Detail API Endpoint
app.get("/rack/detail/:rackId", function (req, res) {
  console.log(new Date() + ' -> /rack/detail/' + req.params.rackId)
  try {
    const rackId = req.params.rackId;
    // 고정 파라미터: 회사='KSB', 공장='F002', 공정='DW'
    const parameters = [
      { name: "COMPANY", value: 'KSB' },
      { name: "FACTORY", value: 'F002' },
      { name: "PROCESS_ID", value: 'DW' },
      { name: "MATERIAL_CD", value: '' },
      { name: "BIN_LOCATION_CD", value: rackId }
    ];
    console.log('parameters', parameters)
    const storedProcedure = "USP_SFC_KSTK010_R60_M"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 비정상 데이터 API Endpoint
app.get("/rack/abnormal/data", function (req, res) {
  console.log(new Date() + ' -> /rack/abnormal/data')
  try {
    const parameters = [];
    console.log('parameters', parameters)
    const storedProcedure = "USP_SFC_KBAS090_PRINT_R10_M_ABNORMAL"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 상세 랙 모니터링 데이터 API Endpoint
app.get("/rack/monitoring/detail", function (req, res) {
  console.log(new Date() + ' -> /rack/monitoring/detail')
  try {
    const parameters = [];
    console.log('parameters', parameters)
    const storedProcedure = "USP_SFC_KBAS090_PRINT_R10_M_DETAIL"
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});