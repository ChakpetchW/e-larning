import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const CHUNK_RELOAD_KEY = 'vite-chunk-reload-once';

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      return;
    }

    event.preventDefault();
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
    window.location.reload();
  });

  window.addEventListener('load', () => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
