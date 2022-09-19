import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {deployNTTFixture, IPassportNTTFixture} from "../shared/fixture";

export async function passportDeployment(): Promise<void> {
  context("#deplyment", async () => {
    let fixture: IPassportNTTFixture;
    beforeEach(async function () {
      // We use loadFixture to run this setup once, snapshot that state,
      // and reset Hardhat Network to that snapshopt in every test.
      fixture = await loadFixture(deployNTTFixture);
    });

    it("Should set the DEFAULT_ADMIN_ROLE to publisher account, set MANAGER_ROLE to the specified manager, and set MANAGER_ROLE as TEAM_ROLE's admin", async function () {
      const DEFAULT_ADMIN_ROLE = await fixture.passportNTT.DEFAULT_ADMIN_ROLE();
      const MANAGER_ROLE = await fixture.passportNTT.MANAGER_ROLE();
      const TEAM_ROLE = await fixture.passportNTT.TEAM_ROLE();

      // the publisher account has DEFAULT_ADMIN_ROLE
      expect(
        await fixture.passportNTT.hasRole(
          DEFAULT_ADMIN_ROLE,
          await fixture.owner.getAddress()
        )
      ).to.be.true;
      // the publisher account doesn't have MANAGER_ROLE neither TEAM_ROLE
      expect(
        await fixture.passportNTT.hasRole(
          MANAGER_ROLE,
          await fixture.owner.getAddress()
        )
      ).to.be.false;
      expect(
        await fixture.passportNTT.hasRole(
          TEAM_ROLE,
          await fixture.owner.getAddress()
        )
      ).to.be.false;
      // the manager has MANAGER_ROLE
      expect(
        await fixture.passportNTT.hasRole(
          MANAGER_ROLE,
          await fixture.manager.getAddress()
        )
      ).to.be.true;
      // the manager account doesn't have DEFAULT_ADMIN_ROLE neither TEAM_ROLE
      expect(
        await fixture.passportNTT.hasRole(
          DEFAULT_ADMIN_ROLE,
          await fixture.manager.getAddress()
        )
      ).to.be.false;
      expect(
        await fixture.passportNTT.hasRole(
          TEAM_ROLE,
          await fixture.manager.getAddress()
        )
      ).to.be.false;
      // the team members account have TEAM_ROLE
      expect(
        await fixture.passportNTT.hasRole(
          TEAM_ROLE,
          await fixture.teamMemberA.getAddress()
        )
      ).to.be.true;
      expect(
        await fixture.passportNTT.hasRole(
          TEAM_ROLE,
          await fixture.teamMemberB.getAddress()
        )
      ).to.be.true;
      // the TEAM_ROLE's admin is the MANAGER_ROLE
      expect(await fixture.passportNTT.getRoleAdmin(TEAM_ROLE)).to.be.eq(
        MANAGER_ROLE
      );
    });
  });
}
