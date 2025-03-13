import React from 'react';
import { TradeForm } from './components/TradeForm';
import { OwnedTokens } from './components/OwnedTokens';
import './styles/dashboard.css';
import { Header } from './components/Header';
function App() {
  return (
    <>
      <Header />
      <div className="dashboard">
        <TradeForm />

        <OwnedTokens />
      </div>
    </>
  );
}

export default App;
