import React, { useState, useEffect } from 'react';
import { TradeForm } from './components/TradeForm';
import { OwnedTokens } from './components/OwnedTokens';
import { Header } from './components/Header';
import { Wallet } from './components/Wallet';
import { CopyTrade } from './components/CopyTrade';
import { LoadKey } from './services/loadKey';
import ws from './services/wsClient';
import { usePubKey } from './props/usePubKey'; // adjust path as needed

import './styles/dashboard.css';
import './styles/ownedTokens.css';

function App() {
  const [copy, setCopy] = useState();
  const [target, setTarget] = useState();

  const { pubKey } = usePubKey();

  const handleCopy = async () => {
    const res = await fetch(`http://localhost:3000/api/copytrade/${target}`);
    const data = await res.json();
    console.log(data);
    setCopy(data.message);
  };

  return (
    <>
      <div className="main-container">
        <Header />

        <div className="dashboard">
          {!pubKey ? (
            <Wallet />
          ) : (
            <>
              <div className="dashboard-container">
                <TradeForm />
                <OwnedTokens />
              </div>
              <CopyTrade />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
