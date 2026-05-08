export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  price: number;
  iconUrl: string;
}

// Mock balances for the user
export const MOCK_BALANCES: Record<string, number> = {
  USDC: 10000,
  BUSD: 10000,
  DAI: 10000,
  BTC: 2,
  ETH: 10,
};
