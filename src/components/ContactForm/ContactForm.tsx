import React from 'react';
import './ContactForm.scss';

const ContactForm: React.FC = () => {
  return (
    <section className="contact-form-section">
      <div className="contact-form-section__container container">
        <h2 className="contact-form-section__title">Остались вопросы?</h2>
        
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <div className="contact-form__layout">
            
            {/* Поле: Имя */}
            <div className="contact-form__input-wrapper">
              <input 
                type="text" 
                placeholder="Имя" 
                className="contact-form__input" 
                required 
              />
            </div>

            {/* Поле: Телефон с флагом */}
            <div className="contact-form__input-wrapper contact-form__input-wrapper--phone">
              <img 
                src="https://flagcdn.com/w20/ru.png" 
                alt="RU" 
                className="contact-form__flag" 
              />
              <input 
                type="tel" 
                placeholder="+7 (999) 999-99-99" 
                className="contact-form__input" 
                required 
              />
            </div>

            {/* Кнопка отправки */}
            <button type="submit" className="contact-form__btn">
              Консультация
            </button>

            {/* Текст соглашения */}
            <p className="contact-form__agreement">
              Оставляя заявку Вы принимаете условия{' '}
              <a href="#">соглашения об обработке персональных данных</a>
            </p>

          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;