import {BigNumber} from "ethers";

export interface ICredential {
  // credential identifier (if sensitive, recomended to persist a hash)
  tokenId: BigNumber;
  holder: string;
  // wallet address of the natural person who issued the credential (???)
  issuer: string;
  issueDate: BigNumber;
  revoked: boolean;
}
