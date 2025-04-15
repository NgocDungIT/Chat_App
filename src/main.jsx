import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from '@/components/ui/sonner';
import { store } from './store/index.js';
import App from './App.jsx';
import SocketProvider from './context/SocketContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <StrictMode>
            <SocketProvider>
                <App />
                <Toaster closeButton />
            </SocketProvider>
        </StrictMode>
    </Provider>
);
