import { useState, useRef, useEffect } from 'react';
import type { Token } from '../types/token';
import { formatUSD } from '../utils/exchange';

interface TokenSelectorProps {
  tokens: Token[];
  selected: Token | null;
  onChange: (token: Token) => void;
  disabledSymbol?: string; // prevent selecting the other side's token
}

export function TokenSelector({
  tokens,
  selected,
  onChange,
  disabledSymbol,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const filtered = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) &&
      t.symbol !== disabledSymbol,
  );

  return (
    <div className="token-selector-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`token-btn${open ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <TokenIcon symbol={selected?.symbol ?? ''} iconUrl={selected?.iconUrl ?? ''} size={28} />
        <span className="token-btn-symbol">{selected?.symbol ?? 'Select'}</span>
        <svg
          className={`chevron${open ? ' up' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="dropdown" role="listbox">
          <div className="dropdown-search-wrap">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="search-icon">
              <circle cx="7" cy="7" r="5" stroke="#9ca3af" strokeWidth="1.8" />
              <path d="M11 11l3 3" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              className="dropdown-search"
              placeholder="Search token…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="dropdown-list">
            {filtered.length === 0 ? (
              <div className="dropdown-empty">No tokens found</div>
            ) : (
              filtered.map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  className={`dropdown-item${selected?.symbol === token.symbol ? ' selected' : ''}`}
                  onClick={() => {
                    onChange(token);
                    setOpen(false);
                    setSearch('');
                  }}
                  role="option"
                  aria-selected={selected?.symbol === token.symbol}
                >
                  <TokenIcon symbol={token.symbol} iconUrl={token.iconUrl} size={32} />
                  <div className="di-info">
                    <span className="di-symbol">{token.symbol}</span>
                    <span className="di-price">{formatUSD(token.price)}</span>
                  </div>
                  {selected?.symbol === token.symbol && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-7" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Token icon with fallback initials ────────────────────────────────────────
interface TokenIconProps {
  symbol: string;
  iconUrl: string;
  size: number;
}

export function TokenIcon({ symbol, iconUrl, size }: TokenIconProps) {
  const [failed, setFailed] = useState(false);

  // Reset failed state if iconUrl changes (different token selected)
  useEffect(() => {
    setFailed(false);
  }, [iconUrl]);

  const initials = symbol.slice(0, 3).toUpperCase();

  return (
    <span
      className="token-icon"
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.35 }}
    >
      {failed || !iconUrl ? (
        <span className="token-icon-fallback">{initials}</span>
      ) : (
        <img
          src={iconUrl}
          alt={symbol}
          width={size}
          height={size}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
