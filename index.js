const express = require("express");
const { exec } = require('child_process');
const path = require('path');

// Replace these with your actual file paths if needed
const esldbConfig = require("./esldbconfig");
const swrdbconfig = require("./swrdbconfig");
const database = require("./database");

const multer = require('multer');  //저장소 관련
const fs = require('fs');

// Upload dir inside API project (works on any deployment)
const directoryPath = path.join(__dirname, 'upload');
try {
  fs.mkdirSync(directoryPath, { recursive: true });
} catch (e) {
  console.error('Could not create upload directory:', directoryPath, e.message);
}

// Configuration variables from the file you provided
const sPort = 3222; // Port for the Express server

// Initialize app with Express
const app = express();

// Enable CORS first
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  next();
});

// ---- PNG upload route MUST run before body parsers (so multipart body is not consumed) ----
// Multer config and /upload/png are registered below, right after this block.

// Request logging (skip body for multipart to avoid consuming stream)
app.use(function (req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
  const isMultipart = (req.headers['content-type'] || '').includes('multipart/form-data');
  if (!isMultipart && req.body && Object.keys(req.body).length > 0) {
    console.log(`[${timestamp}] Body:`, req.body);
  }
  if (Object.keys(req.query).length > 0) {
    console.log(`[${timestamp}] Query params:`, req.query);
  }
  next();
});

// Multer + PNG upload route MUST be before body parsers (multipart body must not be consumed)
function ensureUploadDir(dir, cb) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    cb(null);
  } catch (e) {
    cb(e);
  }
}
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir(directoryPath, (err) => {
      if (err) return cb(err);
      cb(null, directoryPath);
    });
  },
  filename: (req, file, cb) => {
    const name = file.originalname || 'image.png';
    const ext = path.extname(name) || '.png';
    const base = path.basename(name, ext) || 'image';
    cb(null, base + ext);
  },
});
const uploadFileFilter = (req, file, cb) => {
  try {
    const name = (file && file.originalname) ? file.originalname : '';
    const ext = path.extname(name).toLowerCase();
    const mime = (file && file.mimetype) ? file.mimetype : '';
    if (mime === 'image/png') return cb(null, true);
    if (ext === '.png' && (mime === '' || mime === 'application/octet-stream')) return cb(null, true);
    cb(new Error('Only PNG files are allowed'), false);
  } catch (e) {
    cb(e, false);
  }
};
const upload = multer({ storage: uploadStorage, fileFilter: uploadFileFilter });
app.post('/upload/png', function (req, res) {
  upload.single('file')(req, res, function (err) {
    if (err) {
      console.error('/upload/png error:', err.message);
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    if (!req.file) {
      console.error('No file parsed — field name "file", multipart with boundary required');
      return res.status(400).json({ error: 'No file provided' });
    }
    console.log(new Date() + ' -> /upload/png', req.file.originalname);
    return res.status(200).json({
      message: 'File uploaded successfully',
      uploadfile: req.file.filename,
    });
  });
});

// Body parsers for JSON (other routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Start the Express server
var server = app.listen(process.env.PORT || sPort, function () {
  var port = server.address().port;
  console.log("========================================");
  console.log(`🚀 ESL API Server started successfully!`);
  console.log(`📡 Server running on port ${port}`);
  console.log(`🌐 Access at: http://localhost:${port}`);
  console.log("========================================");
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

app.get("/", wIntro);

app.get("/esl/opensearch", function (req, res) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] GET /esl/opensearch`);
  
  try {
    const parameters = [];

    const storedProcedure = "UPS_ASYNC_ESLTAG_OPEN"
    console.log(`[${timestamp}] Executing stored procedure: ${storedProcedure}`);
    console.log(`[${timestamp}] Parameters:`, JSON.stringify(parameters, null, 2));
    
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error(`[${timestamp}] Error processing /esl/opensearch:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/esl/inventorysearch", function (req, res) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] GET /esl/inventorysearch`);
  console.log('Query parameters:', {
    SBIN_LOCATION: req.query.SBIN_LOCATION || null,
    SCOMPANY: req.query.SCOMPANY || null,
    SFACTORY: req.query.SFACTORY || null
  });
  
  try {
    const parameters = [
      { name: "SBIN_LOCATION", value: req.query.SBIN_LOCATION || null},
      { name: "SCOMPANY", value: req.query.SCOMPANY || null},
      { name: "SFACTORY", value: req.query.SFACTORY || null}
    ];

    const storedProcedure = "UPS_ASYNC_ESLTAG_OPEN_INVENTORY"
    console.log(`[${timestamp}] Executing stored procedure: ${storedProcedure}`);
    console.log(`[${timestamp}] Parameters:`, JSON.stringify(parameters, null, 2));
    
    database.executeStoredProcedure(
      res,
      swrdbconfig,
      storedProcedure,
      parameters
    );
  } catch (error) {
    console.error(`[${timestamp}] Error processing /esl/inventorysearch:`, error);
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