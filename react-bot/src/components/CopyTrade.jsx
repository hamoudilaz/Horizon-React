import { useState } from 'react';
import { copy } from '../services/buy.js';
import { ClipLoader } from 'react-spinners';
import { sellToken } from '../services/sell.js';

export function CopyTrade({ className }) {
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState(0.00001);
  const [slippage, setSlippage] = useState(10);
  const [fee, setFee] = useState(0.000001);
  const [jitoFee, setJitoFee] = useState(0.000001);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mess, setMess] = useState('');

  const params = { target, amount, slippage, fee, jitoFee };

  async function buy() {
    setLoading(true);
    try {
      const response = await copy(params);
      if (response.error) {
        setError(response.error);
      } else {
        setMess(response.message);
      }
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  /*   useEffect(() => {
      const handleMessage = (event) => {
        const msg = JSON.parse(event.data);
  
        if (msg.copy) {
          console.log('🚨 Copy trade detected:', msg.payload);
          setSwap(msg.payload);
        }
      };
  
      ws.addEventListener('message', handleMessage);
      return () => ws.removeEventListener('message', handleMessage);
    }, []); */

  const validateForm = () => {
    if (target.length < 43 || target.length > 44) {
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

  const handleTarget = (e) => {
    const wallet = e.target.value;
    setMess(null);
    setError('');

    setTarget(wallet);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      buy();
      setError('');
      setMess(null);
    }
  };

  return (
    <>
      <div className="trade-form">
        <h2 className="trade-settings">Copy trade settings</h2>
        <form className="styleBox wallet tradeContent" onSubmit={handleSubmit}>
          <div className="trade-settings">
            {mess ? (
              <p style={{ textAlign: 'center' }}>
                <strong className="success">Successfull!</strong>
              </p>
            ) : null}
          </div>
          <label>Wallet adress target:</label>

          <input type="text" value={target} onChange={handleTarget} placeholder="Enter wallet to copy trade" />
          <label>Fixed amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            placeholder="Enter Amount to copy"
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
                <option value="0.0001">High</option>
                <option value="0.00001">Low</option>
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
              <span className="text">Start copy trade</span>
            )}
          </button>
          {loading ? <span className="status">Loading...</span> : error && <span className="status">{error}</span>}
        </form>
      </div>
    </>
  );
}
