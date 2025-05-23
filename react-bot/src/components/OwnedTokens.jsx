import ws from '../services/wsClient.js';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Loading } from '../props/loading.jsx';
import { ClipLoader } from 'react-spinners';
import { sellToken } from '../services/sell.js';
import { refreshRef } from '../services/amountRef.js';
import { Switches } from '../props/loading.jsx';

export function OwnedTokens() {
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mess, setMess] = useState(false);
  const [timer, setTimer] = useState(false);

  const [loadingStates, setLoadingStates] = useState({});

  const updateBalance = async () => {
    setIsLoading(true);
    await fetch(`${import.meta.env.VITE_API_URL}/api/balance/`);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const fetchTokens = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tokens`);
      const data = await res.json();

      if (!data) return null;
      setTokens(data);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    }
  };

  useEffect(() => {
    fetchTokens();

    const handleMessage = async (event) => {
      const newToken = JSON.parse(event.data);
      if (newToken.listToken || newToken.removed) {
        refreshRef.current?.(); // ✅ safe guaranteed trigger

        if (newToken.removed) {
          setTokens((prevTokens) => prevTokens.filter((t) => t.tokenMint !== newToken.tokenMint));
        } else {
          setTokens((prevTokens) => {
            const existingToken = prevTokens.find((t) => t.tokenMint === newToken.tokenMint);

            if (existingToken) {
              return prevTokens.map((t) => (t.tokenMint === newToken.tokenMint ? newToken : t));
            } else {
              return [...prevTokens, newToken];
            }
          });
        }
      }
    };

    ws.addEventListener('message', handleMessage);

    return () => ws.removeEventListener('message', handleMessage);
  }, []);

  const handleSell = async (token, percent, node) => {
    const key = `${token.tokenMint}-${percent}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));

    const sell = await sellToken(token.tokenMint, percent, node);

    setMess(sell.message);
    setTimer(sell.end);

    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <>
      <div className="owned-tokens">
        <div className="header">
          <h2>{tokens.length === 0 ? 'No tokens found' : 'Owned tokens'}</h2>

          {tokens.length > 0 && !isLoading && null}
          {isLoading ? (
            <Loading />
          ) : (
            <button className="loading" onClick={updateBalance}>
              Update
            </button>
          )}
        </div>
        {mess && (
          <div className="mb-3">
            <a href={mess} target="_blank" rel="noreferrer" className="sellMsg">
              <span className="text">View on Solscan</span>
            </a>
            <strong className="timer">Total Time: {timer}</strong>
          </div>
        )}
        <ul className="tokenBox">
          {tokens.map((token) => (
            <TokenItem key={token.tokenMint} token={token} loadingStates={loadingStates} handleSell={handleSell} />
          ))}
        </ul>
      </div>
    </>
  );
}

function TokenItem({ token, loadingStates, handleSell }) {
  const [node, setNode] = useState(false);
  return (
    <li className="tokenList">
      <div>
        <img src={token.logoURI ? token.logoURI : 'vite.svg'} />
        <Switches curr={node} mode={setNode} />
      </div>
      <span className="tokenInfo">{token.tokenMint} </span>
      <span className="tokenInfo">
        Ticker: <span className="value">{token.symbol}</span>
      </span>
      <span className="tokenInfo">
        Tokens: <span className="value">{Number(token.tokenBalance).toFixed(4)}</span>
      </span>
      <span className="tokenInfo">
        Value: <span className="value"> {`$${Number(token.usdValue).toFixed(4)}`}</span>
      </span>
      <div className="sellToken">
        <button className="bttn" value="50" onClick={() => handleSell(token, 50, node)} disabled={loadingStates[`${token.tokenMint}-50`]}>
          {loadingStates[`${token.tokenMint}-50`] ? <ClipLoader size={16} color="#fff" className="load" /> : <span className="text">Sell 50%</span>}
        </button>
        <button className="bttn" value="100" onClick={() => handleSell(token, 100, node)} disabled={loadingStates[`${token.tokenMint}-100`]}>
          {loadingStates[`${token.tokenMint}-100`] ? <ClipLoader size={16} color="#fff" className="load" /> : <span className="text">Sell 100%</span>}
        </button>
      </div>
    </li>
  );
}
