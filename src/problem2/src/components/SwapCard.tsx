import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Token } from '../types/token';
import { MOCK_BALANCES } from '../types/token';
import { calculateReceive, formatAmount } from '../utils/exchange';
import { TokenPanel } from './TokenPanel';
import { RateInfo } from './RateInfo';

interface SwapCardProps {
  tokens: Token[];
}

type ToastType = 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
}

interface Transaction {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  createdAt: string;
}

// Priority order for default "You Pay" token (pick first found with balance)
const DEFAULT_FROM_SYMBOLS = ['BUSD', 'USDC', 'USDT', 'USD'];
// Priority order for default "You Receive" token
const DEFAULT_TO_SYMBOLS = ['ETH', 'USD', 'WBTC'];

export function SwapCard({ tokens }: SwapCardProps) {
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>(MOCK_BALANCES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [defaultsInitialized, setDefaultsInitialized] = useState(false);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // ── Set default tokens once the token list is loaded ──────────────────────
  useEffect(() => {
    if (tokens.length === 0 || defaultsInitialized) return;

    // Pick "You Pay" default: first symbol in priority list that has a balance
    const defaultFrom =
      DEFAULT_FROM_SYMBOLS.map((s) => tokens.find((t) => t.symbol === s))
        .find((t) => t && (walletBalances[t.symbol] ?? 0) > 0) ??
      tokens.find((t) => (walletBalances[t.symbol] ?? 0) > 0) ??
      tokens[0];

    // Pick "You Receive" default: first symbol in priority list that differs from defaultFrom
    const defaultTo =
      DEFAULT_TO_SYMBOLS.map((s) => tokens.find((t) => t.symbol === s))
        .find((t) => t && t.symbol !== defaultFrom?.symbol) ??
      tokens.find((t) => t.symbol !== defaultFrom?.symbol);

    if (defaultFrom) setFromToken(defaultFrom);
    if (defaultTo) setToToken(defaultTo);
    setDefaultsInitialized(true);
  }, [tokens, walletBalances, defaultsInitialized]);

  // ── Auto-calculate receive amount ──────────────────────────────────────────
  useEffect(() => {
    if (!fromToken || !toToken || !fromAmount || fromToken.symbol === toToken.symbol) {
      setReceiveAmount('');
      return;
    }
    const num = parseFloat(fromAmount);
    if (isNaN(num) || num <= 0) {
      setReceiveAmount('');
      return;
    }
    const result = calculateReceive(num, fromToken, toToken);
    setReceiveAmount(formatAmount(result));
  }, [fromAmount, fromToken, toToken]);

  // ── Validation ─────────────────────────────────────────────────────────────
  function getFromError(): string | undefined {
    if (!fromToken) return undefined;
    if (!fromAmount) return undefined;
    const num = parseFloat(fromAmount);
    if (isNaN(num) || num <= 0) return 'Amount must be greater than 0';
    const balance = walletBalances[fromToken.symbol] ?? 0;
    if (num > balance) return 'Insufficient balance';
    if (fromToken.symbol === toToken?.symbol) return 'Cannot swap the same token';
    return undefined;
  }

  function isConfirmDisabled(): boolean {
    if (loading) return true;
    if (!fromToken || !toToken) return true;
    if (!fromAmount || parseFloat(fromAmount) <= 0) return true;
    if (getFromError()) return true;
    return false;
  }

  // ── Swap direction ─────────────────────────────────────────────────────────
  const handleFlip = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(receiveAmount);
    // receiveAmount will re-calculate via useEffect
  }, [fromToken, toToken, receiveAmount]);

  // ── MAX button ─────────────────────────────────────────────────────────────
  const handleMax = useCallback(() => {
    if (!fromToken) return;
    const balance = walletBalances[fromToken.symbol] ?? 0;
    setFromAmount(balance > 0 ? balance.toString() : '');
  }, [fromToken, walletBalances]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  function showToast(message: string, type: ToastType) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Confirm swap (mock 1s) ─────────────────────────────────────────────────
  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (isConfirmDisabled()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);

    const sendAmount = parseFloat(fromAmount.replace(/,/g, ''));
    const receiveAmountNum = calculateReceive(sendAmount, fromToken!, toToken!);

    setWalletBalances((prev) => ({
      ...prev,
      [fromToken!.symbol]: Math.max((prev[fromToken!.symbol] ?? 0) - sendAmount, 0),
      [toToken!.symbol]: (prev[toToken!.symbol] ?? 0) + receiveAmountNum,
    }));

    setTransactions((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fromSymbol: fromToken!.symbol,
        toSymbol: toToken!.symbol,
        fromAmount: sendAmount,
        toAmount: receiveAmountNum,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    showToast(
      `✅ Swapped ${fromAmount} ${fromToken!.symbol} → ${receiveAmount} ${toToken!.symbol}`,
      'success',
    );

    // Reset amounts, keep tokens
    setFromAmount('');
    setReceiveAmount('');
  }

  const fromError = getFromError();
  const walletRows = Object.entries(walletBalances)
    .sort(([aSymbol], [bSymbol]) => aSymbol.localeCompare(bSymbol))
    .map(([symbol, balance]) => ({ symbol, balance }));

  return (
    <div className="swap-card">
      {/* Header */}
      <div className="card-header">
        <h1 className="card-title">Swap Tokens</h1>
        <div className="card-subtitle">Trade tokens instantly</div>
      </div>

      <form onSubmit={handleConfirm} noValidate>
        {/* You Pay */}
        <TokenPanel
          label="You Pay"
          token={fromToken}
          balances={walletBalances}
          amount={fromAmount}
          readonly={false}
          tokens={tokens}
          otherSymbol={toToken?.symbol}
          error={fromError}
          onAmountChange={setFromAmount}
          onTokenChange={setFromToken}
          onMax={handleMax}
        />

        {/* Flip button */}
        <div className="flip-row">
          <button
            type="button"
            className="flip-btn"
            onClick={handleFlip}
            aria-label="Flip tokens"
            title="Flip tokens"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 8l-3 3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 11h13a3 3 0 000-6h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M15 12l3-3-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 9H5a3 3 0 000 6h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* You Receive */}
        <TokenPanel
          label="You Receive"
          token={toToken}
          balances={walletBalances}
          amount={receiveAmount}
          readonly={true}
          tokens={tokens}
          otherSymbol={fromToken?.symbol}
          onTokenChange={setToToken}
        />

        {/* Exchange rate */}
        <RateInfo from={fromToken} to={toToken} />

        {/* Confirm button */}
        <button
          type="submit"
          className={`confirm-btn${loading ? ' loading' : ''}${isConfirmDisabled() ? ' disabled' : ''}`}
          disabled={isConfirmDisabled()}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Confirming Swap…
            </>
          ) : (
            'CONFIRM SWAP'
          )}
        </button>

        <section className="detail-section" aria-label="Wallet overview">
          <div className="detail-header">
            <h2 className="detail-title">Wallet Overview</h2>
            <span className="detail-subtitle">Current available balances</span>
          </div>
          {walletRows.length === 0 ? (
            <div className="detail-empty">No wallet balances available.</div>
          ) : (
            <div className="wallet-grid">
              {walletRows.map((row) => (
                <div className="wallet-item" key={row.symbol}>
                  <span className="wallet-symbol">{row.symbol}</span>
                  <span className="wallet-balance">
                    {row.balance.toLocaleString('en-US', { maximumFractionDigits: 8 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="detail-section" aria-label="Transaction history">
          <div className="detail-header">
            <h2 className="detail-title">Transaction History</h2>
            <span className="detail-subtitle">Latest swaps at the top</span>
          </div>
          {transactions.length === 0 ? (
            <div className="detail-empty">No transactions yet.</div>
          ) : (
            <div className="history-list">
              {transactions.map((tx) => (
                <div className="history-item" key={tx.id}>
                  <div className="history-main">
                    <span className="history-from">-{formatAmount(tx.fromAmount)} {tx.fromSymbol}</span>
                    <span className="history-arrow">→</span>
                    <span className="history-to">+{formatAmount(tx.toAmount)} {tx.toSymbol}</span>
                  </div>
                  <span className="history-time">
                    {new Date(tx.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </form>

      {/* Toast notification — rendered on document.body via portal */}
      {toast && createPortal(
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.message}
        </div>,
        document.body,
      )}
    </div>
  );
}
