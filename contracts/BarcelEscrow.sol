// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BarcelEscrow
 * @dev Smart contract for handling escrow payments on Celo network
 */
contract BarcelEscrow {
    enum EscrowStatus {
        Pending,
        Released,
        Refunded,
        Cancelled
    }

    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        string productId;
        EscrowStatus status;
        uint256 createdAt;
        uint256 releasedAt;
    }

    mapping(bytes32 => Escrow) public escrows;
    mapping(address => bytes32[]) public buyerEscrows;
    mapping(address => bytes32[]) public sellerEscrows;

    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string productId,
        uint256 timestamp
    );

    event EscrowReleased(
        bytes32 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 timestamp
    );

    event EscrowRefunded(
        bytes32 indexed escrowId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    event EscrowCancelled(
        bytes32 indexed escrowId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @dev Create a new escrow
     * @param seller The seller's address
     * @param productId The product identifier
     * @return escrowId The unique escrow identifier
     */
    function createEscrow(
        address seller,
        string memory productId
    ) external payable returns (bytes32) {
        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Cannot create escrow with yourself");
        require(msg.value > 0, "Amount must be greater than 0");

        bytes32 escrowId = keccak256(
            abi.encodePacked(
                msg.sender,
                seller,
                productId,
                block.timestamp,
                block.number
            )
        );

        require(escrows[escrowId].buyer == address(0), "Escrow ID already exists");

        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            productId: productId,
            status: EscrowStatus.Pending,
            createdAt: block.timestamp,
            releasedAt: 0
        });

        buyerEscrows[msg.sender].push(escrowId);
        sellerEscrows[seller].push(escrowId);

        emit EscrowCreated(escrowId, msg.sender, seller, msg.value, productId, block.timestamp);

        return escrowId;
    }

    /**
     * @dev Release escrow funds to seller (buyer confirms delivery)
     * @param escrowId The escrow identifier
     */
    function releaseEscrow(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.buyer != address(0), "Escrow does not exist");
        require(escrow.buyer == msg.sender, "Only buyer can release escrow");
        require(escrow.status == EscrowStatus.Pending, "Escrow not in pending status");

        escrow.status = EscrowStatus.Released;
        escrow.releasedAt = block.timestamp;

        (bool success, ) = payable(escrow.seller).call{value: escrow.amount}("");
        require(success, "Transfer to seller failed");

        emit EscrowReleased(escrowId, escrow.buyer, escrow.seller, escrow.amount, block.timestamp);
    }

    /**
     * @dev Refund escrow funds to buyer
     * @param escrowId The escrow identifier
     */
    function refundBuyer(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.buyer != address(0), "Escrow does not exist");
        require(
            escrow.seller == msg.sender || escrow.buyer == msg.sender,
            "Only buyer or seller can refund"
        );
        require(escrow.status == EscrowStatus.Pending, "Escrow not in pending status");

        escrow.status = EscrowStatus.Refunded;
        escrow.releasedAt = block.timestamp;

        (bool success, ) = payable(escrow.buyer).call{value: escrow.amount}("");
        require(success, "Transfer to buyer failed");

        emit EscrowRefunded(escrowId, escrow.buyer, escrow.amount, block.timestamp);
    }

    /**
     * @dev Cancel escrow (only buyer can cancel before release)
     * @param escrowId The escrow identifier
     */
    function cancelEscrow(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.buyer != address(0), "Escrow does not exist");
        require(escrow.buyer == msg.sender, "Only buyer can cancel escrow");
        require(escrow.status == EscrowStatus.Pending, "Escrow not in pending status");

        escrow.status = EscrowStatus.Cancelled;
        escrow.releasedAt = block.timestamp;

        (bool success, ) = payable(escrow.buyer).call{value: escrow.amount}("");
        require(success, "Transfer to buyer failed");

        emit EscrowCancelled(escrowId, escrow.buyer, escrow.amount, block.timestamp);
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(bytes32 escrowId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        string memory productId,
        EscrowStatus status,
        uint256 createdAt,
        uint256 releasedAt
    ) {
        Escrow memory escrow = escrows[escrowId];
        return (
            escrow.buyer,
            escrow.seller,
            escrow.amount,
            escrow.productId,
            escrow.status,
            escrow.createdAt,
            escrow.releasedAt
        );
    }

    /**
     * @dev Get buyer's escrows
     */
    function getBuyerEscrows(address buyer) external view returns (bytes32[] memory) {
        return buyerEscrows[buyer];
    }

    /**
     * @dev Get seller's escrows
     */
    function getSellerEscrows(address seller) external view returns (bytes32[] memory) {
        return sellerEscrows[seller];
    }
}

