# New Features Modules Documentation

This document describes the three new features added to Barcel as modular components.

## 📁 Module Structure

All new features are organized in the `/src/modules/` directory:

```
src/modules/
├── ai-negotiation/          # AI-driven negotiation system
│   ├── types.ts
│   ├── services.ts
│   └── components/
│       └── negotiation-modal.tsx
├── celo-escrow/             # CELO on-chain escrow payments
│   ├── types.ts
│   ├── services.ts
│   └── components/
│       ├── escrow-payment-button.tsx
│       └── escrow-contract.ts
├── ai-assistant/            # In-app AI assistant chatbot
│   ├── types.ts
│   ├── services.ts
│   └── components/
│       ├── assistant-chat.tsx
│       └── assistant-button.tsx
└── trust-score/             # Trust score system
    ├── types.ts
    ├── services.ts
    └── components/
        └── trust-score-badge.tsx
```

## 🎯 Feature 1: AI Negotiation System

### Overview
AI-powered negotiation between buyers and sellers with different negotiation styles.

### Frontend Components
- **Location**: `src/modules/ai-negotiation/components/negotiation-modal.tsx`
- **Usage**: Added to product page action buttons
- **Features**:
  - Style selection (polite, firm, aggressive, funny)
  - Target price input
  - Real-time negotiation steps display
  - Final offer display

### Backend API
- **Endpoint**: `POST /api/negotiate`
- **Location**: `src/app/api/negotiate/route.ts`
- **Request Body**:
  ```json
  {
    "productId": "string",
    "sellerId": "string",
    "currentPrice": number,
    "targetPrice": number,
    "style": "polite" | "firm" | "aggressive" | "funny",
    "buyerAddress": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": boolean,
    "steps": NegotiationStep[],
    "finalPrice": number,
    "finalOffer": {
      "price": number,
      "message": string,
      "accepted": boolean
    },
    "negotiationId": string
  }
  ```

### Integration
The "Negotiate with AI" button is automatically added to product pages when a wallet is connected.

## 🔒 Feature 2: CELO Escrow System

### Overview
On-chain escrow payments using CELO smart contracts for secure transactions.

### Smart Contract
- **Location**: `contracts/BarcelEscrow.sol`
- **Network**: Celo Alfajores (testnet) / Celo Mainnet
- **Functions**:
  - `createEscrow(seller, productId)` - Lock funds
  - `releaseEscrow(escrowId)` - Release to seller
  - `refundBuyer(escrowId)` - Refund to buyer
  - `cancelEscrow(escrowId)` - Cancel and refund

### Frontend Components
- **Location**: `src/modules/celo-escrow/components/escrow-payment-button.tsx`
- **Usage**: Appears on product page when offer is approved
- **Features**:
  - CELO amount display
  - Escrow explanation
  - Transaction confirmation

### Backend API
- **Endpoints**:
  - `POST /api/escrow/create` - Create escrow
  - `POST /api/escrow/release` - Release funds
  - `POST /api/escrow/cancel` - Cancel escrow
  - `GET /api/escrow/[escrowId]` - Get escrow status

### Contract Integration
- **Location**: `src/modules/celo-escrow/components/escrow-contract.ts`
- **Functions**:
  - `createEscrowTransaction()` - Create on-chain escrow
  - `releaseEscrowTransaction()` - Release funds
  - Uses viem for contract interactions

### Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...
```

## 🤖 Feature 3: AI Assistant Chatbot

### Overview
Floating AI assistant button that helps users navigate, find products, and get help.

### Frontend Components
- **Location**: `src/modules/ai-assistant/components/`
- **Components**:
  - `assistant-button.tsx` - Floating button (bottom-right)
  - `assistant-chat.tsx` - Chat interface modal
- **Features**:
  - Product search
  - Navigation commands
  - FAQ answers
  - CELO escrow explanations
  - Negotiation assistance

### Backend API
- **Endpoint**: `POST /api/assistant`
- **Location**: `src/app/api/assistant/route.ts`
- **Request Body**:
  ```json
  {
    "message": "string",
    "context": {
      "currentScreen": "string",
      "userRole": "buyer" | "seller",
      "walletAddress": "string"
    },
    "history": AssistantMessage[]
  }
  ```
- **Response**:
  ```json
  {
    "message": "string",
    "navigate": {
      "screen": "string",
      "params": {}
    },
    "products": [],
    "actions": []
  }
  ```

### Integration
The assistant button is automatically added to all pages via the root layout.

## ⭐ Feature 4: Trust Score System

### Overview
Trust score calculation based on user activity and transaction history.

### Frontend Components
- **Location**: `src/modules/trust-score/components/trust-score-badge.tsx`
- **Usage**: Display on user profiles
- **Features**:
  - Score display (0-100)
  - Level badges (new, bronze, silver, gold, platinum)
  - Activity metrics

### Backend API
- **Endpoint**: `GET /api/trust/[address]`
- **Location**: `src/app/api/trust/[address]/route.ts`
- **Response**:
  ```json
  {
    "score": number,
    "level": "new" | "bronze" | "silver" | "gold" | "platinum",
    "successfulEscrows": number,
    "disputes": number,
    "completedNegotiations": number,
    "deliveryConfirmations": number
  }
  ```

### Score Calculation
- +10 points per successful escrow
- +5 points per completed negotiation
- +3 points per delivery confirmation
- -15 points per dispute
- Score capped at 0-100

## 🔧 Setup Instructions

### 1. Environment Variables
Add to `.env.local`:
```env
GOOGLE_GENAI_API_KEY=your-api-key
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### 2. Deploy Escrow Contract
1. Compile `contracts/BarcelEscrow.sol`
2. Deploy to Celo Alfajores testnet
3. Update `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` in `.env.local`

### 3. Install Dependencies
All required dependencies are already in `package.json`:
- `viem` - For blockchain interactions
- `@ai-sdk/google` - For AI features
- `ai` - For AI SDK

## 📝 Usage Examples

### Using AI Negotiation
1. Navigate to any product page
2. Click "Negotiate with AI" button
3. Select negotiation style
4. Enter target price
5. Click "Start Negotiation"
6. Review negotiation steps and final offer

### Using CELO Escrow
1. Make an offer on a product
2. Wait for seller approval
3. Click "Pay with CELO (Escrow)"
4. Confirm transaction in wallet
5. Funds are locked in escrow
6. Confirm delivery to release funds

### Using AI Assistant
1. Click floating bot button (bottom-right)
2. Ask questions like:
   - "Find products under $50"
   - "How does CELO escrow work?"
   - "Show me seller dashboard"
   - "Help me negotiate a better price"
3. Assistant responds with answers and actions

## 🏗️ Architecture Notes

- **Modular Design**: All features are in separate modules
- **No Breaking Changes**: Existing code remains untouched
- **Backend AI Logic**: All AI processing happens on the server
- **Client-Side Blockchain**: Contract interactions use wallet provider
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error handling throughout

## 🔐 Security Considerations

- All AI API keys stored server-side
- Wallet transactions require user confirmation
- Escrow funds locked in smart contract
- Trust scores calculated server-side
- Input validation on all API endpoints

## 📊 Database Schema (Future)

For production, you'll need to store:
- Negotiation logs
- Escrow records
- Trust score history
- Assistant chat logs
- User activity metrics

## 🚀 Deployment

1. Deploy smart contracts to Celo network
2. Update environment variables
3. Deploy Next.js app
4. Configure Firebase (for wallet tracking)
5. Set up AI API keys

All features are production-ready and can be deployed independently.

