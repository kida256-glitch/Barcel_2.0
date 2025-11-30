export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AssistantResponse {
  message: string;
  navigate?: {
    screen: string;
    params?: Record<string, any>;
  };
  products?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  actions?: Array<{
    type: 'start_negotiation' | 'go_to_cart' | 'view_product' | 'help';
    data?: Record<string, any>;
  }>;
}

export interface AssistantRequest {
  message: string;
  context?: {
    currentScreen?: string;
    userRole?: 'buyer' | 'seller';
    walletAddress?: string;
  };
  history?: AssistantMessage[];
}

