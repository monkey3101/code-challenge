import type { Token } from '../types/token';
import { formatUSD } from '../utils/exchange';
import { TokenSelector, TokenIcon } from './TokenSelector';

interface TokenPanelProps {
  label: string;
  token: Token | null;
  balances: Record<string, number>;
  amount: string;
  readonly: boolean;
  tokens: Token[];
  otherSymbol?: string;
  error?: string;
  onAmountChange?: (val: string) => void;
  onTokenChange: (token: Token) => void;
  onMax?: () => void;
}

export function TokenPanel({
  label,
  token,
  balances,
  amount,
  readonly,
  tokens,
  otherSymbol,
  error,
  onAmountChange,
  onTokenChange,
  onMax,
}: TokenPanelProps) {
  const balance = token ? (balances[token.symbol] ?? 0) : 0;
  const usdValue =
    token && amount && !isNaN(Number(amount))
      ? formatUSD(parseFloat(amount) * token.price)
      : null;

  function handleAmountInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (readonly) return;
    // Allow digits, a single dot, and empty string
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onAmountChange?.(val);
    }
  }

  return (
    <div className={`token-panel${error ? ' has-error' : ''}`}>
      <div className="panel-label">{label}</div>
      <div className="panel-row">
        <input
          className={`amount-input${readonly ? ' readonly' : ''}`}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          readOnly={readonly}
          onChange={handleAmountInput}
          aria-label={`${label} amount`}
        />
        <TokenSelector
          tokens={tokens}
          selected={token}
          onChange={onTokenChange}
          disabledSymbol={otherSymbol}
        />
      </div>

      <div className="panel-bottom">
        <span className="usd-value">
          {usdValue ? `≈ ${usdValue}` : '\u00a0'}
        </span>
        <span className="balance-row">
          {token && (
            <>
              <TokenIcon symbol={token.symbol} iconUrl={token.iconUrl} size={14} />
              <span className="balance-text">
                {balance.toLocaleString('en-US')}
              </span>
              {!readonly && balance > 0 && (
                <button type="button" className="max-btn" onClick={onMax}>
                  MAX
                </button>
              )}
            </>
          )}
        </span>
      </div>

      {error && (
        <div className="panel-error" role="alert">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.8" />
            <path d="M8 5v4M8 11v.5" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
