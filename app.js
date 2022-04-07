var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

let mongoose = require("mongoose");
let multer = require("multer");
let cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");
var questionsRouter = require("./routes/question");
var developersRouter = require("./routes/developer");

const connectionString =
  "mongodb+srv://user1:xnTu0FJAONJWrx2v@cluster0.o6rah.mongodb.net/BoloAppDb?retryWrites=true&w=majority";
mongoose.connect(connectionString, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
var app = express();

const db = mongoose.connection;
db.on("error", (error) => {
  console.log("error", error);
});

db.once("open", async function () {
  app.use(logger("dev"));
  app.use(express.json());
  app.use(cors());
  //app.use("/static", express.static(__dirname + "./public/upload"));
  //app.use(express.static('public'));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  //app.use(express.static(path.join(__dirname, "public")));

  app.get("/", express.static(path.join(__dirname, "./public")));
  app.use("/", indexRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/questions", questionsRouter);
  app.use("/api/developers", developersRouter);

  app.listen(process.env.PORT || 4000, () => console.log("Listening 4000..."));
});

module.exports = app;
