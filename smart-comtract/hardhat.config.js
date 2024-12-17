require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const KAIROS_TESTNET_URL = process.env.KAIROS_TESTNET_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    kairos: {
      url: KAIROS_TESTNET_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    }
  }
};
