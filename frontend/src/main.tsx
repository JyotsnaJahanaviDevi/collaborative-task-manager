import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 10000,
          shouldRetryOnError: false,
          errorRetryCount: 2,
          keepPreviousData: true,
          fallbackData: {},
        }}
      >
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                  },
                }}
              />
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </SWRConfig>
    </BrowserRouter>
  </React.StrictMode>
);
