import React, { useState, useEffect } from 'react';
import { TradeForm } from './components/TradeForm';
import { OwnedTokens } from './components/OwnedTokens';
import { Header } from './components/Header';
import { Wallet } from './components/Wallet';
import { CopyTrade } from './components/CopyTrade';
import { LoadKey } from './services/loadKey';
import ws from './services/wsClient';

import './styles/dashboard.css';
import './styles/ownedTokens.css';

function App() {
  const [copy, setCopy] = useState();
  const [target, setTarget] = useState();
  const [swap, setSwap] = useState();

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
  const handleCopy = async () => {
    const res = await fetch(`http://localhost:3000/api/copytrade/${target}`);
    const data = await res.json();
    console.log(data);
    setCopy(data.message);
  };

  return (
    <>
      <div className="main-container">
        <Header publicKey={pubKey} logout={setPubKey} logout2={setPrivKey} />

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
          <CopyTrade />
        </div>
      </div>
    </>
  );
}

export default App;
