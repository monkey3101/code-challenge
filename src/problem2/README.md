# Problem 2 — Currency Swap Form

A currency swap form built with **React 19 + TypeScript + Vite**.

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

## Install & Run

This project is part of a **npm workspace** monorepo. Run `npm install` once from the **repo root** to install dependencies for all projects:

```bash
# From the repo root (code-challenge/)
npm install

# Start problem2 dev server
npm run dev:p2
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Alternatively, you can still run from the project folder directly:

```bash
cd src/problem2
npm run dev
```

## Build for Production

```bash
# From repo root
npm run build:p2

# Or from project folder
cd src/problem2
npm run build
```

Output is in `src/problem2/dist/`. Preview with:

```bash
cd src/problem2
npm run preview
```

---

## Mock User Balances

The app simulates a user wallet with the following default balances:

| Token | Balance |
|-------|--------:|
| USDC  | 10,000  |
| BUSD  | 10,000  |
| DAI   | 10,000  |
| BTC   | 2       |
| ETH   | 10      |

> All other tokens have a balance of **0**. Swaps are blocked if the "You Pay" amount exceeds the available balance.

To adjust balances, edit `src/types/token.ts`:

```ts
export const MOCK_BALANCES: Record<string, number> = {
  USDC: 10000,
  BUSD: 10000,
  DAI: 10000,
  BTC: 2,
  ETH: 10,
};
```

---

## Data Sources

| Data | Source |
|------|--------|
| Token prices | [`https://interview.switcheo.com/prices.json`](https://interview.switcheo.com/prices.json) |
| Token icons (SVG) | [`github.com/Switcheo/token-icons`](https://github.com/Switcheo/token-icons/tree/main/tokens) |

Prices are fetched live on page load. Tokens with no price are excluded from the selector.

---

## Features

- Live token prices with automatic exchange rate calculation
- Searchable token dropdown with SVG icons (fallback to initials)
- Auto-calculates "You Receive" amount as you type
- Flip tokens button
- Input validation (negative amount, insufficient balance, same token)
- 1-second mock confirm flow with loading spinner
- Success toast notification (top-right, auto-dismisses after 3 s)
- Responsive layout (mobile & desktop)
