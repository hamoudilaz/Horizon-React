import { getAmount } from '../services/getLogo';
import { useState, useEffect } from 'react';

export function Amount() {
  const [amount, setAmount] = useState({});

  useEffect(() => {
    const req = async () => {
      const amount = await getAmount(localStorage.getItem('pubKey'));
      console.log(amount);
      if (amount) setAmount(amount);
    };

    req();
    const interval = setInterval(req, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div>
        <div className="flex flex-col items-start gap-1 p-1 bg-zinc-900 text-white rounded-2xl">
          <span className="text-sm text-zinc-400">SOL: </span>
          <span className="text-2xl font-semibold tracking-wide">{amount.SOL} SOL</span>
        </div>
        <div className="flex flex-col items-start gap-1 p-1 bg-zinc-900 text-white rounded-2xl">
          <span className="text-sm text-zinc-400">Value in USD: </span>
          <span className="text-2xl font-semibold tracking-wide">{amount.usdValue}$</span>
        </div>
      </div>
    </>
  );
}
