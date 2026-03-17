import { useState, useEffect } from 'react';
import type { BookedRange } from '../../types/house';
import './BookingCalendar.scss';

interface BookingCalendarProps {
  houseId: string;
  houseType: 'big' | 'small';
  pricePerNight: number;
  bookedRanges: BookedRange[];
  initialCheckIn?: string | null;
  initialCheckOut?: string | null;
  deposit?: number;
  checkInTime?: string;
  checkOutTime?: string;
  allowHouseSelection?: boolean;
  onHouseTypeChange?: (type: 'big' | 'small') => void;
}

interface BookedDate {
  date: string;
  availableFrom: string;
}

const BookingCalendar = ({ 
  houseId,
  houseType,
  pricePerNight,
  bookedRanges,
  initialCheckIn,
  initialCheckOut,
  deposit = 2000,
  checkInTime = "14:00",
  checkOutTime = "12:00",
  allowHouseSelection = false,
  onHouseTypeChange
}: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [checkInDate, setCheckInDate] = useState<string | null>(initialCheckIn || null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(initialCheckOut || null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nightsCount, setNightsCount] = useState(0);
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  
  // Дополнительные услуги
  const [isBabyCotSelected, setIsBabyCotSelected] = useState(false);
  const [isExtraBedSelected, setIsExtraBedSelected] = useState(false);

  useEffect(() => {
    if (checkInDate) {
      const date = new Date(checkInDate);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [checkInDate]);

  // Сбрасываем выбранные даты при смене типа коттеджа (когда меняем вкладку), 
  // чтобы избежать наложения старых дат на забронированные дни нового коттеджа
  useEffect(() => {
    if (allowHouseSelection) {
      setCheckInDate(null);
      setCheckOutDate(null);
    }
  }, [houseType, allowHouseSelection]);

  // Определяем название коттеджа
  const cottageName = houseType === 'big' ? '6-ти местный коттедж' : '4-х местный коттедж';

  // Преобразуем bookedRanges в формат BookedDate
  useEffect(() => {
    const booked: BookedDate[] = [];
    
    bookedRanges.forEach(range => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Формируем дату освобождения
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);
        const availableFrom = `Освободится ${nextDay.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit'
        })}`;
        
        booked.push({
          date: dateStr,
          availableFrom
        });
      }
    });
    
    setBookedDates(booked);
  }, [bookedRanges]);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

  // Переключение месяцев
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Форматирование даты
  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '.');
  };

  // Генерация дней месяца
  const renderCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // День недели первого дня (0 = воскресенье, переводим в ПН=0)
    let firstDayIndex = firstDay.getDay() - 1;
    if (firstDayIndex < 0) firstDayIndex = 6;

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    // Пустые ячейки (предыдущий месяц)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="booking-widget__day booking-widget__day--inactive">
          {prevMonthLastDay - i}
        </div>
      );
    }
    
    // Дни месяца
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isBooked = bookedDates.some(b => b.date === dateStr);
      const bookedInfo = bookedDates.find(b => b.date === dateStr);
      
      const isInRange = checkInDate && checkOutDate && 
                        dateStr > checkInDate && dateStr < checkOutDate;
      
      const isCheckIn = dateStr === checkInDate;
      const isCheckOut = dateStr === checkOutDate;
      const isPast = new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
      
      let modifier = "";
      if (isBooked || isPast) modifier = "booking-widget__day--inactive";
      else if (isCheckIn) modifier = "booking-widget__day--start";
      else if (isCheckOut) modifier = "booking-widget__day--end";
      else if (isInRange) modifier = "booking-widget__day--range";

      days.push(
        <div 
          key={d} 
          className={`booking-widget__day ${modifier}`}
          onClick={() => !isBooked && !isPast && handleDateClick(dateStr)}
        >
          {d}
          {isBooked && bookedInfo && (
            <span className="tooltip">{bookedInfo.availableFrom}</span>
          )}
        </div>
      );
    }

    // Дни следующего месяца чтобы заполнить сетку (до 42 ячеек обычно или просто до кратного 7)
    let nextMonthDay = 1;
    while(days.length % 7 !== 0) {
       days.push(
         <div key={`next-${nextMonthDay}`} className="booking-widget__day booking-widget__day--inactive">
           {nextMonthDay}
         </div>
       )
       nextMonthDay++;
    }
    
    return days;
  };

  // Обработка клика по дате
  const handleDateClick = (dateStr: string) => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Начинаем новый выбор
      setCheckInDate(dateStr);
      setCheckOutDate(null);
    } else if (checkInDate && !checkOutDate) {
      if (dateStr > checkInDate) {
        // Выбираем дату выезда
        setCheckOutDate(dateStr);
      } else {
        // Меняем дату заезда
        setCheckInDate(dateStr);
      }
    }
  };

  // Обработка бронирования
  const handleBooking = () => {
    if (checkInDate && checkOutDate) {
      console.log('Бронирование:', {
        houseId,
        cottageName,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: nightsCount,
        extras: {
          babyCot: isBabyCotSelected,
          extraBed: isExtraBedSelected
        },
        totalPrice,
        deposit
      });
      
      let extrasText = '';
      if (isBabyCotSelected) extrasText += '\nДоп. услуга: Детская кроватка (1500 ₽)';
      if (isExtraBedSelected) extrasText += '\nДоп. услуга: Дополнительное место (2000 ₽)';

      alert(`✅ Коттедж успешно забронирован!
      
${cottageName}
Заезд: ${formatDateForDisplay(checkInDate)} в ${checkInTime}
Выезд: ${formatDateForDisplay(checkOutDate)} в ${checkOutTime}
Количество ночей: ${nightsCount}${extrasText}
Итого к оплате: ${totalPrice.toLocaleString('ru-RU')} ₽`);
    }
  };

  // Расчет стоимости
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setNightsCount(diffDays);
      
      let extrasCost = 0;
      if (isBabyCotSelected) extrasCost += 1500;
      if (isExtraBedSelected) extrasCost += 2000;
      
      setTotalPrice(diffDays * pricePerNight + deposit + extrasCost);
    } else {
      setNightsCount(0);
      setTotalPrice(0);
    }
  }, [checkInDate, checkOutDate, pricePerNight, deposit, isBabyCotSelected, isExtraBedSelected]);

  return (
    <div className="booking-widget">
      <h3 className="booking-widget__title">Калькулятор стоимости</h3>

      {allowHouseSelection && (
        <div className="booking-widget__type-selector">
          <button 
            className={`booking-widget__type-btn ${houseType === 'small' ? 'active' : ''}`}
            onClick={() => onHouseTypeChange && onHouseTypeChange('small')}
          >
            4-х местный
          </button>
          <button 
            className={`booking-widget__type-btn ${houseType === 'big' ? 'active' : ''}`}
            onClick={() => onHouseTypeChange && onHouseTypeChange('big')}
          >
            6-ти местный
          </button>
        </div>
      )}

      <div className="booking-widget__calendar-header">
        <button onClick={prevMonth}>←</button>
        <span>{monthNames[currentMonth]} {currentYear}</span>
        <button onClick={nextMonth}>→</button>
      </div>

      <div className="booking-widget__calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="booking-widget__day-name">{day}</div>
        ))}
        {renderCalendarDays()}
      </div>

      <div className="booking-widget__details">
        <div className="booking-widget__detail-row">
          <div className="booking-widget__detail-col">
            <span className="booking-widget__label">Заезд</span>
            <span className="booking-widget__value">
              {checkInDate ? formatDateForDisplay(checkInDate) : '—'}
            </span>
            <span className="booking-widget__sub-value">Время: {checkInTime}</span>
          </div>
          <div className="booking-widget__detail-col">
            <span className="booking-widget__label">Выезд</span>
            <span className="booking-widget__value">
              {checkOutDate ? formatDateForDisplay(checkOutDate) : '—'}
            </span>
            <span className="booking-widget__sub-value">Время: {checkOutTime}</span>
          </div>
          <div className="booking-widget__detail-col booking-widget__detail-col--deposit">
            <div className="booking-widget__label-flex">
              Залог <span className="booking-widget__help-icon" title="Залог возвращается при выезде">?</span>
            </div>
            <span className="booking-widget__value">{deposit.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>

      <div className="booking-widget__options">
        <label className="booking-widget__option">
          <input 
            type="checkbox" 
            checked={isBabyCotSelected} 
            onChange={(e) => setIsBabyCotSelected(e.target.checked)} 
          />
          <span>Детская кроватка - 1500 руб.</span>
        </label>
        <label className="booking-widget__option">
          <input 
            type="checkbox" 
            checked={isExtraBedSelected} 
            onChange={(e) => setIsExtraBedSelected(e.target.checked)} 
          />
          <span>Дополнительное место - 2000 руб.</span>
        </label>
      </div>

      <div className="booking-widget__total">
        <span>Итоговая стоимость:</span>
        <span className="booking-widget__price-bold">
          {totalPrice > 0 ? totalPrice.toLocaleString('ru-RU') : '0'} ₽
        </span>
      </div>

      <button 
        className="booking-widget__btn"
        disabled={!checkInDate || !checkOutDate}
        onClick={handleBooking}
      >
        ЗАБРОНИРОВАТЬ
      </button>

      {nightsCount > 0 && (
        <div className="booking-widget__hint">
          {nightsCount} ночей × {pricePerNight.toLocaleString('ru-RU')} ₽ + {deposit.toLocaleString('ru-RU')} ₽ (залог)
          {isBabyCotSelected ? ' + 1500 ₽' : ''}
          {isExtraBedSelected ? ' + 2000 ₽' : ''}
        </div>
      )}

    </div>
  );
};

export default BookingCalendar;
