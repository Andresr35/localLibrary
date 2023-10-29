require("dotenv").config();
const compression = require("compression");
const helmet = require("helmet");
// console.log(process.env) // remove this after you've confirmed it is working
var createError = require("http-errors");
var express = require("express");

// Start mongooose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_PASS;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog");

var app = express();

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);
app.use(compression());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views")); // This tells us where our html templates are
app.set("view engine", "pug"); // This tells it what view engine we are using

app.use(logger("dev"));
app.use(express.json()); // This lets us get json
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // cause cookies are yummy
app.use(express.static(path.join(__dirname, "public"))); // lets us use the public folder

app.use("/", indexRouter); //two different routers
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
