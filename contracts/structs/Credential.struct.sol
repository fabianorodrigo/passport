//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

struct Credential {
    // credential identifier (if sensitive, recomended to persist a hash)
    uint256 tokenId;
    address holder;
    // wallet address of the natural person who issued the credential (???)
    address issuer;
    uint256 issueDate;
    bool revoked;
}
