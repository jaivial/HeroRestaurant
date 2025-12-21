import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/tailwind.css';
import './styles/fonts.css';
import { useAuthInit } from '@/hooks/useAuthInit';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ToastProvider } from '@/components/ui';

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
    <ToastProvider>
      <AuthInitializer />
      <ConnectionStatus />
      <App />
    </ToastProvider>
  </StrictMode>
);
