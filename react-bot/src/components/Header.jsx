import '../styles/Navbar.css';
import { SlCopyButton } from '@shoelace-style/shoelace/dist/react';
import { usePubKey } from '../props/usePubKey.js';

export function Header() {
  const { setPubKey } = usePubKey();

  const clearStorage = () => {
    localStorage.removeItem('pubKey');
    setPubKey(null);
  };
  return (
    <>
      <nav className="navbar">
        <div className="copyBox">
          <label>Private Key:</label>

          <SlCopyButton value={localStorage.getItem('privKey')} />
        </div>
        <button className="LogoutBtn" onClick={clearStorage}>
          Logout
        </button>
        <div className="logoBox">
          <h1 className="horizon-text">HORIZON</h1>
        </div>

        <div className="copyBox">
          <label>Public Key:</label>
          <h2 className="displayKey">{localStorage.getItem('pubKey')}</h2>
          <SlCopyButton value={localStorage.getItem('pubKey')} />
        </div>
      </nav>
    </>
  );
}

export function Button() {
  return (
    <>
      <button className="bttn">
        <span class="text">Button</span>
      </button>
    </>
  );
}
