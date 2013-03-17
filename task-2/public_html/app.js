/**
 * @link https://github.com/videlalvaro/rabbitpubsub/blob/master/app.js
 * @author Richard Fussenegger
 */
var express = require("express");
var routes = require("./routes");
var http = require("http");
var path = require("path");
var redis = require("redis");
var amqp = require("amqp").createConnection({});
var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server);
var chatExchange;
var RedisStore = require("connect-redis")(express);
var redisClient = redis.createClient();
var sessionStore = new RedisStore({ client: redisClient });
var cookieParser = express.cookieParser("yDj9Fs7DaVVxZdZcuOh0");
var SessionSocket = require("session.socket.io");
var sessionSockets = new SessionSocket(io, sessionStore, cookieParser, "jsessionid");

amqp.on("ready", function () {
  chatExchange = amqp.exchange("chatExchange", { type: "fanout" });
});

io.set("transports", [ "xhr-polling" ]);
io.set("log level", 1);

app.configure(function () {
  app.set("port", process.env.PORT || 3000);
  app.set("views", __dirname + "/views");
  app.set("view engine", "ejs");
  //app.use(express.favicon());
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(cookieParser);
  app.use(express.session({ store: sessionStore, key: "jsessionid", secret: "yDj9Fs7DaVVxZdZcuOh0" }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, "public")));
});

app.configure("development", function () {
  app.use(express.errorHandler());
});

app.get("/", routes.index);

app.get("/logout", function (request, response) {
  request.session.destroy();
  response.redirect("/");
});

app.post("/user", function (request, response) {
  request.session.user = request.body.user;
  response.json({ error: "" });
});

sessionSockets.on("connection", function (error, socket, session) {
  socket.on("chat", function (data) {
    var msg = JSON.parse(data);
    chatExchange.publish("", { action: "message", user: session.user, msg: msg.msg });
  });
  socket.on("join", function () {
    chatExchange.publish("", { action: "control", user: session.user, msg: " joined the channel." });
  });
  amqp.queue("", { exclusive: true }, function (q) {
    q.bind("chatExchange", "");
    q.subscribe(function (message) {
      socket.emit("chat", JSON.stringify(message));
    });
  });
});

server.listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});