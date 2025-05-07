import { useState, useEffect } from 'react';
import ws from '../services/wsClient';
import { ClipLoader } from 'react-spinners';
import { sellToken } from '../services/sell.js';

export const GetAll = ({ wallet }) => {
  const [tokens, setTokens] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [mess, setMess] = useState(false);
  const [timer, setTimer] = useState(false);

  const [loadingStates, setLoadingStates] = useState({});
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/fullinfo/${wallet}`);

    const handleMessage = async (event) => {
      const newToken = JSON.parse(event.data);
      setTokens(newToken);
    };

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [wallet]);
  console.log(tokens);

  const handleSell = async (token, percent) => {
    const key = `${token.tokenMint}-${percent}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));

    const sell = await sellToken(tokens[0].tokenMint, percent);

    setMess(sell.message);
    setTimer(sell.end);

    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  };

  if (!tokens) return null;

  return (
    <>
      <div className="owned-tokens">
        <div className="header">
          <h2>{tokens.length === 0 ? 'No tokens found' : 'Owned tokens'}</h2>
          {tokens.length > 0 && !isLoading && null}
        </div>
        <ul className="tokenBox">
          {mess && (
            <a href={mess} target="_blank" rel="noreferrer" className="sellMsg">
              <span className="text">View on Solscan</span>
            </a>
          )}
          <p style={{ textAlign: 'center' }}>
            <strong className="timer">Total Time: {timer}</strong>
          </p>
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
    </>
  );
};
