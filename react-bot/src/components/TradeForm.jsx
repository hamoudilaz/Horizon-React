import { useState } from 'react';
import { executeSwap } from '../services/buy.js';
import { ClipLoader } from 'react-spinners';
import { sellToken } from '../services/sell.js';
import { usePubKey } from '../props/usePubKey.js';

export function TradeForm({ className }) {
  const [mint, setMint] = useState('');
  const [amount, setAmount] = useState(0.00001);
  const [slippage, setSlippage] = useState(10);
  const [fee, setFee] = useState(0.000001);
  const [jitoFee, setJitoFee] = useState(0.000001);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mess, setMess] = useState('');
  const [timer, setTimer] = useState('');
  const [mode, setMode] = useState(true);

  const { setPubKey } = usePubKey();

  const params = { mint, amount, slippage, fee, jitoFee };

  async function buy() {
    setLoading(true);
    try {
      const response = await executeSwap(params);
      if (response.error) {
        if (response.error.startsWith('Internal Server Error: pubKey is undefined')) return setPubKey(null);
        console.log(response.error);
        setError(response.error);
      } else {
        setTimer(response.end);
        setMess(response.message);
      }
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const validateForm = () => {
    if (mint.length < 43 || mint.length > 44) {
      setError('Invalid contract address');
      return false;
    }
    if (amount <= 0 || amount >= 5) {
      setError('Amount must be between 0 and 5');
      return false;
    }
    if (slippage <= 0.01) {
      setError('Slippage must be greater than 0.01');
      return false;
    }
    setError('');
    return true;
  };

  const handleMint = (e) => {
    const CA = e.target.value;
    setMess(null);
    setTimer('');
    setError('');

    setMint(CA);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode) {
      if (validateForm()) {
        buy();
        setError('');
        setMess(null);
      }
    } else {
      const response = await sellToken(mint, amount);
      if (response.error) {
        setError(response.error);
      } else {
        setTimer(response.end);
        setMess(response.message);
      }
    }
  };

  const handleMode = () => {
    setMode((prev) => !prev);
  };

  return (
    <>
      <div className="trade-form">
        <h2 className="trade-settings">Trade Settings</h2>
        <form className="styleBox wallet tradeContent" onSubmit={handleSubmit}>
          <div className="trade-settings">
            {timer ? (
              <p style={{ textAlign: 'center' }}>
                <strong className="timer">Total Time: {timer}</strong>
              </p>
            ) : null}
            {mess ? (
              <p style={{ textAlign: 'center' }}>
                <strong className="success">Successfull!</strong>
              </p>
            ) : null}
          </div>
          <label>Token Contract Address:</label>
          <button type="button" className="float-end" onClick={handleMode}>
            Switch to {mode ? 'sell' : 'buy'}
          </button>

          <input type="text" value={mint} onChange={handleMint} placeholder="Enter Token CA" />
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            placeholder="Enter Amount"
          />
          <div className="fee-option">
            <div className="slippage">
              <label>Slippage (%):</label>
              <input type="number" value={slippage} onChange={(e) => setSlippage(e.target.value)} />
            </div>
            <div className="slippage">
              <label>Priority fee:</label>
              <input type="number" value={jitoFee} onChange={(e) => setJitoFee(e.target.value)} />
            </div>
            <div className="select">
              <label>Base fee:</label>
              <select value={fee} onChange={(e) => setFee(e.target.value)}>
                <option value="0.01">High</option>
                <option value="0.0001">Low</option>
                <option value="0.000001">Very low </option>
              </select>
            </div>
          </div>
          <button className="buy-btn bttn buybtn" type="submit" disabled={loading}>
            {loading ? (
              <span className="text">
                <ClipLoader size={20} color="#fff" />
              </span>
            ) : (
              <span className="text">{mode ? 'buy' : 'sell'}</span>
            )}
          </button>
          {loading ? <span className="status">Executing ...</span> : error && <span className="status">{error}</span>}
          {mess ? (
            <a href={mess} target="_blank" rel="noreferrer">
              <span className="text">View on Solscan</span>
            </a>
          ) : null}
        </form>
      </div>
    </>
  );
}
