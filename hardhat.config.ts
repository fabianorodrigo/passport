import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// RINKEBY API KEY
const RINKEBY_ALCHEMY_API_KEY_URL = getEV("RINKEBY_ALCHEMY_API_KEY_URL");
// ETHERSCAN API KEY
const ETHERSCAN_API_KEY = getEV("ETHERSCAN_API_KEY");

//ADMIN PRIVATE KEY
const ADMIN_PRIVATE_KEY = getEV("ADMIN_PRIVATE_KEY");
//MANAGER PRIVATE KEY
const MANAGER_PRIVATE_KEY = getEV("MANAGER_PRIVATE_KEY");
//TEAMMEMBER PRIVATE KEY
const TEAMMEMBER_PRIVATE_KEY = getEV("TEAMMEMBER_PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url: RINKEBY_ALCHEMY_API_KEY_URL,
      accounts: [
        ADMIN_PRIVATE_KEY,
        MANAGER_PRIVATE_KEY,
        TEAMMEMBER_PRIVATE_KEY,
      ],
    },
  },
  mocha: {
    reporter: "mocha-multi-reporters",
    reporterOptions: {
      configFile: "./mocha-reporter-config.json",
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;

/**
 * Gets the environment variable value with the given name or throws an error if value is not set.
 *
 * @param name name of the environment variable
 * @returns Value of the environment variable
 */
function getEV(name: string): string {
  const value = process.env[name];
  if (value == null || value.trim() == "") {
    throw new Error(`Environment variable '${name}' is required`);
  }
  return value;
}
