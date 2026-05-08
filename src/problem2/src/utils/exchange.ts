import type { Token } from '../types/token';

const ICON_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

export function getIconUrl(symbol: string): string {
  return `${ICON_BASE}/${symbol}.svg`;
}

/**
 * Exchange rate: how many `to` tokens you get per 1 `from` token.
 * rate = fromPrice / toPrice
 */
export function getExchangeRate(from: Token, to: Token): number {
  if (!to.price || !from.price) return 0;
  return from.price / to.price;
}

/**
 * Given an input amount of `from` token, returns how many `to` tokens the user receives.
 */
export function calculateReceive(
  amount: number,
  from: Token,
  to: Token,
): number {
  if (!amount || !from.price || !to.price) return 0;
  return (amount * from.price) / to.price;
}

/**
 * Format a number nicely: up to 6 significant decimal places, strip trailing zeros.
 */
export function formatAmount(value: number): string {
  if (value === 0) return '';
  if (value >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return parseFloat(value.toPrecision(6)).toString();
}

/**
 * Format USD value display.
 */
export function formatUSD(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
