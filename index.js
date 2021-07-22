const express      = require('express');
const app          = express();
const PORT         = process.env.PORT || 8000;

const cors         = require('cors');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan       = require('morgan');

const routes       = require("./routes");
const mySQLServer  = require("./connection/sqlConnection");

app.use(cors());
app.use(morgan("dev"));
app.use(express.static('public'));

// COOKIES
app.use(cookieParser({
  name: 'session',
  secret: "SESS",
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000 * 10 // 24 hours * 10 days
}));

// BODY PARSER
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true,
  parameterLimit: 50000,
}));

app.use("/api", routes);
console.log("PORT ===> ", PORT)

mySQLServer();

// SERVER
app.listen(PORT, () => {
  console.log(`Logomator API listening on port ${PORT}!`);
});