import type { Token } from '../types/token';
import { getExchangeRate, formatAmount } from '../utils/exchange';

interface RateInfoProps {
  from: Token | null;
  to: Token | null;
}

export function RateInfo({ from, to }: RateInfoProps) {
  if (!from || !to || from.symbol === to.symbol) return null;

  const rate = getExchangeRate(from, to);
  if (!rate) return null;

  return (
    <div className="rate-info">
      <div className="rate-left">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="rate-icon">
          <path d="M2 8h12M10 4l4 4-4 4" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="rate-label">Exchange Rate</span>
      </div>
      <div className="rate-right">
        <span className="rate-value">
          1 {from.symbol} ≈ {formatAmount(rate)} {to.symbol}
        </span>
        <span className="rate-fee">Fee ≈ 0.1%</span>
      </div>
    </div>
  );
}
