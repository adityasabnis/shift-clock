const express = require("express");
const expressParams = require("express-params-handler");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");

const MongoClient = require("mongodb").MongoClient;
const app = express();

app.use(bodyParser.json({ limit: "28mb" }));
app.use(compression());
app.use(
  cors({
    allowedHeaders:
      "X-Requested-With,Content-Type,Authorization,If-Unmodified-Since,Cache-Control,Accept-Version",
    exposedHeaders: "etag",
    methods: "GET,PUT,PATCH,POST,DELETE",
    origin: "*",
    maxAge: 3600,
  })
);

app.param("userId", expressParams(Number));

app.get("/", (req, res) => {
  res.status(200).send({ status: "ok" });
});

app.post("/users/:userId/stamp", (req, res, next) => {
  MongoClient.connect(
    "mongodb://admin:password@localhost:27017",
    (err, client) => {
      if (err) throw err;

      const db = client.db("shift-clock");
      db.collection("user-stamps")
        .insertOne({
          userId: req.params.userId,
          state: req.body.state,
          timeStamp: new Date().toISOString(),
        })
        .then(() => {
          client.close();
          res.status(200).send({ status: "record added" });
        });
    }
  );
});

app.listen(3000, (err) => {
  if (err) console.error({ err }, err.message);

  console.log("Listening on localhost:3000");
});
