import React from 'react';
import './styles/main.scss'; 
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';

const rootElement = document.getElementById('root') as HTMLElement;

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}