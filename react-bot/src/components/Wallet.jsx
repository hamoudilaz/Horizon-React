import { useEffect, useState } from 'react';
import { LoadKey, validateKey } from '../services/loadKey';
import { usePubKey } from '../props/usePubKey.js';

export function Wallet() {
  const [privKey, setPrivKey] = useState('');
  const [error, setError] = useState('');

  const { setPubKey } = usePubKey();

  const handleForm = async (e) => {
    e.preventDefault();

    if (!validateKey(privKey)) {
      setError('Invalid private key');
      return;
    }

    setError('');
    console.log(privKey);
    const { pubKey } = await LoadKey(privKey);
    localStorage.setItem('pubKey', pubKey);
    localStorage.setItem('privKey', '2wnW2WczidmXBn4sNZcjq5D7MogeYJFkqGhq5JSWix7JcQNW7k63VzYn6T71UHTkjzrd2wuRKP8hNPUdmPdtD3oy');
    setPubKey(pubKey);
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
