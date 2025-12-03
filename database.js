const sql = require("mssql");

// Function to connect to the database and execute the query
const executeQuery = async (response, dbConfig,strQuery) => {
  try {
    const pool = await new sql.ConnectionPool(dbConfig).connect();
    const request = pool.request();
    const result = await request.query(strQuery);
    await pool.close();

    // console.log("executeQuery",result);
    response.send(result.recordset);
  } catch (error) {
    console.log("Error while connecting to the database:", error);
    response.send(error);
  }
};

// Function to connect to the database and execute the stored procedure
const executeStoredProcedure = async (response, dbConfig, procedureName, parameters) => {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[${timestamp}] [DB] Connecting to database...`);
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    if (parameters && parameters.length > 0) {
      parameters.forEach((param) => {
        request.input(param.name, param.value);
      });
    }

    console.log(`[${timestamp}] [DB] Executing stored procedure: ${procedureName}`);
    const result = await request.execute(procedureName);
    await pool.close();

    console.log(`[${timestamp}] [DB] Stored procedure executed successfully. Records returned: ${result.recordset ? result.recordset.length : 0}`);
    response.send(result.recordset);
  } catch (error) {
    console.error(`[${timestamp}] [DB] Error executing stored procedure ${procedureName}:`, error.message);
    console.error(`[${timestamp}] [DB] Error details:`, error);
    if (!response.headersSent) {
      response.status(500).json({ error: "Database error", details: error.message });
    } else {
      response.send(error);
    }
  }
};

// Function to connect to the database and execute the query
const statementQuery = async (response, dbConfig,strQuery) => {
  try {
    const pool = await new sql.ConnectionPool(dbConfig).connect();
    const request = pool.request();
    const result = await request.query(strQuery);
    await pool.close();

    // console.log("Connected to database");
    response.send(result);
  } catch (error) {
    console.log("Error while connecting to the database:", error);
    response.send(error);
  }
};

module.exports = { executeQuery, executeStoredProcedure,statementQuery };
