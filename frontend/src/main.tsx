import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useAtomValue } from 'jotai';
import App from './App.tsx';
import './styles/globals.css';
import { themeAtom } from '@/atoms/themeAtoms';
import { useAuthInit } from '@/hooks/useAuthInit';
import { ConnectionStatus } from '@/components/ConnectionStatus';

function ThemeInitializer() {
  const theme = useAtomValue(themeAtom);

  // Sync effect - runs before paint
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Also set immediately on first render to prevent flash
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === '"dark"' || savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }

  return null;
}

function AuthInitializer() {
  useAuthInit();
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeInitializer />
    <AuthInitializer />
    <ConnectionStatus />
    <App />
  </StrictMode>
);
