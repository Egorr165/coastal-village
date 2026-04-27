import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../Button/Button';
import { useToastStore } from '../../store/useToastStore';
import { TabletSmartphone } from 'lucide-react';
import './ContactForm.scss';

const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const addToast = useToastStore(state => state.addToast);
  
  const [loading, setLoading] = useState(false);

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

  return (
    <section className="contact-form-section">
      <div className="contact-form-section__container container">
        <h2 className="contact-form-section__title">Остались вопросы?</h2>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form__layout">

            <div className="contact-form__input-wrapper">
              <input
                type="text"
                placeholder="Имя"
                className="contact-form__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="contact-form__input-wrapper contact-form__input-wrapper--phone">
              <TabletSmartphone
                size={22}
                strokeWidth={2}
                color="var(--color-primary)"
                className="contact-form__flag"
              />
              <input
                type="tel"
                placeholder="+7 (999) 999-99-99"
                className="contact-form__input"
                value={phone}
                onChange={handlePhoneChange}
                disabled={loading}
                required
              />
            </div>

            <div className="contact-form__btn-wrapper">
              <Button variant="secondary" className="contact-form__submit" fullWidth type="submit" disabled={loading || !policyAccepted}>
                {loading ? 'Отправка...' : 'Консультация'}
              </Button>
            </div>

            <div className="contact-form__agreement-wrapper">
              <input 
                type="checkbox" 
                id="contact-policy" 
                className="contact-form__checkbox" 
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                disabled={loading}
                required
              />
              <label htmlFor="contact-policy" className="contact-form__agreement">
                Я ознакомился с <a href="#">политикой конфиденциальности</a> и даю согласие на <a href="#">обработку персональных данных</a>
              </label>
            </div>

          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;