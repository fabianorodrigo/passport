import {BigNumber, Signer} from "ethers";
import {ethers} from "hardhat";
import {PassportNTT} from "../../typechain-types";

/**
 * Sets a initial state desired to every test
 *
 * Deploy NTT, associate account owner as DEFAULT_ADMIN_ROLE, manager as MANAGER_ROLE,
 * teamMemberA and teamMemberB as TEAM_ROLE. Mint a unexpireable NTT ID 1 and
 *  a expired NTT ID 2 to accountE
 *
 * @returns contract instance, accounts and roles
 */
export async function deployNTTFixture(): Promise<IPassportNTTFixture> {
  // Contracts are deployed using the first signer/account by default
  const [
    owner,
    manager,
    teamMemberA,
    teamMemberB,
    accountA,
    accountB,
    accountC,
    accountD,
    accountE,
  ] = await ethers.getSigners();

  const PassportNTTFactory = await ethers.getContractFactory("PassportNTT");
  const passportNTT = await PassportNTTFactory.deploy(
    "Registro Nacional de Pessoas Físicas e Jurídicas",
    "CPF/CNPJ",
    manager.address
  );

  const DEFAULT_ADMIN_ROLE = await passportNTT.DEFAULT_ADMIN_ROLE();
  const MANAGER_ROLE = await passportNTT.MANAGER_ROLE();
  const TEAM_ROLE = await passportNTT.TEAM_ROLE();
  // assign team members
  await passportNTT.connect(manager).grantRole(TEAM_ROLE, teamMemberA.address);
  await passportNTT.connect(manager).grantRole(TEAM_ROLE, teamMemberB.address);
  // mint a valid NTT to accountE
  await passportNTT
    .connect(teamMemberA)
    .mint(await accountE.getAddress(), ethers.constants.One);
  // mint NTT to accountE and revoke
  await passportNTT
    .connect(teamMemberA)
    .mint(await accountE.getAddress(), ethers.constants.Zero);
  await passportNTT.connect(teamMemberA).revoke(ethers.constants.Zero);

  return {
    passportNTT,
    owner,
    manager,
    teamMemberA,
    teamMemberB,
    accountA,
    accountB,
    accountC,
    accountD,
    accountE,
    DEFAULT_ADMIN_ROLE,
    MANAGER_ROLE,
    TEAM_ROLE,
    credentialID: ethers.constants.One,
    expiredCredentialID: ethers.constants.Two,
    revokedCredentialID: ethers.constants.Zero,
  };
}

export interface IPassportNTTFixture {
  passportNTT: PassportNTT;
  owner: Signer;
  manager: Signer;
  teamMemberA: Signer;
  teamMemberB: Signer;
  accountA: Signer;
  accountB: Signer;
  accountC: Signer;
  accountD: Signer;
  accountE: Signer;
  DEFAULT_ADMIN_ROLE: string;
  MANAGER_ROLE: string;
  TEAM_ROLE: string;
  //a NTT ID minted in the fixture
  credentialID: BigNumber;
  expiredCredentialID: BigNumber;
  revokedCredentialID: BigNumber;
}
