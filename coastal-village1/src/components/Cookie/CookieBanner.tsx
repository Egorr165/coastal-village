import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <-- Важно для изоляции
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CookieBanner.scss';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

const BannerContent: React.FC<{ onClose: () => void; onAccept: () => void }> = ({ onClose, onAccept }) => (
  <div className="cookie-banner">
    <div className="cookie-banner__content">
      <p className="cookie-banner__text">
        Мы используем файлы cookie для улучшения работы сайта и анализа трафика. 
        Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
        <Link to="/privacy" className="cookie-banner__link">Политикой конфиденциальности</Link>.
      </p>
      <button onClick={onAccept} className="cookie-banner__btn">
        Принять
      </button>
    </div>
    <button onClick={onClose} className="cookie-banner__close" aria-label="Закрыть">
      <X size={18} />
    </button>
  </div>
);

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const initMetrika = async () => {
    try {
      const { loadYandexMetrika } = await import('../../utils/loadMetrika');
      if (typeof loadYandexMetrika === 'function') {
        loadYandexMetrika();
      }
    } catch (error) {
      console.error('Ошибка загрузки Яндекс.Метрики:', error);
    }
  };

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (consent === 'true') {
      initMetrika();
    } else {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
    initMetrika();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return createPortal(
    <BannerContent onClose={handleClose} onAccept={handleAccept} />,
    document.body
  );
};

export default CookieBanner;