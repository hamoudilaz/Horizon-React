import { useEffect, useState } from 'react';
import { LoadKey, validateKey } from '../services/loadKey';

export function Wallet({ setWallet, setPriv }) {
  const [privKey, setPrivKey] = useState('');
  const [error, setError] = useState('');

  const handleForm = async (e) => {
    e.preventDefault();

    if (!validateKey(privKey)) {
      setError('Invalid private key');
      return;
    }

    setError('');
    const { pubKey } = await LoadKey(privKey);
    setPriv(privKey);
    setWallet(pubKey);
    setPrivKey('');
  };

  return (
    <>
      <form className="styleBox wallet" onSubmit={handleForm}>
        <label className="labbel">Private Key:</label>
        <input type="text" placeholder="Input private key" className="privKey" value={privKey} onChange={(e) => setPrivKey(e.target.value)} />
        <button type="submit" className="bttn">
          <span className="text">Submit</span>
        </button>

        {error && <span className="status">{error}</span>}
      </form>
    </>
  );
}
