const express = require("express");
const controllers = require("./controllers");

const app = express();
const port = 3000;

app.get("/bridge-info", async (_, res) => {
  const bridgeInfo = await controllers.getBridgeInfo();
  res.send(bridgeInfo);
});

app.get("/chain-info", async (_, res) => {
  const chainInfo = await controllers.getChainInfo();
  res.send(chainInfo);
});

app.get("/history", async (_, res) => {
  const history = await controllers.getAllHistory({});
  res.send(history);
});

app.get("/count-tokens", async (_, res) => {
  const history = await controllers.countTokens();
  res.send(history);
});

app.get("/stats", async (_, res) => {
  const stats = await controllers.getStats();
  res.send(stats);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
