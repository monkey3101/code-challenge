import { useState, useEffect } from 'react';
import type { Token, TokenPrice } from '../types/token';
import { getIconUrl } from '../utils/exchange';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';

interface UseTokenPricesResult {
  tokens: Token[];
  loading: boolean;
  error: string | null;
}

export function useTokenPrices(): UseTokenPricesResult {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        const res = await fetch(PRICES_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: TokenPrice[] = await res.json();

        // Deduplicate: keep the entry with the latest date per currency
        const map = new Map<string, TokenPrice>();
        for (const entry of data) {
          const existing = map.get(entry.currency);
          if (!existing || new Date(entry.date) > new Date(existing.date)) {
            map.set(entry.currency, entry);
          }
        }

        // Build token list — only include tokens with a positive price
        const tokenList: Token[] = Array.from(map.values())
          .filter((t) => t.price > 0)
          .sort((a, b) => a.currency.localeCompare(b.currency))
          .map((t) => ({
            symbol: t.currency,
            price: t.price,
            iconUrl: getIconUrl(t.currency),
          }));

        if (!cancelled) {
          setTokens(tokenList);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch prices');
          setLoading(false);
        }
      }
    }

    void fetchPrices();
    return () => {
      cancelled = true;
    };
  }, []);

  return { tokens, loading, error };
}
