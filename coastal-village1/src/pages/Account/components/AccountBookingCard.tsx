import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../features/auth/AuthContext';
import { ArrowRight } from 'lucide-react';
import '../../../components/BookingConfirmationModal/BookingConfirmationModal.scss';
import '../../../components/SearchFilters/SearchFilters.scss';
import { CalendarModal } from '../../../components/CalendarModal/CalendarModal';
import { CustomSelect } from '../../../components/CustomSelect/CustomSelect';
import bookingService from '../../../services/bookingService';
import { useToastStore } from '../../../store/useToastStore';

export interface Booking {
  id: number;
  complexName: string;
  cottageName: string;
  houseNumStr: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  nights: number;
  status: string;
  totalPrice: number;
  extras: {
    extraBedCount: number;
  };
}

const booking: Booking = {
  id: 9466,
  complexName: "7 континент",
  cottageName: "6-ти местный коттедж",
  houseNumStr: "1",
  checkIn: "2026-03-26",
  checkOut: "2026-03-29",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  nights: 3,
  status: "Оплачен",
  totalPrice: 44000,
  extras: {
    extraBedCount: 0
  }
};

const formatDateForDisplay = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
};

const getNightsWord = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'ночей';
  if (lastDigit === 1) return 'ночь';
  if (lastDigit >= 2 && lastDigit <= 4) return 'ночи';
  return 'ночей';
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Ожидает подтверждения': return 'booking-modal__status--pending';
    case 'Подтверждено': return 'booking-modal__status--confirmed';
    case 'Отменено': return 'booking-modal__status--cancelled';
    default: return 'booking-modal__status--default';
  }
};

interface AccountBookingCardProps {
  bookingData?: Booking;
  readOnly?: boolean;
}

