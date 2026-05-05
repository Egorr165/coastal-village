import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.scss'; 
import { HelmetProvider } from 'react-helmet-async';

const rootElement = document.getElementById('root') as HTMLElement;

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Проверяем: если внутри <div id="root"> уже есть HTML (от react-snap),
// то мы его "гидратируем" (оживляем). Если нет — рендерим как обычно.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}