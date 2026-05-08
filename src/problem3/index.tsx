import React, { useMemo } from "react";

// Fix 1: Since FormattedWalletBalance shared currency and amount with WalletBalance, 
// it makes more sense for it to extend WalletBalance instead of duplicating those fields.
// This also ensures type consistency between the two interfaces.
interface WalletBalance {
  currency: string;
  amount: number;
  // Fix 2: Input "blockchain" since getPriority(balance.blockchain) was called but not defined in the original interface.
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// Fix : BoxProps is not defined. So I assume that it should be defined somewhere else and imported here. 
// For the sake of this code, I will just keep it as an empty interface.
interface Props extends BoxProps { }

// Fix 3 : Since getPriority does not need to rerender on every render, we can move it outside the component and 
// use a lookup map for cleaner code. Also , define a union type for block chains to ensure type safety and prevent typos.
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";


const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITY[blockchain as Blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = (props: Props) => {
  // Fix 4 : Remove "children" since it is never used
  const { ...rest } = props;
  // Those are 2 hooks but not defined. I assume that they already exist in other folders and return the expected data. 
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      // fix 5 : Since lhsPriority does not exist , it should be replace by balancePriority which is computed once per balance before the filter.
      const balancePriority = getPriority(balance.blockchain);
      if (balancePriority > -99) {
        if (balance.amount <= 0) {
          return true;
        }
      }
      return false
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
    });
    // Fix 6 : Remove prices from dependency since it is not used .
  }, [balances]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      // Assuming that WalletRow is a component that already exists.
      <WalletRow
        className={classes.row}
        // Fix 7 : Since index keys can cause issues when the list is reordered, use a unique identifier instead.
        //  Here I used currency as unique key
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
