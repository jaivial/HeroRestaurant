import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/tailwind.css';
import './styles/fonts.css';
import { AuthInitializer } from '@/components/AuthInitializer';
import { ConnectionStatus } from '@/components/ConnectionStatus';

// Add global BigInt toJSON fix for JSON.stringify support
(BigInt.prototype as { toJSON?: () => string }).toJSON = function () {
  return this.toString();
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthInitializer />
    <ConnectionStatus />
    <App />
  </StrictMode>
);
