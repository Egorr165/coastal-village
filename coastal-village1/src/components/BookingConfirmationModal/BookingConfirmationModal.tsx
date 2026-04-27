import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { getNightsWord } from '../BookingCalendar/BookingCalendar';
import './BookingConfirmationModal.scss';

export interface BookingDetails {
  houseId: string;
  cottageName: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  nights: number;
  extras: {
    extraBed: boolean;
  };
  totalPrice: number;
}

export interface PersonalData {
  name: string;
  phone: string;
  email: string;
}

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalData?: PersonalData) => void;
  bookingDetails: BookingDetails | null;
  personalData?: PersonalData | null;
  orderNumber: number;
}

const formatDateForDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingDetails,
  personalData,
  orderNumber
}) => {
  const [guestData, setGuestData] = useState<PersonalData>({
    name: '',
    phone: '',
    email: ''
  });
  
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touchedFields, setTouchedFields] = useState({ phone: false, email: false });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;
    let digitsOnly = inputVal.replace(/\D/g, ''); // Удаляем всё, кроме цифр

    // Обработка очистки поля
    if (!digitsOnly) {
      setGuestData(prev => ({ ...prev, phone: '' }));
      setPhoneError('Телефон обязателен');
      return;
    }

    if (['7', '8', '9'].includes(digitsOnly[0])) {
      if (digitsOnly[0] === '9') {
        digitsOnly = '7' + digitsOnly; // Автоматически подставляем 7, если ввод начат с 9
      }

      // Ограничиваем длину до 11 цифр (стандарт РФ)
      digitsOnly = digitsOnly.substring(0, 11);

      let formattedPhone = '+7';
      if (digitsOnly.length > 1) formattedPhone += ' (' + digitsOnly.substring(1, 4);
      if (digitsOnly.length >= 5) formattedPhone += ') ' + digitsOnly.substring(4, 7);
      if (digitsOnly.length >= 8) formattedPhone += '-' + digitsOnly.substring(7, 9);
      if (digitsOnly.length >= 10) formattedPhone += '-' + digitsOnly.substring(9, 11);

      setGuestData(prev => ({ ...prev, phone: formattedPhone }));
      
      // Строгая валидация
      if (digitsOnly.length !== 11) {
        setPhoneError('Номер должен содержать 11 цифр');
      } else {
        setPhoneError('');
      }
    } else {
      // Для международных номеров просто подставляем + и ограничиваем 15 цифрами
      digitsOnly = digitsOnly.substring(0, 15);
      const formattedPhone = '+' + digitsOnly;
      setGuestData(prev => ({ ...prev, phone: formattedPhone }));
      setPhoneError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuestData(prev => ({ ...prev, email: val }));
    if (!val.trim()) {
      setEmailError('Почта обязательна');
    } else if (!validateEmail(val)) {
      setEmailError('Неверный формат почты');
    } else {
      setEmailError('');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setGuestData({
        name: personalData?.name && !personalData.name.includes('Гость') ? personalData.name : '',
        phone: personalData?.phone && !personalData.phone.includes('Не указан') ? personalData.phone : '',
        email: personalData?.email && !personalData.email.includes('Не указан') ? personalData.email : ''
      });
      setPhoneError('');
      setEmailError('');
      setTouchedFields({ phone: false, email: false });
    }
  }, [isOpen, personalData]);

  if (!isOpen || !bookingDetails) return null;

  let extraBedsCount = 0;
  if (bookingDetails.extras.extraBed) extraBedsCount += 1;

  let houseTypeStr = bookingDetails.cottageName;
  let houseNumStr = '';
  if (houseTypeStr.includes(' №')) {
    const splitArr = houseTypeStr.split(' №');
    houseTypeStr = splitArr[0];
    houseNumStr = splitArr[1];
  }
  // Если не нашел " №", но есть "КОТТЕДЖ №"
  else if (houseTypeStr.includes('КОТТЕДЖ №')) {
    const splitArr = houseTypeStr.split('КОТТЕДЖ №');
    if (splitArr[0].trim() === '') {
      houseTypeStr = 'Коттедж';
    } else {
      houseTypeStr = splitArr[0];
    }
    houseNumStr = splitArr[1];
  }

  const isFormValid = (
    guestData.name.trim() !== '' && 
    guestData.phone.trim() !== '' && 
    guestData.email.trim() !== '' && 
    !phoneError && 
    !emailError
  );

  const handleConfirm = () => {
    onConfirm(guestData);
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-wrapper" onClick={e => e.stopPropagation()}>
        <div className="booking-modal-wrapper__header">
          <CheckCircle2 className="booking-modal-wrapper__icon" size={28} />
          <h2 className="booking-modal-wrapper__title">Заявка сформирована</h2>
        </div>
        
        <div className="booking-modal">
          <div className="booking-modal__top">
            <div className="booking-modal__top-left">
              <span className="booking-modal__label">Комплекс</span>
              <h3 className="booking-modal__subtitle">7 континент</h3>
            </div>
            <div className="booking-modal__top-right text-right">
              <span className="booking-modal__label">Заявка №</span>
              <div className="booking-modal__order-num">{orderNumber}</div>
            </div>
          </div>

          <div className="booking-modal__dates-card">
            <div className="booking-modal__date-col">
              <span className="booking-modal__date-label">ЗАЕЗД</span>
              <span className="booking-modal__date-value">{formatDateForDisplay(bookingDetails.checkIn)}</span>
              <span className="booking-modal__time-value">с {bookingDetails.checkInTime}</span>
            </div>
            
            <div className="booking-modal__date-separator">
               <ArrowRight className="booking-modal__arrow-icon" size={20} />
               <span className="booking-modal__nights">{bookingDetails.nights} {getNightsWord(bookingDetails.nights)}</span>
            </div>

            <div className="booking-modal__date-col text-right">
              <span className="booking-modal__date-label">ВЫЕЗД</span>
              <span className="booking-modal__date-value">{formatDateForDisplay(bookingDetails.checkOut)}</span>
              <span className="booking-modal__time-value">до {bookingDetails.checkOutTime}</span>
            </div>
          </div>

          <div className="booking-modal__grid">
            <div className="booking-modal__grid-item">
              <span className="booking-modal__label">ИНФОРМАЦИЯ О ГОСТЕ</span>
              <div className="booking-modal__text-group">
                {personalData ? (
                  <div className="booking-modal__guest-inputs">
                    <input 
                      type="text" 
                      placeholder="Ваше имя" 
                      value={guestData.name} 
                      onChange={e => setGuestData({...guestData, name: e.target.value})} 
                    />
                    <div className="booking-modal__input-wrapper">
                      <input 
                        type="tel" 
                        placeholder="Телефон (+7...)" 
                        value={guestData.phone} 
                        onChange={handlePhoneChange} 
                        onBlur={() => setTouchedFields(prev => ({...prev, phone: true}))}
                        className={touchedFields.phone && phoneError ? 'input-error' : ''}
                      />
                      {touchedFields.phone && phoneError && <span className="booking-modal__error-text">{phoneError}</span>}
                    </div>
                    <div className="booking-modal__input-wrapper">
                      <input 
                        type="email" 
                        placeholder="Email" 
                        value={guestData.email} 
                        onChange={handleEmailChange} 
                        onBlur={() => setTouchedFields(prev => ({...prev, email: true}))}
                        className={touchedFields.email && emailError ? 'input-error' : ''}
                      />
                      {touchedFields.email && emailError && <span className="booking-modal__error-text">{emailError}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="booking-modal__auth-warning">
                    <p className="booking-modal__auth-warning-text">
                      Для оформления бронирования необходимо войти в аккаунт или зарегистрироваться.
                    </p>
                    <button 
                      onClick={() => {
                         sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search);
                         if (bookingDetails) {
                             sessionStorage.setItem('pendingBookingDetails', JSON.stringify(bookingDetails));
                         }
                         window.location.href = '/login';
                      }}
                      className="booking-modal__auth-btn"
                    >
                      Авторизоваться
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="booking-modal__grid-item">
              <span className="booking-modal__label">ДЕТАЛИ ПРОЖИВАНИЯ</span>
              <div className="booking-modal__text-group">
                <span className="booking-modal__text-strong">{houseTypeStr}</span>
                {houseNumStr && <span className="booking-modal__text">Номер коттеджа: {houseNumStr}</span>}
                <div className="booking-modal__detail-item">
                  <span className="booking-modal__text">Доп. место: {bookingDetails.extras.extraBed ? 'Да (1500 ₽/сутки)' : 'Нет'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="booking-modal__divider"></div>

          <div className="booking-modal__total-row">
            <span className="booking-modal__total-label">Итоговая стоимость:</span>
            <span className="booking-modal__total-price">
              {bookingDetails.totalPrice.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="booking-modal__actions">
            <button className="btn-secondary" onClick={onClose}>
              Изменить заявку
            </button>
            {personalData && (
              <button 
                className="btn-primary" 
                onClick={handleConfirm}
                disabled={!isFormValid}
                style={{ opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? 'pointer' : 'not-allowed' }}
              >
                Подтвердить заявку
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
