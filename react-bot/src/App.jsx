import React from 'react';
import { TradeForm } from './components/TradeForm';
import { OwnedTokens } from './components/OwnedTokens';
import './styles/dashboard.css';
import './styles/ownedTokens.css';
import { Header } from './components/Header';

function App() {
  return (
    <>
      <div className="main-container">
        <Header />
        <div className="dashboard">
          <TradeForm />
          <OwnedTokens />
        </div>
      </div>
    </>
  );
}

export default App;
