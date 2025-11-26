// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BarcelMarketplace
 * @dev Smart contract for handling payments between buyers and sellers on Celo network
 */
contract BarcelMarketplace {
    // Struct to represent a purchase transaction
    struct Purchase {
        address buyer;
        address seller;
        uint256 amount;
        string productId;
        bool completed;
        bool refunded;
        uint256 timestamp;
    }

    // Mapping from purchase ID to Purchase struct
    mapping(bytes32 => Purchase) public purchases;
    
    // Mapping to track seller earnings
    mapping(address => uint256) public sellerEarnings;
    
    // Events
    event PurchaseCreated(
        bytes32 indexed purchaseId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string productId,
        uint256 timestamp
    );
    
    event PurchaseCompleted(
        bytes32 indexed purchaseId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );
    
    event RefundIssued(
        bytes32 indexed purchaseId,
        address indexed buyer,
        uint256 amount
    );

    /**
     * @dev Create a purchase transaction when buyer confirms payment
     * @param seller The address of the seller
     * @param productId The unique identifier of the product
     * @return purchaseId The unique identifier for this purchase
     */
    function createPurchase(
        address seller,
        string memory productId
    ) external payable returns (bytes32) {
        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Cannot buy from yourself");
        require(msg.value > 0, "Payment amount must be greater than 0");
        
        bytes32 purchaseId = keccak256(
            abi.encodePacked(
                msg.sender,
                seller,
                productId,
                block.timestamp,
                block.number
            )
        );
        
        require(purchases[purchaseId].buyer == address(0), "Purchase ID already exists");
        
        purchases[purchaseId] = Purchase({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            productId: productId,
            completed: false,
            refunded: false,
            timestamp: block.timestamp
        });
        
        emit PurchaseCreated(purchaseId, msg.sender, seller, msg.value, productId, block.timestamp);
        
        return purchaseId;
    }

    /**
     * @dev Complete the purchase and transfer funds to seller
     * @param purchaseId The unique identifier of the purchase
     */
    function completePurchase(bytes32 purchaseId) external {
        Purchase storage purchase = purchases[purchaseId];
        
        require(purchase.buyer != address(0), "Purchase does not exist");
        require(purchase.seller == msg.sender, "Only seller can complete purchase");
        require(!purchase.completed, "Purchase already completed");
        require(!purchase.refunded, "Purchase was refunded");
        
        purchase.completed = true;
        sellerEarnings[purchase.seller] += purchase.amount;
        
        // Transfer funds to seller
        (bool success, ) = payable(purchase.seller).call{value: purchase.amount}("");
        require(success, "Transfer to seller failed");
        
        emit PurchaseCompleted(
            purchaseId,
            purchase.buyer,
            purchase.seller,
            purchase.amount
        );
    }

    /**
     * @dev Get purchase details
     * @param purchaseId The unique identifier of the purchase
     * @return buyer The buyer's address
     * @return seller The seller's address
     * @return amount The purchase amount
     * @return productId The product identifier
     * @return completed Whether the purchase is completed
     * @return refunded Whether the purchase was refunded
     */
    function getPurchase(bytes32 purchaseId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        string memory productId,
        bool completed,
        bool refunded
    ) {
        Purchase memory purchase = purchases[purchaseId];
        return (
            purchase.buyer,
            purchase.seller,
            purchase.amount,
            purchase.productId,
            purchase.completed,
            purchase.refunded
        );
    }

    /**
     * @dev Get seller's total earnings
     * @param seller The seller's address
     * @return Total earnings in wei
     */
    function getSellerEarnings(address seller) external view returns (uint256) {
        return sellerEarnings[seller];
    }

    /**
     * @dev Check if purchase exists
     * @param purchaseId The unique identifier of the purchase
     * @return Whether the purchase exists
     */
    function purchaseExists(bytes32 purchaseId) external view returns (bool) {
        return purchases[purchaseId].buyer != address(0);
    }
}

