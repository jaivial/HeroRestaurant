import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';
import { useAuthInit } from '@/hooks/useAuthInit';
import { ConnectionStatus } from '@/components/ConnectionStatus';

// Add global BigInt toJSON fix for JSON.stringify support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

function AuthInitializer() {
  useAuthInit();
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthInitializer />
    <ConnectionStatus />
    <App />
  </StrictMode>
);
