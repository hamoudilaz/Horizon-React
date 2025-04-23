import React from 'react';
import { TradeForm } from './components/TradeForm';
import { OwnedTokens } from './components/OwnedTokens';
import { Header } from './components/Header';
import { Wallet } from './components/Wallet';
import { CopyTrade } from './components/CopyTrade';

import { usePubKey } from './props/usePubKey'; // adjust path as needed

import './styles/dashboard.css';
import './styles/ownedTokens.css';

function App() {
  const { pubKey } = usePubKey();

  const handleStop = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/stopcopy`);
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
        <button className="bttn" onClick={handleStop}>
          <span className="text">Stop copy trade</span>
        </button>
      </div>
    </>
  );
}

export default App;
