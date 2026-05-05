import { useState } from 'react';
import api from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import './Contact.scss';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/Button/Button';
import LazyMap from '../../components/LazyMap/LazyMap';

import { TabletSmartphone, Mail, Calendar, DoorOpen, LogOut, Plus, Minus } from 'lucide-react';
import TGIcon from '../../images/contact_page/icon-telegram.svg';
import TGWhiteIcon from '../../images/contact_page/icon-telegram-white.svg';
import VKIcon from '../../images/contact_page/icon-vk.svg';
import MaxIcon from '../../images/contact_page/icon-max.svg';
import { Helmet } from 'react-helmet-async';

const Contact = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [showPhonePopup, setShowPhonePopup] = useState(false);

  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  const faqs = [
    {
      id: 1,
      question: "Как максимально быстро получить ответ?",
      answer: "Для оперативного решения вопросов лучше всего написать нам в Telegram или WhatsApp. В мессенджерах наши менеджеры отвечают в течение 5-10 минут."
    },
    {
      id: 2,
      question: "По какому номеру звонить в нерабочее время?",
      answer: "Служба поддержки работает ежедневно с 9:00 до 21:00. После 21:00 рекомендуем оставить сообщение в Telegram — дежурный администратор свяжется с вами при первой возможности."
    },
    {
      id: 3,
      question: "Как правильно проложить маршрут в навигаторе?",
      answer: "Нажмите кнопку «Построить маршрут» прямо на виджете Яндекс Карты на этой странице. Навигатор автоматически приведет вас точно к воротам базы."
    },
    {
      id: 4,
      question: "Куда направить запрос на корпоратив?",
      answer: "Для обсуждения сотрудничества и мероприятий рекомендуем использовать Email. Так мы сможем выслать вам детальный расчет и презентацию."
    },
    {
      id: 5,
      question: "Что делать, если телефонная линия занята?",
      answer: "Если вы не смогли до нас дозвониться, просто оставьте сообщение в мессенджере с вашим вопросом и номером телефона — мы обязательно перезвоним."
    }
  ];

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    if (limited.length <= 1) return limited.length === 1 ? '+7 (' : '';

    let formatted = '+7 (';

    if (limited.length > 1) {
      const start = (limited[0] === '7' || limited[0] === '8') ? 1 : 0;
      const areaCode = limited.slice(start, start + 3);
      formatted += areaCode;

      if (limited.length > start + 3) {
        formatted += ') ' + limited.slice(start + 3, start + 6);

        if (limited.length > start + 6) {
          formatted += '-' + limited.slice(start + 6, start + 8);

          if (limited.length > start + 8) {
            formatted += '-' + limited.slice(start + 8, start + 10);
          }
        }
      }
    }

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || phone.length < 18 || !policyAccepted) {
      addToast('Пожалуйста, заполните все поля корректно.', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/api/contacts/', {
        name,
        phone,
      });
      addToast('Ваша заявка принята, мы свяжемся с вами в ближайшее время!', 'success');
      setName('');
      setPhone('');
      setPolicyAccepted(false);
    } catch (err) {
      addToast('Произошла ошибка при отправке заявки. Попробуйте еще раз.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "7Continent Dagestan",
    "url": "https://7continent-dagestan.ru/",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7XXXXXXXXXX",
      "contactType": "customer service",
      "areaServed": "RU",
      "availableLanguage": "Russian"
    }
  };

  return (
    <div className="App contact-page">

      <Helmet>
        <title>Контакты базы отдыха 7 Континент | Как добраться и забронировать</title>
        <meta 
          name="description" 
          content="Свяжитесь с нами для аренды коттеджей в Дагестане. Телефон, точный адрес и удобная схема проезда до базы отдыха 7 Континент." 
        />

        <script type="application/ld+json">
          {JSON.stringify(contactSchema)}
        </script>
      </Helmet>

      <Header />

      <main>
        <section className="contact-hero">
          <div className="page-hero__overlay"></div>
          <div className="page-hero__container">
            <div className="contact-hero__content">
              <div className="contact-hero__text">
                <h1 className="page-hero__title">Контакты</h1>
                <h2 className="contact-hero__subtitle">Мы всегда на связи</h2>
                <p className="contact-hero__description">
                  Задайте вопрос прямо сейчас — ответим в течение 15 минут
                </p>
                <div className="contact-hero__gallery">
                  <img
                    alt="Terrace"
                    className="contact-hero__gallery-img"
                  />
                  <img
                    alt="Coffee"
                    className="contact-hero__gallery-img"
                  />
                  <img
                    alt="Room"
                    className="contact-hero__gallery-img"
                  />
                </div>
              </div>

              <div className="hero-contact-form">
                <p className="hero-contact-form__title">
                  Заполните форму, мы свяжемся с вами и проконсультируем по всем возникшим вопросам
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="hero-contact-form__input-group">
                    <input
                      type="text"
                      placeholder="Имя"
                      className="hero-contact-form__input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                    <div className="hero-contact-form__phone-wrapper">
                      <TabletSmartphone size={20} strokeWidth={2} color="var(--color-primary)" className="hero-contact-form__flag" />
                      <input
                        type="tel"
                        placeholder="+7 (999) 999-99-99"
                        className="hero-contact-form__input hero-contact-form__input--phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>
                  <div className="hero-contact-form__checkbox-group">
                    <input
                      type="checkbox"
                      id="policy"
                      className="hero-contact-form__checkbox"
                      checked={policyAccepted}
                      onChange={(e) => setPolicyAccepted(e.target.checked)}
                      disabled={loading}
                      required
                    />
                    <label htmlFor="policy" className="hero-contact-form__checkbox-label">
                      Я ознакомился с <a href="#">политикой конфиденциальности</a> и даю согласие на <a href="#">обработку персональных данных</a>
                    </label>
                  </div>
                  <Button type="submit" variant="secondary" size="lg" fullWidth disabled={loading || !policyAccepted}>
                    {loading ? 'ОТПРАВКА...' : 'СВЯЗАТЬСЯ С НАМИ'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-methods">
          <div className="container">
            <h2 className="contact-methods__title">Самый быстрый способ связаться</h2>
            <div className="contact-methods__grid">
              <div className="contact-methods__card">
                <div className="contact-methods__icon-circle contact-methods__icon-circle--tg">
                  <img src={TGIcon} alt="Telegram" width={32} height={32} />
                </div>
                <div className="contact-methods__card-content">
                  <h3 className="contact-methods__card-title">Наш MAX / Telegram</h3>
                  <p className="contact-methods__card-text">
                    Быстро ответим в удобном мессенджере и поможем с выбором домика.
                  </p>
                </div>
                <div className="contact-methods__buttons">
                  <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="ui-button ui-button--outline ui-button--md contact-methods__button-link">
                    TELEGRAM
                  </a>
                  <a href="https://wa.me/79381607231" target="_blank" rel="noopener noreferrer" className="ui-button ui-button--outline ui-button--md contact-methods__button-link">
                    MAX
                  </a>
                </div>
              </div>

              <div className="contact-methods__card">
                <div className="contact-methods__icon-circle contact-methods__icon-circle--phone">
                  <TabletSmartphone size={32} strokeWidth={1.5} color="var(--color-primary)" />
                </div>
                <div className="contact-methods__card-content">
                  <h3 className="contact-methods__card-title">Позвоните нам</h3>
                  <p className="contact-methods__card-text">
                    Предпочитаете живое общение? С радостью проконсультируем вас по телефону и оформим бронь.
                  </p>
                </div>
                <div className="contact-methods__phone-buttons">
                  <Button variant="outline" fullWidth onClick={() => {
                    if (window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                      window.location.href = 'tel:+79381607231';
                    } else {
                      setShowPhonePopup(!showPhonePopup);
                    }
                  }}>
                    Позвонить
                  </Button>
                  {showPhonePopup && (
                    <div className="contact-methods__messenger-dropdown contact-methods__messenger-dropdown--phone">
                      <span className="contact-methods__phone-number">+7 938 160 72 31</span>
                      <span className="contact-methods__phone-text">Готовы принять ваш звонок!</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="contact-methods__card">
                <div className="contact-methods__icon-circle contact-methods__icon-circle--mail">
                  <Mail size={32} strokeWidth={1.5} color="var(--color-brand-blue)" />
                </div>
                <div className="contact-methods__card-content">
                  <h3 className="contact-methods__card-title">Для особых вопросов</h3>
                  <p className="contact-methods__card-text">
                    Отличный вариант для детальных вопросов и предложений о сотрудничестве.
                  </p>
                </div>
                <div className="contact-methods__email-wrapper">
                  <a href="mailto:7continent-05@mail.ru" className="ui-button ui-button--outline ui-button--md ui-button--full-width contact-methods__email-link">
                    Написать на почту
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-map">
          <div className="container">
            <h2 className="contact-map__title">Как нас найти?</h2>
            <div className="contact-map__container">
              <LazyMap src="https://yandex.ru/map-widget/v1/?ll=47.934658%2C42.484620&mode=search&oid=201915250712&ol=biz&z=16.47" />
            </div>
          </div>
        </section>

        <div className="contact-details">
          <div className="container">
            <div className="contact-details__section contact-details__section--schedule">
              <h2 className="contact-details__title">График работы</h2>
              <div className="schedule-timeline">
                <div className="schedule-timeline__line"></div>
                
                <div className="schedule-timeline__item">
                  <div className="schedule-timeline__icon-box schedule-timeline__icon-box--primary">
                    <Calendar size={26} strokeWidth={2} color="var(--color-primary)" />
                  </div>
                  <div className="schedule-timeline__content">
                    <span className="schedule-timeline__label">Бронирование</span>
                    <span className="schedule-timeline__time">9:00 — 21:00</span>
                  </div>
                </div>

                <div className="schedule-timeline__item">
                  <div className="schedule-timeline__icon-box schedule-timeline__icon-box--primary">
                    <DoorOpen size={26} strokeWidth={2} color="var(--color-primary)" />
                  </div>
                  <div className="schedule-timeline__content">
                    <span className="schedule-timeline__label">Заселение</span>
                    <span className="schedule-timeline__time">с 14:00</span>
                  </div>
                </div>

                <div className="schedule-timeline__item">
                  <div className="schedule-timeline__icon-box schedule-timeline__icon-box--primary">
                    <LogOut size={24} strokeWidth={2} color="var(--color-primary)" />
                  </div>
                  <div className="schedule-timeline__content">
                    <span className="schedule-timeline__label">Выезд</span>
                    <span className="schedule-timeline__time">до 12:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-details__section contact-details__section--socials">
            <div className="container">
              <h2 className="contact-details__title">Мы в соцсетях</h2>
              <p className="contact-details__social-text">
                Следите за жизнью курорта, смотрите живые фото и видео наших коттеджей, задавайте вопросы в комментариях.
              </p>

              <div className="contact-social-grid">
                <a href="https://t.me/caspiy_riviera" target="_blank" rel="noopener noreferrer" className="contact-social-card contact-social-card--tg">
                  <div className="contact-social-card__icon-wrapper">
                    <img src={TGWhiteIcon} alt="Telegram" width={28} height={28} />
                  </div>
                  <div className="contact-social-card__info">
                    <span className="contact-social-card__name">Telegram</span>
                    <span className="contact-social-card__link">t.me/caspiy_riviera</span>
                  </div>
                </a>

                <a href="https://vk.com/caspiy_riviera" target="_blank" rel="noopener noreferrer" className="contact-social-card contact-social-card--vk">
                  <div className="contact-social-card__icon-wrapper">
                    <img src={VKIcon} alt="ВКонтакте" width={28} height={28} />
                  </div>
                  <div className="contact-social-card__info">
                    <span className="contact-social-card__name">ВКонтакте</span>
                    <span className="contact-social-card__link">vk.com/caspiy_riviera</span>
                  </div>
                </a>

                <a href="#" className="contact-social-card contact-social-card--max">
                  <div className="contact-social-card__icon-wrapper">
                    <img src={MaxIcon} alt="MAX" width={60} height={60} className="contact-social-card__max-icon" />
                  </div>
                  <div className="contact-social-card__info">
                    <span className="contact-social-card__name">MAX</span>
                    <span className="contact-social-card__link">@caspiy_riviera</span>
                  </div>
                </a>
              </div>
            </div>
          </div>


          <div className="container">
            <div className="contact-details__section contact-details__section--faq">
              <h2 className="contact-details__title">Частые вопросы</h2>

              <div className="faq__list">
                {faqs.map((faq) => (
                  <div key={faq.id} className="faq__item">
                    <button type="button" onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)} className="faq__question-btn">
                      <span className={`faq__question-text ${openFaqId === faq.id ? 'active' : ''}`}>
                        {faq.question}
                      </span>
                      <span className="faq__icon">
                        {openFaqId === faq.id ? 
                          <Minus size={24} strokeWidth={2} color="var(--color-primary)" /> : 
                          <Plus size={24} strokeWidth={2} color="var(--color-primary)" />
                        }
                      </span>
                    </button>
                    <div className={`faq__answer ${openFaqId === faq.id ? 'open' : ''}`}>
                      <p className="faq__answer-text">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
