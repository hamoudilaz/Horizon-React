import { TradeForm } from '../components/TradeForm';
import { OwnedTokens } from '../components/OwnedTokens';

export function Dashboard() {
  return (
    <>
      <div>
        <h1>Solana Trading Bot</h1>

        <TradeForm />
        <div className="dashboard">
          <OwnedTokens />
        </div>
      </div>
    </>
  );
}
