import {BigNumber} from "ethers";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {deployNTTFixture, IPassportNTTFixture} from "../shared/fixture";
import {UtilsTest} from "../shared/Utils";

export async function passportBalanceOf(): Promise<void> {
  context("#balanceOf", async () => {
    let fixture: IPassportNTTFixture;
    beforeEach(async function () {
      // We use loadFixture to run this setup once, snapshot that state,
      // and reset Hardhat Network to that snapshopt in every test.
      fixture = await loadFixture(deployNTTFixture);
    });

    it("Should return balanceOf multi NTT owner", async function () {
      const holderAddress = await fixture.accountE.getAddress();
      expect(await fixture.passportNTT.balanceOf(holderAddress)).to.be.equal(
        BigNumber.from(2)
      );
    });
    it("Should return balanceOf only one NTT owner", async function () {
      const holderAddress = await fixture.accountA.getAddress();
      const credentialID = UtilsTest.getRandomAmount();

      await fixture.passportNTT
        .connect(fixture.teamMemberA)
        .mint(holderAddress, credentialID);

      expect(await fixture.passportNTT.balanceOf(holderAddress)).to.be.equal(
        ethers.constants.One
      );
    });
    it("Should return balanceOf account without NTT", async function () {
      const holderAddress = await fixture.accountA.getAddress();
      expect(await fixture.passportNTT.balanceOf(holderAddress)).to.be.equal(
        ethers.constants.Zero
      );
    });
    it("Should revert if gets balance of a zero address holder", async function () {
      await expect(
        fixture.passportNTT
          .connect(fixture.teamMemberA)
          .balanceOf(ethers.constants.AddressZero)
      ).to.revertedWith("ERC4671: address zero is not a valid owner");
    });
  });
}
