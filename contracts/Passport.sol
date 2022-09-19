// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./structs/Credential.struct.sol";
import "./interfaces/IERC4671Metadata.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/**
 * @notice Passport NTT - Non-Tradable Tokens Standard, aka badges or souldbound NFTs (EIP-4671)
 * A non-tradable token, or NTT, represents inherently personal possessions (material or immaterial),
 * such as university diplomas, online training certificates, government issued documents (national id,
 * driving license, visa, wedding, etc.), labels, and so on.
 *
 * @dev A NTT contract is seen as representing one type of certificate delivered by one authority.
 * For instance, one NTT contract for the French National Id, another for Ethereum EIP creators, and so on…
 *
 * OBS: Talvez seja o caso de propor outra ERC para o caso de formação de cadeia de contratos (semelhante ao
 * que acontece nas autoridades certificadoras).
 *
 * Por exemplo, existirá um contrato global que guardará os endereços dos contratos válidos da autoridades
 * máximas nacionais (um pra cada país)
 * Esse contratos das autoridades máximas nacionais terão uma lista de contratos que são autoridades para emissão
 * de NTTs para tipos específicos de NTTs. Por exemplo, para emissão de CNH, a rede pode/deve confirmar se o contrato
 * emissor é o smart contract oficial do Detran; para autorizar/credenciar instituições formais de ensino, pode/deve confirmar
 * se o contrato emissor é o smart contract oficial do MEC.
 * Continuando a cadeia ... qualquer estabelecimento de ensino pode emitir certificados de conclusão. Mas para
 * diplomas formais (doutorado, mestrado, faculdade), o usuário final pode/deve verificar se o smart contract emissor
 * tem a credencial necessária no smart contract do MEC [IDEIA A SER LAPIDADA]
 *
 */
contract PassportNTT is AccessControl, IERC4671Metadata {
    using Strings for uint256;
    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // array because an issuer can issue multiple NTTs to the same holder
    // For instance, a university can issue college, masters degree and doctorate
    // to the same person
    mapping(address => uint256[]) private _credentialsID;
    // Mapping from NTT credential ID to holder address
    mapping(uint256 => address) private _holders;
    // Mapping from NTT credential ID to Credential metadata
    mapping(uint256 => Credential) private _credentials;

    // Create a new role identifier for the manager role
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER");
    // Create a new role identifier for the team role
    bytes32 public constant TEAM_ROLE = keccak256("TEAM");

    constructor(
        string memory name_,
        string memory symbol_,
        address manager_
    ) {
        _name = name_;
        _symbol = symbol_;
        // Grant the admin role to the publisher account
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Grant the manager role to the informed manager account
        _setupRole(MANAGER_ROLE, manager_);
        // Sets MANAGER_ROLE as TEAM_ROLE's admin role.
        _setRoleAdmin(TEAM_ROLE, MANAGER_ROLE);
    }

    /**
     * @notice Mint a new NTT credential
     * @param holder Address for whom to assign the token
     * @param tokenId The credential ID unique identifier
     */
    function mint(address holder, uint256 tokenId)
        external
        virtual
        onlyRole(TEAM_ROLE)
    {
        _mintUnsafe(holder, tokenId);
        emit Minted(holder, tokenId);
    }

    /// @notice Mark the credential token as revoked
    /// @param tokenId Identifier of the token
    function revoke(uint256 tokenId) external virtual onlyRole(TEAM_ROLE) {
        _requireMinted(tokenId);
        require(
            _credentials[tokenId].revoked == false,
            "Credential is already revoked"
        );
        _credentials[tokenId].revoked = true;
        emit Revoked(_ownerOf(tokenId), tokenId);
    }

    /**
     * @notice Return the total number of credentials already registered (invalids and valids)
     *
     * @dev Valid credential is not revoked
     *
     * @param holder address holder of NTTs
     */
    function balanceOf(address holder)
        external
        view
        override
        returns (uint256)
    {
        require(
            holder != address(0),
            "ERC4671: address zero is not a valid owner"
        );
        return _credentialsID[holder].length;
    }

    /**
     * @notice Returns the owner of a specific  NTT credential
     *
     * @param tokenId  NTT credential ID
     */
    function ownerOf(uint256 tokenId) external view override returns (address) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "ERC4671: invalid token ID");
        return owner;
    }

    /**
     * Gets the credential metadata
     *
     * @param tokenId credential ID which metadata will be returned
     */
    function getCredential(uint256 tokenId)
        external
        view
        returns (Credential memory)
    {
        _requireMinted(tokenId);
        return _credentials[tokenId];
    }

    /**
     * @notice Return TRUE is the credential associated to the {tokenId} is not
     * revoked nor expired
     *
     * @param tokenId  NTT credential ID
     */
    function isValid(uint256 tokenId) external view override returns (bool) {
        _requireMinted(tokenId);
        return _credentials[tokenId].revoked == false;
    }

    /**
     * @notice Return TRUE if the {holder} has at least one valid credential
     * @param holder The holder whom will be verified if has valid credentials
     *
     * @dev Valid credential is not revoked nor expired
     */
    function hasValid(address holder) external view override returns (bool) {
        if (_credentialsID[holder].length == 0) return false;
        for (uint256 i = 0; i < _credentialsID[holder].length; i++) {
            uint256 tokenId = _credentialsID[holder][i];
            if (this.isValid(tokenId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice URI to query to get the token's metadata
     * @param tokenId Identifier of the token
     * @return URI for the token
     */
    function tokenURI(uint256 tokenId)
        external
        view
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString()))
                : "";
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(AccessControl).interfaceId ||
            interfaceId == type(IERC4671).interfaceId ||
            interfaceId == type(IERC4671Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /// @notice Mint a given tokenId
    /// @param holder Address for whom to assign the token
    /// @param tokenId NTT credential identifier to assign to the holder
    function _mintUnsafe(address holder, uint256 tokenId) internal {
        require(holder != address(0), "ERC4671: mint to the zero address");
        // Faz sentido? Ou podemos querer associar múltiplos address à mesma credencial?
        // Mas neste caso, a assinatura dos métodos "_ownerOf" deveriam retornar array de address
        require(
            _credentials[tokenId].holder == address(0),
            "Cannot mint an assigned token"
        );
        _credentialsID[holder].push(tokenId);
        // Mapping from NTTholderential ID to owner address
        _holders[tokenId] = holder;
        // Mapping from NTT credential ID to Credential metadata
        _credentials[tokenId] = Credential(
            tokenId,
            holder,
            msg.sender,
            block.timestamp,
            false
        );
    }

    /**
     * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
     */
    function _ownerOf(uint256 tokenId) internal view virtual returns (address) {
        return _holders[tokenId];
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Reverts if the `tokenId` has not been minted yet.
     */
    function _requireMinted(uint256 tokenId) internal view virtual {
        require(_exists(tokenId), "ERC4671: invalid token ID");
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }
}
