require("@nomiclabs/hardhat-waffle");
// require('dotenv').config();


// const privateKey = process.env.PRIVATE_KEY;

const fs = require('fs')
const privateKey = fs.readFileSync(".secret").toString().trim();

if (!privateKey) {
  console.error('Error: Could not read the PRIVATE_KEY from the .env file');
  process.exit(1);
}


module.exports = {
  solidity: "0.8.7",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545"
    },
    polygon: {
      url: "https://rpc-mumbai.maticvigil.com/v1/99a99d15ac2ad3b526aa97401fdbe30ee724ba38",
      accounts: [privateKey]
    },
    polygon_testnet: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [privateKey],
      chainId: 80001,
      gasPrice: 10000000000
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [privateKey]
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [privateKey]
    },
  },
};
