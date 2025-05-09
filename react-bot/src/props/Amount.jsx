import { getAmount } from '../services/getLogo';
import { useState, useEffect } from 'react';
import { refreshRef } from '../services/amountRef';
import { SlCopyButton } from '@shoelace-style/shoelace/dist/react';

export function Amount() {
  const [amount, setAmount] = useState({});

  const fetchAmount = async () => {
    const owned = await getAmount(localStorage.getItem('pubKey'));
    if (owned) setAmount(owned);
  };

  useEffect(() => {
    refreshRef.current = fetchAmount; // ✅ always defined after mount
    fetchAmount();
  }, []);
  return (
    <>
      <div className="copyBox mintBox">
        <label>Test mint:</label>
        <h2 className="displayKey">rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof</h2>
        <SlCopyButton value="rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof" />
      </div>
      <div className="amount-container">
        <div className="info-box">
          <span className="label blue">Value in USD:</span>
          <span className="value blue">${amount.usdValue}</span>
        </div>
        <div className="info-box">
          <span className="label green">SOL:</span>
          <span className="value green">{amount.SOL} SOL</span>
        </div>
        <div className="info-box">
          <span className="label yellow">WSOL:</span>
          <span className="value yellow">{amount.WSOL} WSOL</span>
        </div>
      </div>
    </>
  );
}
