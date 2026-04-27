import { useState, useEffect } from 'react';
import { BookingRange, House } from '../../types/house';
import './BookingCalendar.scss';
import { BookingDetails } from '../BookingConfirmationModal/BookingConfirmationModal';
import { getBookedDatesForMonth } from '../../services/availabilityService';

interface BookingCalendarProps {
  houseId: string;
  houseTitle?: string;
  houseType: 'big' | 'small';
  pricePerNight: number;
  bookedRanges?: BookingRange[];
  houses?: House[];
  initialCheckIn?: string | null;
  initialCheckOut?: string | null;
  checkInTime?: string;
  checkOutTime?: string;
  allowHouseSelection?: boolean;
  onHouseTypeChange?: (type: 'big' | 'small') => void;
  onBeforeBooking?: () => boolean;
  onBookClick?: (details: BookingDetails) => void;
}

interface BookedDate {
  date: string;
  availableFrom: string;
}

export const getNightsWord = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return 'ночей';
  if (mod10 === 1) return 'ночь';
  if (mod10 >= 2 && mod10 <= 4) return 'ночи';
  return 'ночей';
};

const DEFAULT_BOOKED_RANGES: BookingRange[] = [];
const DEFAULT_HOUSES: House[] = [];

const BookingCalendar = ({
  houseId,
  houseTitle,
  houseType,
  pricePerNight,
  bookedRanges = DEFAULT_BOOKED_RANGES,
  houses = DEFAULT_HOUSES,
  initialCheckIn,
  initialCheckOut,
  checkInTime = "14:00",
  checkOutTime = "12:00",
  allowHouseSelection = false,
  onHouseTypeChange,
  onBeforeBooking,
  onBookClick
}: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [checkInDate, setCheckInDate] = useState<string | null>(initialCheckIn || null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(initialCheckOut || null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nightsCount, setNightsCount] = useState(0);
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);

  // Дополнительные услуги
  const [isExtraBedSelected, setIsExtraBedSelected] = useState(false);

  useEffect(() => {
    if (checkInDate) {
      const date = new Date(checkInDate);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [checkInDate]);

  useEffect(() => {
    if (allowHouseSelection) {
      setCheckInDate(null);
      setCheckOutDate(null);
    }
  }, [houseType, allowHouseSelection]);

  const baseCottageName = houseType === 'big' ? '6-ти местный коттедж' : '4-х местный коттедж';

  useEffect(() => {
    if (houses && houses.length > 0) {
      const currentMonthBooked = getBookedDatesForMonth(houses, houseType, currentYear, currentMonth + 1);
      
      const nextMonth = currentMonth === 11 ? 1 : currentMonth + 2;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const nextMonthBooked = getBookedDatesForMonth(houses, houseType, nextYear, nextMonth);
      
      const prevMonth = currentMonth === 0 ? 12 : currentMonth;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const prevMonthBooked = getBookedDatesForMonth(houses, houseType, prevYear, prevMonth);

      const allBooked = [...new Set([...prevMonthBooked, ...currentMonthBooked, ...nextMonthBooked])];
      
      setBookedDates(allBooked.map(date => ({
        date,
        availableFrom: 'Мест нет. Выберите другие даты.'
      })));
    } else {
      const booked: BookedDate[] = [];

      bookedRanges.forEach(range => {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);

        const freeDate = new Date(end);
        const availableFrom = `Освободится ${freeDate.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit'
        })}`;

        // Блокируем только ночи (d < end), чтобы можно было выехать в день чужого заезда
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];

          booked.push({
            date: dateStr,
            availableFrom
          });
        }
      });

      setBookedDates(booked);
    }
  }, [bookedRanges, houses, houseType, currentMonth, currentYear]);

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

    // День недели первого дня (0 = воскресенье, переводим в ПН=0)
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
      const isPast = new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));

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

    // Дни следующего месяца чтобы заполнить сетку (до 42 ячеек обычно или просто до кратного 7)
    let nextMonthDay = 1;
    while (days.length % 7 !== 0) {
      days.push(
        <div key={`next-${nextMonthDay}`} className="booking-widget__day booking-widget__day--inactive">
          {nextMonthDay}
        </div>
      )
      nextMonthDay++;
    }

    return days;
  };

  // Обработка клика по дате
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
      if (onBeforeBooking && !onBeforeBooking()) {
        return;
      }

      let finalCottageName = baseCottageName;
      let finalHouseId = houseId;

      if (houseTitle) {
        finalCottageName = houseTitle;
      } else if (houseId === 'default') {
        const availableHouse = houses.find(house => house.type === houseType && !house.bookedRanges.some(range => 
          checkInDate! < range.endDate && checkOutDate! > range.startDate
        ));
        
        if (availableHouse) {
          finalHouseId = availableHouse.id;
          finalCottageName = availableHouse.title;
        } else {
          // Fallback if no specific house found (shouldn't happen if calendar blocks correctly, but just in case)
          if (houseType === 'big') {
            finalHouseId = 'house-big-1';
            finalCottageName = `${baseCottageName} №1`;
          } else {
            finalHouseId = 'house-small-1';
            finalCottageName = `${baseCottageName} №1`;
          }
        }
      } else {
        const parts = houseId.split('-');
        if (parts.length > 2) {
          const num = parts[parts.length - 1];
          finalCottageName = `${baseCottageName} №${num}`;
        }
      }

      const details: BookingDetails = {
        houseId: finalHouseId,
        cottageName: finalCottageName,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        checkInTime,
        checkOutTime,
        nights: nightsCount,
        extras: {
          extraBed: isExtraBedSelected
        },
        totalPrice
      };

      if (onBookClick) {
        onBookClick(details);
        return;
      }

      console.log('Бронирование:', {
        houseId: finalHouseId,
        cottageName: finalCottageName,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: nightsCount,
        extras: {
          extraBed: isExtraBedSelected
        },
        totalPrice
      });

      let extrasText = '';
      if (isExtraBedSelected) extrasText += '\nДоп. услуга: Дополнительное место (1500 ₽)';

      alert(`✅ Коттедж успешно забронирован!
      
${finalCottageName}
Заезд: ${formatDateForDisplay(checkInDate)} в ${checkInTime}
Выезд: ${formatDateForDisplay(checkOutDate)} в ${checkOutTime}
Продолжительность: ${nightsCount} ${getNightsWord(nightsCount)}${extrasText}
Итого к оплате: ${totalPrice.toLocaleString('ru-RU')} ₽`);
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
      if (isExtraBedSelected) extrasCost += 1500;

      setTotalPrice(diffDays * pricePerNight + extrasCost);
    } else {
      setNightsCount(0);
      setTotalPrice(0);
    }
  }, [checkInDate, checkOutDate, pricePerNight, isExtraBedSelected]);

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
        </div>
      </div>

      <div className="booking-widget__options">
        <label className="booking-widget__option">
          <input
            type="checkbox"
            checked={isExtraBedSelected}
            onChange={(e) => setIsExtraBedSelected(e.target.checked)}
          />
          <span>Дополнительное место - 1500 руб.</span>
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
          {nightsCount} {getNightsWord(nightsCount)} × {pricePerNight.toLocaleString('ru-RU')} ₽
          {isExtraBedSelected ? ' + 1500 ₽' : ''}
        </div>
      )}

    </div>
  );
};

export default BookingCalendar;