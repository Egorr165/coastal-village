import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getBookedDatesForMonth } from '../../services/availabilityService';
import './CalendarModal.scss';

import type { House } from '../../types/house';

interface CalendarModalProps {
  activeDatePicker: 'checkIn' | 'checkOut' | null;
  setActiveDatePicker: React.Dispatch<React.SetStateAction<'checkIn' | 'checkOut' | null>>;
  checkIn: string;
  checkOut: string;
  onDatesChange: (dates: { checkIn: string; checkOut: string }) => void;
  houseType: 'big' | 'small' | null;
  houses: House[];
}

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  activeDatePicker,
  setActiveDatePicker,
  checkIn,
  checkOut,
  onDatesChange,
  houseType,
  houses
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(checkIn || new Date()));
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  // Обработка Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDatePicker(null);
      }
    };
    if (activeDatePicker) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeDatePicker, setActiveDatePicker]);

  // Загрузка забронированных дат
  useEffect(() => {
    const loadBookedDates = () => {
      if (!activeDatePicker) return;
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      let booked: string[] = [];
      if (houseType) {
        booked = getBookedDatesForMonth(houses, houseType, year, month);
      } else {
        const bookedBig = getBookedDatesForMonth(houses, 'big', year, month);
        const bookedSmall = getBookedDatesForMonth(houses, 'small', year, month);
        booked = bookedBig.filter(d => bookedSmall.includes(d));
      }
      setBookedDates(booked);
    };
    loadBookedDates();
  }, [currentMonth, activeDatePicker, houseType]);

  if (!activeDatePicker) return null;

  const changeMonth = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    let firstDayIndex = firstDay.getDay();
    if (firstDayIndex === 0) firstDayIndex = 7;
    
    for (let i = 1; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isCheckIn = dateStr === checkIn;
      const isCheckOut = dateStr === checkOut;
      const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
      const isPast = new Date(year, month, d).getTime() < todayTime;
      const isBooked = bookedDates.includes(dateStr);
      
      days.push(
        <div
          key={d}
          className={`calendar-day 
            ${isCheckIn ? 'check-in' : ''} 
            ${isCheckOut ? 'check-out' : ''}
            ${isInRange ? 'in-range' : ''}
            ${isPast ? 'past' : ''}
            ${isBooked ? 'booked' : ''}
          `}
          onClick={() => {
            if (isPast || isBooked) return;
            
            if (activeDatePicker === 'checkIn') {
              let newCheckOut = checkOut;
              if (newCheckOut && new Date(dateStr) > new Date(newCheckOut)) {
                newCheckOut = '';
              }
              onDatesChange({ checkIn: dateStr, checkOut: newCheckOut });
              setActiveDatePicker('checkOut');
            } else if (activeDatePicker === 'checkOut') {
              if (checkIn && new Date(dateStr) > new Date(checkIn)) {
                onDatesChange({ checkIn, checkOut: dateStr });
                setActiveDatePicker(null);
              } else if (!checkIn) {
                onDatesChange({ checkIn, checkOut: dateStr });
                setActiveDatePicker(null);
              }
            }
          }}
        >
          {d}
          {isBooked && <span className="booked-dot"></span>}
        </div>
      );
    }
    
    return days;
  };

  return createPortal(
    <div className="calendar-modal-container">
      <div className="calendar-overlay" onClick={() => setActiveDatePicker(null)} />
      <div className="calendar-modal">
        <div className="calendar-modal-header">
          <span className="calendar-modal-title">
            {activeDatePicker === 'checkIn' ? 'Выберите дату заезда' : 'Выберите дату отъезда'}
          </span>
          <button className="calendar-modal-close" onClick={() => setActiveDatePicker(null)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="calendar-modal-content">
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)} className="calendar-nav">
              <ChevronLeft size={18} />
            </button>
            <span className="calendar-month">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button onClick={() => changeMonth(1)} className="calendar-nav">
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="calendar-weekdays">
            {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          
          <div className="calendar-grid">
            {getDaysInMonth()}
          </div>

          <div className="calendar-legend">
            <span className="legend-item">
              <span className="legend-dot available"></span> Доступно
            </span>
            <span className="legend-item">
              <span className="legend-dot booked"></span> Занято
            </span>
            <span className="legend-item">
              <span className="legend-dot selected"></span> Выбрано
            </span>
          </div>
        </div>
      </div>
    </div>, document.body
  );
};
