import { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getBookedDatesForMonth } from '../../../../services/availabilityService';
import './CatalogFilters.scss';

interface CatalogFiltersProps {
  startDate: string | null;
  setStartDate: (date: string | null) => void;
  endDate: string | null;
  setEndDate: (date: string | null) => void;
  selectedType: 'big' | 'small' | null;
  setSelectedType: (type: 'big' | 'small' | null) => void;
}

const CatalogFilters = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedType,
  setSelectedType,
}: CatalogFiltersProps) => {
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  // Закрытие календаря при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.catalog-filters__calendar-modal') && !target.closest('.catalog-filters__date-wrapper')) {
        setActiveDatePicker(null);
      }
      if (!target.closest('.catalog-filters__guests-wrapper')) {
        setIsGuestsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Загрузка забронированных дат для календаря
  useEffect(() => {
    const loadBookedDates = () => {
      if (!activeDatePicker) return;
      
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      let booked: string[] = [];
      if (selectedType) {
        booked = getBookedDatesForMonth(selectedType, year, month);
      } else {
        const bookedBig = getBookedDatesForMonth('big', year, month);
        const bookedSmall = getBookedDatesForMonth('small', year, month);
        // Пересечение: дата считается занятой только если оба типа заняты
        booked = bookedBig.filter(d => bookedSmall.includes(d));
      }
      setBookedDates(booked);
    };

    loadBookedDates();
  }, [currentMonth, selectedType, activeDatePicker]);

  const formatDateInput = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    let firstDayIndex = firstDay.getDay();
    if (firstDayIndex === 0) firstDayIndex = 7;
    
    for (let i = 1; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="catalog-filters__calendar-day empty"></div>);
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isCheckIn = dateStr === startDate;
      const isCheckOut = dateStr === endDate;
      const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
      const isPast = new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
      const isBooked = bookedDates.includes(dateStr);
      
      days.push(
        <div
          key={d}
          className={`catalog-filters__calendar-day 
            ${isCheckIn ? 'check-in' : ''} 
            ${isCheckOut ? 'check-out' : ''}
            ${isInRange ? 'in-range' : ''}
            ${isPast ? 'past' : ''}
            ${isBooked ? 'booked' : ''}
          `}
          onClick={() => {
            if (isPast || isBooked) return;
            
            if (activeDatePicker === 'checkIn') {
              setStartDate(dateStr);
              if (endDate && new Date(dateStr) > new Date(endDate)) {
                setEndDate(null);
              }
              setActiveDatePicker('checkOut');
            } else if (activeDatePicker === 'checkOut') {
              if (startDate && new Date(dateStr) > new Date(startDate)) {
                setEndDate(dateStr);
                setActiveDatePicker(null);
              } else if (!startDate) {
                setEndDate(dateStr);
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

  return (
    <div className="catalog-filters__section">
      <div className="catalog-filters__container">
        <div className="catalog-filters__wrapper">

          <div className="catalog-filters__search-group-wrapper">
            <div className="catalog-filters__search-group">
              <div className="catalog-filters__date-wrapper">
                <div className="catalog-filters__date-picker">
                  <div 
                    className={`catalog-filters__date-input-fake ${startDate ? 'selected' : ''}`}
                    onClick={() => setActiveDatePicker(activeDatePicker ? null : 'checkIn')}
                  >
                    {startDate ? formatDateInput(startDate) : 'Заезд'}
                  </div>
                  <div className="catalog-filters__date-divider"></div>
                  <button 
                    className={`catalog-filters__date-input-fake ${endDate ? 'selected' : ''}`} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDatePicker(activeDatePicker ? null : 'checkOut');
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {endDate ? formatDateInput(endDate) : 'Отъезд'}
                  </button>
                </div>
              </div>

              <button className="catalog-filters__search-btn">
                Найти
              </button>
            </div>
            <button className="catalog-filters__reset" onClick={() => { setStartDate(null); setEndDate(null); setSelectedType(null); }}>
              Сбросить
            </button>

            {activeDatePicker && (
              <div className="catalog-filters__calendar-modal">
                <div className="catalog-filters__calendar-modal-header">
                  <span className="catalog-filters__calendar-modal-title">
                    {activeDatePicker === 'checkIn' ? 'Выберите дату заезда' : 'Выберите дату отъезда'}
                  </span>
                  <button className="catalog-filters__calendar-modal-close" onClick={() => setActiveDatePicker(null)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className="catalog-filters__calendar-modal-content">
                  <div className="catalog-filters__calendar-header">
                    <button onClick={() => changeMonth(-1)} className="catalog-filters__calendar-nav">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="catalog-filters__calendar-month">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button onClick={() => changeMonth(1)} className="catalog-filters__calendar-nav">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  
                  <div className="catalog-filters__calendar-weekdays">
                    {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(day => (
                      <div key={day} className="weekday">{day}</div>
                    ))}
                  </div>
                  
                  <div className="catalog-filters__calendar-grid">
                    {getDaysInMonth()}
                  </div>

                  <div className="catalog-filters__calendar-legend">
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
            )}
          </div>

          <div className="catalog-filters__guests-wrapper" style={{ position: 'relative' }}>
            <button 
              className="catalog-filters__filter-btn" 
              onClick={() => setIsGuestsOpen(!isGuestsOpen)}
            >
              {selectedType === 'big' ? '6 мест' : selectedType === 'small' ? '4 места' : 'Все коттеджи'} 
              <ChevronDown size={16} />
            </button>
            {isGuestsOpen && (
              <div className="catalog-filters__guests-dropdown">
                <button 
                  className="catalog-filters__guest-option"
                  onClick={() => { setSelectedType(null); setIsGuestsOpen(false); }}
                >
                  Все коттеджи
                </button>
                <button 
                  className="catalog-filters__guest-option"
                  onClick={() => { setSelectedType('small'); setIsGuestsOpen(false); }}
                >
                  4 места
                </button>
                <button 
                  className="catalog-filters__guest-option"
                  onClick={() => { setSelectedType('big'); setIsGuestsOpen(false); }}
                >
                  6 мест
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogFilters;
