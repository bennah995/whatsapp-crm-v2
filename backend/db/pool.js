require("dotenv").config({path: require('path').join(__dirname, '..', '.env')});
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: parseInt(process.env.PG_PORT || "5432", 10),
  user: process.env.PG_USER || "crm_app",
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || "crm_dev",
  max: 10,
  idleTimeoutMillis: 30000,
});

module.exports = pool;