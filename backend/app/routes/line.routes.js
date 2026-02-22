const express = require("express");
const line = require("@line/bot-sdk");
const lineController = require("../controllers/line.controller");

const router = express.Router();

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

router.post(
  "/",
  express.raw({ type: "application/json" }),
  line.middleware(lineConfig),
  lineController.webhook,
);

module.exports = router;
