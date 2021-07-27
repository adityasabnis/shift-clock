const express = require("express");
const _ = require("lodash");
const compression = require("compression");
const asyncMw = require('async-express-mw');
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");

const userRouter = require('./userRouter');
const passwordUtil = require('./utils/password');

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(compression());
app.use(
  cors({
    allowedHeaders:
      "X-Requested-With,Content-Type,Authorization,If-Unmodified-Since,Cache-Control,Accept-Version",
    exposedHeaders: "etag",
    methods: "GET,PATCH,POST,DELETE",
    origin: "*",
    maxAge: 3600,
  })
);

app.get(["/", "/healthCheck"], (req, res) => {
  res.status(200).send({ status: "ok" });
});

app.post("/signUp", asyncMw(async (req, res) => {
  const client = await MongoClient.connect(
    "mongodb://admin:password@localhost:27017"
  );

  const hashedPassword = await passwordUtil.hashPassword(req.body.password);

  const db = client.db("shift-clock");
  const result = await db.collection("users").insertOne({
    email: req.body.emailAddress,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  });

  client.close();
  res
    .status(200)
    .send({ status: `User signed up successfully with id: ${result.insertedId}` });
}));

app.post('/auth/token', asyncMw(async (req, res) => {
  const client = await MongoClient.connect(
    "mongodb://admin:password@localhost:27017"
  );

  const db = client.db("shift-clock");
  const userRecord = _.first(await db.collection("users").find({email: req.body.emailAddress}).toArray());

  if(!userRecord) {
    res.status(404).send({
      message: `User not found with emailAddress: ${req.body.emailAddress}`,
    });
  }

  const isVerified = await passwordUtil.verifyPassword(req.body.password, userRecord.password);

  if(!isVerified) {
    res
      .status(401)
      .send({
        message: `Authentication Failed`,
      });
  }

  res
  .status(200)
  .send({
    message: `Successfully Authenticated`,
  });
}));

app.use("/users", userRouter);

// Start Express Api
app.listen(3000, (err) => {
  if (err) console.error({ err }, err.message);

  console.log("Listening on localhost:3000");
});
