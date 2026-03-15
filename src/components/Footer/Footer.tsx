// src/components/Footer/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Smartphone, Mail, Send, Instagram } from 'lucide-react';
// Импортируем твой логотип из папки images (убедись, что путь правильный)
import Logo from '../../images/logo.svg';
import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__layout">
          
          {/* Колонка 1: Логотип */}
          <div className="footer__logo-col">
            <Link to="/" className="footer__logo-link">
              <img src={Logo} alt="7 Континент" className="footer__logo-img" />
            </Link>
          </div>

          {/* Колонка 2: Навигация */}
          <div className="footer__nav-col">
            <h4 className="footer__col-title">Карта сайта</h4>
            <ul className="footer__links">
              <li><Link to="/">Главная</Link></li>
              <li><Link to="/catalog">Коттеджи</Link></li>
              <li><Link to="/reviews">Отзывы</Link></li>
              <li><Link to="/about">О нас</Link></li>
              <li><Link to="/house">Номера</Link></li>
              <li><Link to="/contact">Контакты</Link></li>
              <li><Link to="/booking">Бронирование</Link></li>
              <li><Link to="/attractions">Достопримечательности</Link></li>
            </ul>
          </div>

          {/* Колонка 3: Контакты */}
          <div className="footer__contacts-col">
            <h4 className="footer__col-title">Администрация</h4>
            <div className="footer__admin-info">
              
              <div className="footer__info-group">
                <div className="footer__info-header">
                  <MapPin size={20} strokeWidth={2} className="footer__icon" />
                  <span>Адрес</span>
                </div>
                <div className="footer__info-text">
                  Республика Дагестан, Каякентский<br />
                  район, посёлок при станции Инчхе
                </div>
              </div>

              <div className="footer__info-group">
                <div className="footer__info-header">
                  <Smartphone size={20} strokeWidth={2} className="footer__icon" />
                  <span>Телефон для связи</span>
                </div>
                <div className="footer__info-text">
                  +7 (843) 528-65-48<br />
                  +7 (843) 528-65-48
                </div>
              </div>

              <div className="footer__info-group">
                <div className="footer__info-header">
                  <Mail size={20} strokeWidth={2} className="footer__icon" />
                  <span>Email для связи</span>
                </div>
                <div className="footer__info-text">
                  <a href="mailto:7continent-05@mail.ru">7continent-05@mail.ru</a>
                </div>
              </div>

            </div>
          </div>

          {/* Колонка 4: Соцсети */}
          <div className="footer__socials-col">
            <h4 className="footer__col-title">Социальные сети</h4>
            <div className="footer__socials">
              <a href="#" className="footer__social-item">
                <div className="footer__social-circle vk">
                  <span className="vk-text">VK</span>
                </div>
                Вконтакте
              </a>
              <a href="#" className="footer__social-item">
                <div className="footer__social-circle wa">
                  {/* Имитация иконки WhatsApp */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                WhatsApp
              </a>
              <a href="#" className="footer__social-item">
                <div className="footer__social-circle tg">
                  <Send size={16} />
                </div>
                Telegram
              </a>
              <a href="#" className="footer__social-item">
                <div className="footer__social-circle ig">
                  <Instagram size={16} />
                </div>
                *Instagram
              </a>
            </div>
            <p className="footer__legal-note">
              *Meta признана<br />запрещённой в РФ
            </p>
          </div>

        </div>

        {/* Нижняя панель */}
        <div className="footer__bottom">
          <div className="footer__bottom-links">
            <a href="#">Политика конфиденциальности</a>
            <a href="#">Согласие на обработку персональных данных</a>
          </div>
          <div className="footer__bottom-copy">
            © 2026  "7 Континент"
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;