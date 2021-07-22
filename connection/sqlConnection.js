require("dotenv").config();

const mysql = require("mysql");

const {
  NODE_ENV,
  SQL_HOST_DEV,
  SQL_HOST_PROD,
  SQL_USER_DEV,
  SQL_USER_PROD,
  SQL_PASSWORD_DEV,
  SQL_PASSWORD_PROD,
  SQL_DATABASE,
  SQL_PORT,
} = process.env;

// fetch details from ENV file
// host           : NODE_ENV === "dev" ? SQL_HOST_DEV    : SQL_HOST_PROD,
global.con = mysql.createPool({
  host: NODE_ENV === 'dev' ? SQL_HOST_DEV : SQL_HOST_PROD,
  user: NODE_ENV === 'dev' ? SQL_USER_DEV : SQL_USER_PROD,
  password: NODE_ENV === 'dev' ? SQL_PASSWORD_DEV : SQL_PASSWORD_PROD,
  database: SQL_DATABASE,
  port: SQL_PORT,
  connectionLimit: 99,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  // socketPath: '/cloudsql/dbro2020:us-central1:logomator-api'
});

let connection = async function () {
  try {
    // await con.connect();
    await con.query(`create database if not exists ${SQL_DATABASE}`);
    await con.query(`use ${SQL_DATABASE}`);

    await con.on("error", function (err) {
      console.log("db error", err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        // Connection to the MySQL server is usually
        connection(); // lost due to either server restart, or a
      } else {
        // connection(); // lost due to either server restart, or a
        // connection idle timeout (the wait_timeout
        throw err; // server variable configures this)
      }
    });

    await con.on("enqueue", function (connection) {
      console.log("Waiting for available connection slot");
    });

    await con.on("acquire", function (connection) {
      console.log("Connection %d acquired", connection.threadId);
    });

    await con.on("release", function (connection) {
      console.log("Connection %d released", connection.threadId);
    });
  } catch (error) {
    console.log("Error in connecting to database: ", error);
    return error;
  }
};

module.exports = connection;
