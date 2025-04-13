import { createContext, useContext, useState } from 'react';

const PubKeyContext = createContext();

export function PubKeyProvider({ children }) {
  const [pubKey, setPubKey] = useState(localStorage.getItem('pubKey'));
  return <PubKeyContext.Provider value={{ pubKey, setPubKey }}>{children}</PubKeyContext.Provider>;
}

export default PubKeyContext;
