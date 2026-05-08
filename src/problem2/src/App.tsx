import { useTokenPrices } from './hooks/useTokenPrices';
import { SwapCard } from './components/SwapCard';

export default function App() {
  const { tokens, loading, error } = useTokenPrices();

  return (
    <div className="page">
      <div className="page-bg" aria-hidden="true" />

      <header className="page-header">
        <div className="logo">
          <div className="logo-dot" />
          <span>SwapUI</span>
        </div>
      </header>

      <main className="page-main">
        {error ? (
          <div className="fetch-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#f87171" strokeWidth="1.8" />
              <path d="M10 6v5M10 13v.5" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Failed to load token prices: {error}
          </div>
        ) : loading ? (
          <div className="skeleton-card">
            <div className="skeleton-title" />
            <div className="skeleton-panel" />
            <div className="skeleton-panel" />
            <div className="skeleton-btn" />
          </div>
        ) : (
          <SwapCard tokens={tokens} />
        )}
      </main>

      <footer className="page-footer">
        Prices sourced from Switcheo · Icons from token-icons
      </footer>
    </div>
  );
}
