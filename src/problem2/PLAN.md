# Currency Swap Form — Analysis & Implementation Plan

## Task Summary

Build a **currency swap form** (token swap UI, similar to Uniswap) using **React + TypeScript + Vite**, located in `src/problem2/`.

**Requirements from task image:**
- Allow users to swap one token to another
- Input validation and error messages
- Rated on usability and visual attractiveness
- Use token SVG icons from the Switcheo token-icons GitHub repo
- Use live token prices from `https://interview.switcheo.com/prices.json` to compute exchange rates
- Built with **Vite** (bonus points)
- May simulate backend (mock loading state on submit)

---

## Data Analysis

### Prices API — `https://interview.switcheo.com/prices.json`

Shape of each entry:
```json
{ "currency": "ETH", "date": "2023-08-29T07:10:52.000Z", "price": 1645.93 }
```

**Key observations:**
- Some currencies appear **multiple times** with different dates/prices → deduplicate by keeping the entry with the **latest date**
- Some currencies have **no price** (price = 0 or missing) → omit from selectable list
- Notable tokens with prices: ETH, WBTC, USDC, USDT, BTC, SOL, BNB, ATOM, OSMO, etc.

### Token Icons — `https://github.com/Switcheo/token-icons/tree/main/tokens`

CDN pattern:
```
https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg
```

- Not every token in the price list has a corresponding icon → need graceful fallback
- Fallback: show a grey circle with the token's first 2–3 initials

---

## UI/UX Design

### Visual Style
- **Background**: dark gradient `linear-gradient(135deg, #0f0c29, #302b63, #24243e)`
- **Card**: glassmorphism — `backdrop-filter: blur(20px)`, semi-transparent border
- **Accent color**: Purple `#7c3aed` / Indigo `#4f46e5` / Lavender `#a78bfa`
- **Font**: system-ui / Segoe UI
- **Responsive**: works at 375px (mobile) and 1280px (desktop)

### Layout (single card, centered)
```
┌─────────────────────────────────┐
│  Swap Tokens              [⚙]  │
├─────────────────────────────────┤
│  YOU PAY                        │
│  [ 0.00          ] [ ETH  ▼ ]  │
│  ≈ $0.00          Balance: 0    │
├──────────── [⇅ flip] ──────────┤
│  YOU RECEIVE                    │
│  [ 0.00 (auto)   ] [ USDC ▼ ]  │
│  ≈ $0.00          Balance: ...  │
├─────────────────────────────────┤
│  Exchange Rate: 1 ETH ≈ X USDC  │
│  Fee: ~0.1%                     │
├─────────────────────────────────┤
│       [ CONFIRM SWAP ]          │
└─────────────────────────────────┘
```

### Token Selector Dropdown
```
┌────────────────────────┐
│ 🔍 Search token...     │
├────────────────────────┤
│ [icon] ETH    $1645.93 │
│ [icon] USDC   $0.9898  │
│ [icon] BTC    $26002   │
│ ...                    │
└────────────────────────┘
```

---

## Default Token Selection

- **You Pay** defaults to the first token the user has a balance for, in priority order: `BUSD → USDC → USDT → USD`
- **You Receive** defaults to first available in: `ETH → USD → WBTC` (must differ from "You Pay")
- Selection runs once when the price API response first loads

## Mock Balances (hardcoded)

| Token | Balance |
|-------|---------|
| USDT  | 10,000  |
| USDC  | 10,000  |
| All others | 0  |

---

## Validation Rules

| Condition | Behaviour |
|-----------|-----------|
| Amount empty or 0 | Confirm button disabled (no error shown) |
| Amount negative | Red border + "Amount must be greater than 0" |
| fromToken === toToken | Red state + "Cannot swap the same token" |
| Amount > balance | Red border + "Insufficient balance" |
| Token not selected | "Please select a token" |

---

## Confirm Flow (Mock)

1. User clicks **CONFIRM SWAP**
2. Button switches to spinner + "Confirming Swap…" for **1 second**
3. After 1s: green success toast appears at **top-right of page** → "✅ Swapped {X} {FROM} → {Y} {TO}"
4. Toast auto-dismisses after **3 seconds** (slides in from right)
5. Form resets amounts (tokens stay selected)

---

## File Structure

```
src/problem2/
├── index.html                  ← Vite entry HTML
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── src/
    ├── main.tsx                ← React DOM render
    ├── App.tsx                 ← Root component, fetches prices
    ├── index.css               ← Global styles (bg, variables, font)
    ├── types/
    │   └── token.ts            ← TokenPrice, Token interfaces
    ├── hooks/
    │   └── useTokenPrices.ts   ← Fetch + deduplicate + transform
    ├── components/
    │   ├── SwapCard.tsx        ← Main state container
    │   ├── TokenPanel.tsx      ← Pay/Receive panel (input + selector)
    │   ├── TokenSelector.tsx   ← Dropdown with search
    │   └── RateInfo.tsx        ← Exchange rate bar
    └── utils/
        └── exchange.ts         ← Rate calculation helpers
```

---

## Implementation Phases

### Phase 1 — Scaffold Project
- Init Vite + React + TypeScript in `src/problem2/`
- Confirm `npm run dev` works

### Phase 2 — Types & Data Layer
- `types/token.ts` — define interfaces
- `hooks/useTokenPrices.ts` — fetch, deduplicate, return token list
- `utils/exchange.ts` — rate + amount calculation + icon URL helper

### Phase 3 — Components
- `TokenSelector.tsx` — searchable dropdown
- `TokenPanel.tsx` — amount input + token button + balance
- `RateInfo.tsx` — exchange rate display
- `SwapCard.tsx` — wires everything together, manages all state

### Phase 4 — App Shell & Styling
- `App.tsx` + `index.css` — dark background, loading skeleton
- All component styles (CSS modules or inline)

### Phase 5 — Validation + Mock Balances
- Implement all validation rules
- Inject mock balances for USDT/USDC

### Phase 6 — Confirm Flow
- 1s spinner mock
- Success toast
- Form reset

### Phase 7 — Polish & Build Verification
- Icon fallback (initials circle)
- Responsive check
- `npm run build` — zero errors
