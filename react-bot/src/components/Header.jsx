import '../styles/Navbar.css';
import { SlCopyButton } from '@shoelace-style/shoelace/dist/react';

export function Header({ publicKey, logout }) {
  const clearStorage = () => {
    localStorage.removeItem('pubKey');
    logout('');
  };
  return (
    <>
      <nav className="navbar">
        <button className="LogoutBtn" onClick={clearStorage}>
          Logout
        </button>
        <div className="logoBox">
          <h1 className="horizon-text">HORIZON</h1>
        </div>
        <div className="copyBox">
          <label>Public Key:</label>
          <h2 className="displayKey">{publicKey}</h2>
          <SlCopyButton value={publicKey} />
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
