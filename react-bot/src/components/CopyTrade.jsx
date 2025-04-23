import { useState } from 'react';
import { copy } from '../services/buy.js';
import { ClipLoader } from 'react-spinners';
import { sellToken } from '../services/sell.js';
import { Input, Amount, Options } from '../props/test.jsx';

export function CopyTrade() {
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState(0.00001);
  const [slippage, setSlippage] = useState(10);
  const [fee, setFee] = useState(0.000001);
  const [jitoFee, setJitoFee] = useState(0.000001);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mess, setMess] = useState('');
  const [copyOn, setCopyOn] = useState(false);

  const params = { target, amount, slippage, fee, jitoFee };

  async function buy() {
    if (copyOn) return;
    setCopyOn(true);
    setLoading(true);
    try {
      console.log(params);
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
          <Input value={target} setValue={setTarget} />
          <Amount value={amount} setValue={setAmount} />
          <Options slip={slippage} setSlip={setSlippage} jito={jitoFee} setJito={setJitoFee} fee={fee} setFee={setFee} />

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
