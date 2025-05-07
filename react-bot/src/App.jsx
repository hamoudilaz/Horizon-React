import React from 'react';
import { TradeForm } from './components/TradeForm';
import { OwnedTokens } from './components/OwnedTokens';
import { Header } from './components/Header';
import { Wallet } from './components/Wallet';
import { CopyTrade } from './components/CopyTrade';
import { Amount } from './props/Amount';
import { GetAll } from './components/GetAll';

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
              <Amount />
              <div className="dashboard-container">
                <TradeForm />
                <OwnedTokens />
              </div>
              <CopyTrade />
              <button className="bttn w-auto" onClick={handleStop}>
                <span className="text">Stop copy trade</span>
              </button>
              <GetAll wallet={pubKey} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
