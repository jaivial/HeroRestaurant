import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useAtomValue } from 'jotai';
import App from './App.tsx';
import './styles/globals.css';
import { themeAtom } from '@/atoms/themeAtoms';

function ThemeInitializer() {
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <ThemeInitializer />
      <App />
    </Provider>
  </StrictMode>
);
