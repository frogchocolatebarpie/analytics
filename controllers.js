const axios = require("axios");

const endpoints = {
  chainInfo: "https://bridgeapi.anyswap.exchange/data/allBridgeChainInfo",
  bridgeInfo: "https://netapi.anyswap.net/bridge/v2/info",
  nodesList: "https://netapi.anyswap.net/nodes/list",
  serverInfo: "https://bridgeapi.anyswap.exchange/v2/serverInfo/all",
  stable: "https://bridgeapi.anyswap.exchange/data/stats/stable",
  stats: "https://bridgeapi.anyswap.exchange/data/stats",
  history: ({ offset, limit, status }) =>
    `https://bridgeapi.anyswap.exchange/v2/all/history/all/all/all/all?offset=${offset}&limit=${limit}&status=${status}`,
  detail: ({ hash }) =>
    `https://bridgeapi.anyswap.exchange/v2/history/details?params=${hash}`,
};

async function getBridgeInfo() {
  try {
    const { data: bridgeInfo } = await axios.get(endpoints.bridgeInfo);
    return bridgeInfo;
  } catch (error) {
    console.error(error);
  }
}

async function getChainInfo() {
  try {
    const { data: chainInfo } = await axios.get(endpoints.chainInfo);
    return {
      all: Object.values(chainInfo).map((chain) => chain.name),
      mainnet: Object.values(chainInfo)
        .filter(({ networkType }) => networkType === "MAINNET")
        .map((chain) => chain.name),
      testnet: Object.values(chainInfo)
        .filter(({ networkType }) => networkType === "TESTNET")
        .map((chain) => chain.name),
      chainInfo,
    };
  } catch (error) {
    console.error(error);
  }
}

async function getServerInfo() {
  try {
    const { data } = await axios.get(endpoints.serverInfo);
    return data;
  } catch (error) {
    console.error(error);
  }
}

// status: 8 Confirming, 9 Minting, 10 Success
async function getAllHistory({ status = 10, offset = 0, limit = 100 }) {
  try {
    const { data: chainInfo } = await axios.get(endpoints.chainInfo);
    const { data } = await axios.get(
      endpoints.history({ status, offset, limit })
    );
    const { info } = data;
    return info.map(
      ({
        pairid,
        swapinfo,
        from,
        bind,
        to,
        formatvalue,
        formatswapvalue,
        fromChainID,
        txid,
        toChainID,
        swaptx,
        inittime,
      }) => {
        const symbol = pairid
          ? String(pairid)
              .replace(/(any|v\d+)/, "")
              .toUpperCase()
          : String(swapinfo.routerSwapInfo.tokenID)
              .replace(/(any|v\d+)/, "")
              .toUpperCase();
        return {
          symbol,
          sent: Number(formatvalue),
          received: Number(formatswapvalue),
          fromAddress: from,
          toAdddress: bind,
          contractAddress: to,
          srcChain: chainInfo[fromChainID].name,
          srcHash: txid,
          destChain: chainInfo[toChainID].name,
          destHash: swaptx,
          inittime: new Date(inittime),
        };
      }
    );
  } catch (error) {
    console.error(error);
  }
}

async function countTokens() {
  try {
    const tokens = await getAllHistory({});

    return tokens.reduce((result, token) => {
      if (result[token.symbol]) {
        result[token.symbol]++;
      } else {
        result[token.symbol] = 1;
      }

      return result;
    }, {});
  } catch (error) {
    console.error(error);
  }
}

async function getDetailHistory({ hash }) {
  // hash: src chain, dest chain
  try {
    const response = await axios.get(endpoints.detail({ hash }));
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

async function getStats() {
  try {
    const { data: stats } = await axios.get(endpoints.stats);
    const { data: stable } = await axios.get(endpoints.stable);

    // stats for 24h, 7d, M, all
    return Object.keys(stats).reduce((obj, key) => {
      obj[key] = Number(stats[key]) + Number(stable[key]);

      return obj;
    }, {});
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getChainInfo,
  getBridgeInfo,
  getServerInfo,
  getAllHistory,
  getDetailHistory,
  getStats,
  countTokens,
};
