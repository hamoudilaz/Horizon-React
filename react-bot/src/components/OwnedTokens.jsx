import ws from '../services/wsClient.js';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Loading } from '../props/loading.jsx';
import { ClipLoader } from 'react-spinners';
import { sellToken } from '../services/sell.js';
import { Button } from './Header.jsx';

export function OwnedTokens() {
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({}); // Track per token and percent

  const updateBalance = async () => {
    setIsLoading(true);
    await fetch(`http://localhost:3000/api/balance/`);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const fetchTokens = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/tokens');
      const data = await res.json();

      setTokens(data);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    }
  };

  useEffect(() => {
    fetchTokens();

    const handleMessage = async (event) => {
      const newToken = JSON.parse(event.data);
      console.log(newToken);
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
    };

    ws.addEventListener('message', handleMessage);

    return () => ws.removeEventListener('message', handleMessage);
  }, []);

  const handleSell = async (token, percent) => {
    const key = `${token.tokenMint}-${percent}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));

    const sell = await sellToken(tokens[0].tokenMint, percent);

    console.log(sell);

    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  };

  return (
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

      <ul>
        {tokens.map((token) => (
          <li key={token.tokenMint} className="tokenList">
            <img src={token.logoURI ? token.logoURI : 'vite.svg'} />
            <span className="tokenInfo">{token.tokenMint} </span>
            <span className="tokenInfo">
              Ticker: <span className="value">{token.symbol}</span>{' '}
            </span>
            <span className="tokenInfo">
              Tokens: <span className="value">{Number(token.tokenBalance).toFixed(0)}</span>
            </span>
            <span className="tokenInfo">
              Value: <span className="value"> {`$${token.usdValue}`}</span>
            </span>

            <div className="sellToken">
              <button className="bttn" value="50" onClick={() => handleSell(token, 50)} disabled={loadingStates[`${token.tokenMint}-50`]}>
                {loadingStates[`${token.tokenMint}-50`] ? <ClipLoader size={16} color="#fff" className="load" /> : <span className="text">Sell 50%</span>}
              </button>
              <button className="bttn" value="100" onClick={() => handleSell(token, 100)} disabled={loadingStates[`${token.tokenMint}-100`]}>
                {loadingStates[`${token.tokenMint}-100`] ? <ClipLoader size={16} color="#fff" className="load" /> : <span className="text">Sell 100%</span>}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