const AccountBookingCard: React.FC<AccountBookingCardProps> = ({ bookingData, readOnly = false }) => {
  const { user } = useAuth();
  const addToast = useToastStore(state => state.addToast);
  
  const currentBooking = bookingData || booking;
  
  const [isEditing, setIsEditing] = useState(false);

  const [guestData, setGuestData] = useState({
    name: user?.name || 'egor',
    phone: user?.phone || '+7 (928) 959-07-80',
    email: user?.email || 'kalmykov20.20@mail.ru'
  });

  const [editDates, setEditDates] = useState<{checkIn: string, checkOut: string}>({
    checkIn: currentBooking.checkIn,
    checkOut: currentBooking.checkOut
  });

  const [editExtras, setEditExtras] = useState({
    extraBedCount: currentBooking.extras.extraBedCount,
  });

  const [currentNights, setCurrentNights] = useState(currentBooking.nights);

  const [activeDatePicker, setActiveDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const basePricePerNight = React.useMemo(() => {
    const extrasCost = (currentBooking.extras.extraBedCount * 1500);
    return currentBooking.nights > 0 
      ? (currentBooking.totalPrice - extrasCost) / currentBooking.nights 
      : 0;
  }, [currentBooking]);

  const currentTotalPrice = React.useMemo(() => {
    const extrasCost = (editExtras.extraBedCount * 1500);
    return (currentNights * basePricePerNight) + extrasCost;
  }, [currentNights, basePricePerNight, editExtras]);

  useEffect(() => {
    if (editDates.checkIn && editDates.checkOut) {
      const start = new Date(editDates.checkIn);
      const end = new Date(editDates.checkOut);
      const diffTime = end.getTime() - start.getTime();
      const diffNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffNights > 0) {
        setCurrentNights(diffNights);
      }
    }
  }, [editDates]);

  const handleSave = () => {
    setIsEditing(false);
    setActiveDatePicker(null);
  };

  const handleCancelBookingAction = () => {
    // 14 days validation logic
    const checkInDate = new Date(currentBooking.checkIn);
    const today = new Date();
    today.setHours(0,0,0,0);
    checkInDate.setHours(0,0,0,0);
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 14) {
      addToast('Отмена невозможна, так как до заезда осталось менее 14 дней.', 'error');
      return;
    }

    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    setShowCancelConfirm(false);
    try {
      await bookingService.cancelBooking(currentBooking.id);
      addToast('Заявка успешно отменена!', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.error || 'Произошла ошибка при отмене.', 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setActiveDatePicker(null);
    setGuestData({
      name: user?.name || 'egor',
      phone: user?.phone || '+7 (928) 959-07-80',
      email: user?.email || 'kalmykov20.20@mail.ru'
    });
    setEditDates({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut
    });
    setEditExtras({
      extraBedCount: booking.extras.extraBedCount,
    });
    setCurrentNights(booking.nights);
  };

  return (
    <div className="booking-modal booking-modal--embedded">
      <div className="booking-modal__top">
        <div className="booking-modal__top-left">
          <div className="booking-modal__status-wrapper">
            <span className="booking-modal__label booking-modal__label--mb-none">КОМПЛЕКС</span>
            <span className={`booking-modal__status ${getStatusClass(currentBooking.status)}`}>
              {currentBooking.status}
            </span>
          </div>
          <h3 className="booking-modal__subtitle">{currentBooking.complexName}</h3>
        </div>
        <div className="booking-modal__top-right text-right">
          <span className="booking-modal__label">ЗАЯВКА №</span>
          <div className="booking-modal__order-num">{currentBooking.id}</div>
        </div>
      </div>
      <div className="booking-modal__dates-card">
        <div className="booking-modal__date-col" onClick={() => isEditing && setActiveDatePicker('checkIn')} style={{ cursor: isEditing ? 'pointer' : 'default' }}>
          <span className="booking-modal__date-label">ЗАЕЗД</span>
          {isEditing ? (
            <div className="booking-modal__date-input">
              {editDates.checkIn ? formatDateForDisplay(editDates.checkIn) : 'Выберите дату'}
            </div>
          ) : (
            <span className="booking-modal__date-value">{formatDateForDisplay(editDates.checkIn)}</span>
          )}
          <span className="booking-modal__time-value">с {currentBooking.checkInTime}</span>
        </div>
        
        <div className="booking-modal__date-separator">
           <ArrowRight className="booking-modal__arrow-icon" size={20} />
           <span className="booking-modal__nights">{currentNights} {getNightsWord(currentNights)}</span>
        </div>

        <div className="booking-modal__date-col text-right" onClick={() => isEditing && setActiveDatePicker('checkOut')} style={{ cursor: isEditing ? 'pointer' : 'default' }}>
          <span className="booking-modal__date-label">ВЫЕЗД</span>
          {isEditing ? (
            <div className="booking-modal__date-input booking-modal__date-input--right">
              {editDates.checkOut ? formatDateForDisplay(editDates.checkOut) : 'Выберите дату'}
            </div>
          ) : (
            <span className="booking-modal__date-value">{formatDateForDisplay(editDates.checkOut)}</span>
          )}
          <span className="booking-modal__time-value">до {currentBooking.checkOutTime}</span>
        </div>
      </div>

      <div className="booking-modal__grid">
        <div className="booking-modal__grid-item">
          <span className="booking-modal__label">ИНФОРМАЦИЯ О ГОСТЕ</span>
          <div className="booking-modal__text-group">
            <div className="booking-modal__guest-inputs">
              <input 
                type="text" 
                value={guestData.name} 
                disabled={!isEditing}
                className={`booking-modal__input ${readOnly ? 'booking-modal__input--readonly' : ''}`}
                onChange={e => setGuestData({...guestData, name: e.target.value})} 
              />
              <div className="booking-modal__input-wrapper">
                <input 
                  type="tel" 
                  value={guestData.phone} 
                  disabled={!isEditing}
                  className={`booking-modal__input ${readOnly ? 'booking-modal__input--readonly' : ''}`}
                  onChange={e => setGuestData({...guestData, phone: e.target.value})} 
                />
              </div>
              <div className="booking-modal__input-wrapper">
                <input 
                  type="email" 
                  value={guestData.email} 
                  disabled={!isEditing}
                  className={`booking-modal__input ${readOnly ? 'booking-modal__input--readonly' : ''}`}
                  onChange={e => setGuestData({...guestData, email: e.target.value})} 
                />
              </div>
            </div>
          </div>
        </div>
        <div className="booking-modal__grid-item">
          <span className="booking-modal__label">ДЕТАЛИ ПРОЖИВАНИЯ</span>
          <div className="booking-modal__text-group booking-modal__text-group--details">
            <span className="booking-modal__text-strong">{currentBooking.cottageName}</span>
            {currentBooking.houseNumStr && <span className="booking-modal__text">Номер коттеджа: {currentBooking.houseNumStr}</span>}
            
            <div className="booking-modal__text booking-modal__text--flex">
              <span>Доп. места:</span>
              {isEditing ? (
                <CustomSelect
                  options={[
                    { value: 0, label: 'Нет' },
                    { value: 1, label: '1' },
                    { value: 2, label: '2' }
                  ]}
                  value={editExtras.extraBedCount}
                  onChange={val => setEditExtras({...editExtras, extraBedCount: Number(val)})}
                />
              ) : (
                <span>{editExtras.extraBedCount > 0 ? editExtras.extraBedCount : 'Нет'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="booking-modal__divider"></div>

      <div className="booking-modal__total-row">
        <span className="booking-modal__total-label">Итоговая стоимость:</span>
        <span className="booking-modal__total-price">
          {currentTotalPrice.toLocaleString('ru-RU')} ₽
        </span>
      </div>

      {!readOnly && (
        <div className="booking-modal__actions booking-modal__actions--spaced">
          {!isEditing ? (
            <>
              <button 
                className="booking-modal__btn-cancel booking-modal__btn-cancel--large" 
                onClick={handleCancelBookingAction}
              >
                Отменить бронирование
              </button>
              <button 
                className="booking-modal__btn-save booking-modal__btn-save--large" 
                onClick={() => setIsEditing(true)}
              >
                Изменить
              </button>
            </>
          ) : (
            <>
              <button 
                className="booking-modal__btn-cancel booking-modal__btn-cancel--large" 
                onClick={handleCancel}
              >
                Отменить
              </button>
              <button 
                className="booking-modal__btn-save booking-modal__btn-save--large booking-modal__btn-save--flex2" 
                onClick={handleSave}
              >
                Сохранить изменения
              </button>
            </>
          )}
        </div>
      )}

      {isEditing && (
        <CalendarModal 
          activeDatePicker={activeDatePicker}
          setActiveDatePicker={setActiveDatePicker}
          checkIn={editDates.checkIn}
          checkOut={editDates.checkOut}
          onDatesChange={(dates) => {
            setEditDates({
              checkIn: dates.checkIn || '',
              checkOut: dates.checkOut || currentBooking.checkOut
            });
          }}
          houseType={currentBooking.cottageName.includes('6') ? 'big' : 'small'}
          houses={[]}
        />
      )}

      {showCancelConfirm && createPortal(
        <div className="account-modal-overlay">
          <div className="account-modal">
            <h3 className="account-modal__title">Подтверждение отмены</h3>
            <p className="account-modal__text">
              Вы уверены, что хотите отменить эту заявку на бронирование? <br/><br/>
              <b>Это действие необратимо.</b>
            </p>
            <div className="account-modal__actions">
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="account-modal__btn account-modal__btn--cancel"
              >
                Вернуться
              </button>
              <button 
                onClick={confirmCancel}
                className="account-modal__btn account-modal__btn--confirm"
              >
                Отменить бронь
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AccountBookingCard;
