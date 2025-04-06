import React, { useState, useEffect } from 'react';
import { TradeForm } from './components/TradeForm';
import { OwnedTokens } from './components/OwnedTokens';
import { Header } from './components/Header';
import { Wallet } from './components/Wallet';
import { LoadKey } from './services/loadKey';

import './styles/dashboard.css';
import './styles/ownedTokens.css';

function App() {
  const [pubKey, setPubKey] = useState(() => {
    return localStorage.getItem('pubKey') || '';
  });

  const [privKey, setPrivKey] = useState(() => {
    return localStorage.getItem('privKey') || '';
  });

  useEffect(() => {
    localStorage.setItem('pubKey', pubKey);
    localStorage.setItem('privKey', privKey);
  }, [pubKey, privKey]);

  useEffect(() => {
    const validate = async () => {
      await LoadKey(privKey);
    };
    validate();
  }, [privKey]);

  return (
    <>
      <div className="main-container">
        <Header publicKey={pubKey} logout={setPubKey} />

        <div className="dashboard">
          {!pubKey ? (
            <Wallet setWallet={setPubKey} setPriv={setPrivKey} />
          ) : (
            <>
              <div className="dashboard-container">
                <TradeForm />
                <OwnedTokens />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
