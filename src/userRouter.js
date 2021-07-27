const {Router} = require('express');
const asyncMw = require('async-express-mw');
const expressParams = require("express-params-handler");
const MongoClient = require("mongodb").MongoClient;

const router = Router();
router.param("userId", expressParams(String));

router.get(
  "/:userId/stamps",
  asyncMw(async (req, res) => {
    console.log("From router: ", );
    const client = await MongoClient.connect(
      "mongodb://admin:password@localhost:27017"
    );

    const db = client.db("shift-clock");
    const userStamps = await db
      .collection("user-stamps")
      .find({ userId: req.params.userId })
      .toArray();

    res.status(200).send(userStamps);
  })
);
  
router.post(
  "/:userId/stamps",
  asyncMw(async (req, res) => {
    const client = await MongoClient.connect(
      "mongodb://admin:password@localhost:27017"
    );

    const db = client.db("shift-clock");
    await db.collection("user-stamps").insertOne({
      userId: req.params.userId,
      state: req.body.state,
      timeStamp: new Date().toISOString(),
    });

    client.close();
    res.status(200).send({ status: "record added" });
  })
);
  
module.exports = router;
