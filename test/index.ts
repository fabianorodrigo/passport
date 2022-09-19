import {passportBalanceOf} from "./NTT/Passport.balanceOf.spec";
import {passportGetCredential} from "./NTT/Passport.getCredential.spec";
import {passportHasValid} from "./NTT/Passport.hasValid.spec";
import {passportIsValid} from "./NTT/Passport.isValid.spec";
import {passportMint} from "./NTT/Passport.mint.spec";
import {passportOwnerOf} from "./NTT/Passport.ownerOf.spec";
import {passportRevoke} from "./NTT/Passport.revoke.spec";
import {passportDeployment} from "./NTT/PassportNTT.deployment.spec";

describe(`Integration tests`, async () => {
  describe(`Passport NTT`, async () => {
    passportDeployment();
    passportBalanceOf();
    passportMint();
    passportOwnerOf();
    passportGetCredential();
    passportRevoke();
    passportIsValid();
    passportHasValid();
  });
});
