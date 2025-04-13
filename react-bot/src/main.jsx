import { createRoot } from 'react-dom/client';
import { PubKeyProvider } from './props/PubKeyContext.jsx';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <PubKeyProvider>
    <App />
  </PubKeyProvider>
);
