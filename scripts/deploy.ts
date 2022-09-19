import * as dotenv from "dotenv";
import fs from "fs";
import {ethers, run} from "hardhat";
import {sleep} from "./sleep";
dotenv.config({path: ".env"});
require("@nomiclabs/hardhat-etherscan");

const TOKEN_NAME = "Registro Nacional de Pessoas Físicas e Jurídicas";
const TOKEN_SYMBOL = "CPF/CNPJ";

async function main() {
  const [admin, manager, teamMember] = await ethers.getSigners();
  const PassportNTTFactory = await ethers.getContractFactory("PassportNTT");
  const passportNTT = await PassportNTTFactory.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    manager.address
  );
  await passportNTT.deployed();
  console.log(`PassportNTT deployed to '${passportNTT.address}'`);
  console.log(`Admin: '${admin.address}'`);
  console.log(`Manager: '${manager.address}'`);

  const TEAM_ROLE = await passportNTT.TEAM_ROLE();
  await passportNTT.connect(manager).grantRole(TEAM_ROLE, teamMember.address);
  console.log(`Team member: '${teamMember.address}'`);

  fs.writeFileSync(
    "scripts/PassportNTT.json",
    JSON.stringify({
      contract: passportNTT.address,
      admin: admin.address,
      manager: manager.address,
      teamMember: teamMember.address,
    })
  );

  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(60000);

  // Verify the contract after deploying
  await run("verify:verify", {
    address: passportNTT.address,
    constructorArguments: [TOKEN_NAME, TOKEN_SYMBOL, manager.address],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
