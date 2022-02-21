require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

require('dotenv').config()
const privateKey = process.env.SECRET_KEY

module.exports = {
  networks: {
    hardhat:{
      forking:{
        url: 'https://polygon-mainnet.g.alchemy.com/v2/'+ privateKey
      }
    }  
  },
  solidity: "0.8.4",
};
