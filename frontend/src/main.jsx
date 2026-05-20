import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { wagmiConfig } from './config/wagmi';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.95)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(16px)',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.78rem',
                borderRadius: '0',
                letterSpacing: '0.02em',
              },
              success: { iconTheme: { primary: '#ffffff', secondary: '#000000' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#000000' } },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
