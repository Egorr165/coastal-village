// src/components/Footer/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { TabletSmartphone, Mail, MapPin } from 'lucide-react';
import VKFooterIcon from '../../images/contact_page/icon-vk-footer.svg';
import WAFooterIcon from '../../images/contact_page/icon-whatsapp-footer.svg';
import TGFooterIcon from '../../images/contact_page/icon-telegram-footer.svg';
import MaxIcon from '../../images/contact_page/icon-max.svg';

import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__layout">
          
          <div className="footer__logo-col">
            <Link to="/" className="footer__logo-link">
              <div className="footer__brand">
                <span className="footer__brand-num">7</span>
                <div className="footer__brand-text">
                  <span className="footer__brand-name">Континент</span>
                  <span className="footer__brand-desc">База отдыха</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Колонка 2: Навигация */}
          <div className="footer__nav-col">
            <h3 className="footer__col-title">Карта сайта</h3>
            <ul className="footer__links">
              <li><Link to="/">Главная</Link></li>
              <li><Link to="/catalog">Коттеджи</Link></li>
              <li><Link to="/reviews">Отзывы</Link></li>
              <li><Link to="/about">О нас</Link></li>
              <li><Link to="/house">Номера</Link></li>
              <li><Link to="/contact">Контакты</Link></li>
              <li><Link to="/booking">Бронирование</Link></li>
            </ul>
          </div>

          {/* Колонка 3: Контакты */}
          <div className="footer__contacts-col">
            <h3 className="footer__col-title">Администрация</h3>
            <div className="footer__admin-info">
              
              <div className="footer__info-group">
                <div className="footer__info-header">
                  <MapPin className="footer__icon" size={20} strokeWidth={1.5} color="var(--color-primary)" />
                  <span>Адрес</span>
                </div>
                <div className="footer__info-text">
                  Республика Дагестан, Каякентский<br />
                  район, посёлок при станции Инчхе
                </div>
              </div>

              <div className="footer__info-group">
                <div className="footer__info-header">
                  <TabletSmartphone className="footer__icon" size={20} strokeWidth={1.5} color="var(--color-primary)" />
                  <span>Телефон для связи</span>
                </div>
                <div className="footer__info-text">
                  +7 (938) 160-72-31<br />
                  +7 (928) 760-22-11
                </div>
              </div>

              <div className="footer__info-group">
                <div className="footer__info-header">
                  <Mail className="footer__icon" size={22} strokeWidth={1.5} color="var(--color-primary)" />
                  <span>Email для связи</span>
                </div>
                <div className="footer__info-text">
                  <a href="mailto:7continent-05@mail.ru">7continent-05@mail.ru</a>
                </div>
              </div>

            </div>
          </div>

          {/* Колонка 4: Соцсети */}
          <div className="footer__socials-col">
            <h3 className="footer__col-title">Социальные сети</h3>
            <div className="footer__socials">
              <a href="#" className="footer__social-item">
                <img src={VKFooterIcon} alt="VK" width={28} height={28} />
                Вконтакте
              </a>
              <a href="#" className="footer__social-item">
                <img src={WAFooterIcon} alt="WhatsApp" width={28} height={28} />
                WhatsApp
              </a>
              <a href="#" className="footer__social-item">
                <img src={TGFooterIcon} alt="Telegram" width={28} height={28} />
                Telegram
              </a>
              <a href="#" className="footer__social-item">
                <img src={MaxIcon} alt="MAX" width={28} height={28} />
                MAX
              </a>
            </div>
          </div>

        </div>

        {/* Нижняя панель */}
        <div className="footer__bottom">
          <div className="footer__bottom-links">
            <a href="#">Политика конфиденциальности</a>
            <a href="#">Согласие на обработку персональных данных</a>
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