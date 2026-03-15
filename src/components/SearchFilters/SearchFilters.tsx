import { useState, useEffect } from 'react';
import { Calendar, Users, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  checkTypeAvailability, 
  getBookedDatesForMonth,
  getPriceByType,
  getHouseCountByType 
} from '../../services/availabilityService.ts';
import type { HouseType } from '../../types/house.ts';
import './SearchFilters.scss';
import Button from '../Button/Button.tsx';

const SearchFilters = () => {
  const navigate = useNavigate();
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [houseType, setHouseType] = useState<HouseType | null>(null);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [, setAvailability] = useState<{
    available: boolean;
    availableCount: number;
    totalCount: number;
    message: string;
  } | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  // Закрытие календаря по клику на оверлей или Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDatePicker(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Закрытие календаря при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.calendar-modal') && !target.closest('.filter-input-wrapper')) {
        setActiveDatePicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Загрузка забронированных дат для календаря
  useEffect(() => {
    const loadBookedDates = async () => {
      if (!houseType || !activeDatePicker) return;
      
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const booked = getBookedDatesForMonth(houseType, year, month);
      setBookedDates(booked);
    };

    loadBookedDates();
  }, [currentMonth, houseType, activeDatePicker]);

  // Проверка доступности при изменении параметров
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkIn || !checkOut || !houseType) {
        setAvailability(null);
        return;
      }

      if (new Date(checkOut) <= new Date(checkIn)) {
        setAvailability({
          available: false,
          availableCount: 0,
          totalCount: houseType === 'big' ? 5 : 1,
          message: '❌ Дата выезда должна быть позже даты заезда'
        });
        return;
      }

      setIsChecking(true);
      
      try {
        const result = checkTypeAvailability(houseType, checkIn, checkOut);
        setAvailability(result);
      } catch (error) {
        console.error('Ошибка проверки:', error);
        setAvailability({
          available: false,
          availableCount: 0,
          totalCount: houseType === 'big' ? 5 : 1,
          message: '❌ Произошла ошибка при проверке'
        });
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [checkIn, checkOut, houseType]);

  const handleSearch = () => {
    // Если есть выбранные параметры
    if (houseType || checkIn || checkOut) {
      const searchParams = new URLSearchParams();
      
      if (checkIn) searchParams.append('checkIn', checkIn);
      if (checkOut) searchParams.append('checkOut', checkOut);
      if (guests) searchParams.append('guests', guests.toString());
      if (houseType) searchParams.append('type', houseType);
      
      navigate(`/catalog?${searchParams.toString()}`);
    } else {
      // Если параметры не выбраны - просто переходим в каталог
      navigate('/catalog');
    }
  };

  const handleGuestsChange = (delta: number) => {
    setGuests(prev => Math.max(1, Math.min(20, prev + delta)));
  };

  const formatDateInput = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Генерация дней месяца
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Получаем день недели первого дня месяца (1 = ПН, 7 = ВС)
    let firstDayIndex = firstDay.getDay();
    // Преобразуем: 0 (ВС) -> 7, 1 (ПН) -> 1, 2 (ВТ) -> 2, и т.д.
    if (firstDayIndex === 0) firstDayIndex = 7;
    
    // Пустые ячейки для дней до начала месяца
    for (let i = 1; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Дни месяца
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isCheckIn = dateStr === checkIn;
      const isCheckOut = dateStr === checkOut;
      const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
      const isPast = new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
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
              setCheckIn(dateStr);
              if (checkOut && new Date(dateStr) > new Date(checkOut)) {
                setCheckOut('');
              }
              setActiveDatePicker('checkOut');
            } else if (activeDatePicker === 'checkOut') {
              if (checkIn && new Date(dateStr) > new Date(checkIn)) {
                setCheckOut(dateStr);
                setActiveDatePicker(null);
              } else if (!checkIn) {
                setCheckOut(dateStr);
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

  const changeMonth = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const isBigHouseAvailable = guests <= 6;
  const isSmallHouseAvailable = guests <= 4;

  const bigHouseCount = getHouseCountByType('big');
  const smallHouseCount = getHouseCountByType('small');
  const bigHousePrice = getPriceByType('big');
  const smallHousePrice = getPriceByType('small');

  return (
    <div className="search-filters">
      <h3 className="filters-title">Поиск коттеджей</h3>
      
      {/* Выезд */}
      <div className="filter-item">
        <label className="filter-label">Выезд</label>
        <div 
          className={`filter-input-wrapper ${activeDatePicker === 'checkIn' ? 'active' : ''}`}
          onClick={() => setActiveDatePicker('checkIn')}
        >
          <Calendar size={16} className="filter-icon" />
          <input
            type="text"
            className="filter-input"
            placeholder="ДД.ММ.ГГГГ"
            value={formatDateInput(checkIn)}
            readOnly
          />
        </div>
      </div>

      {/* Отъезд */}
      <div className="filter-item">
        <label className="filter-label">Отъезд</label>
        <div 
          className={`filter-input-wrapper ${activeDatePicker === 'checkOut' ? 'active' : ''}`}
          onClick={() => setActiveDatePicker('checkOut')}
        >
          <Calendar size={16} className="filter-icon" />
          <input
            type="text"
            className="filter-input"
            placeholder="ДД.ММ.ГГГГ"
            value={formatDateInput(checkOut)}
            readOnly
          />
        </div>
      </div>

      {/* Календарь по центру */}
      {activeDatePicker && (
        <>
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
        </>
      )}

      {/* Количество человек */}
      <div className="filter-item">
        <label className="filter-label">Количество человек</label>
        <div 
          className="filter-input-wrapper guests-selector"
          onClick={() => setIsGuestsOpen(!isGuestsOpen)}
        >
          <Users size={16} className="filter-icon" />
          <span className="guests-value">{guests}</span>
          <ChevronDown size={16} className={`chevron ${isGuestsOpen ? 'open' : ''}`} />
          
          {isGuestsOpen && (
            <div className="guests-dropdown">
              <div className="guests-control">
                <button 
                  className="guest-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGuestsChange(-1);
                  }}
                >
                  −
                </button>
                <span className="guest-count">{guests}</span>
                <button 
                  className="guest-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGuestsChange(1);
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Выбор типа дома */}
      <div className="cottage-type-selector">
        <label className="filter-label">Выберите дом</label>
        <div className="type-buttons">
          <button
            className={`type-btn ${houseType === 'small' ? 'selected' : ''} ${!isSmallHouseAvailable ? 'disabled' : ''}`}
            onClick={() => isSmallHouseAvailable && setHouseType('small')}
            disabled={!isSmallHouseAvailable}
          >
            <span className="type-btn-title">Малый дом</span>
            <span className="type-btn-value">{smallHousePrice.toLocaleString()} ₽</span>
            <span className="type-btn-details">до 4 человек • {smallHouseCount} дом</span>
          </button>
          
          <button
            className={`type-btn ${houseType === 'big' ? 'selected' : ''} ${!isBigHouseAvailable ? 'disabled' : ''}`}
            onClick={() => isBigHouseAvailable && setHouseType('big')}
            disabled={!isBigHouseAvailable}
          >
            <span className="type-btn-title">Большой дом</span>
            <span className="type-btn-value">{bigHousePrice.toLocaleString()} ₽</span>
            <span className="type-btn-details">до 6 человек • {bigHouseCount} домов</span>
          </button>
        </div>
      </div>


      <Button variant="secondary" size="lg" onClick={handleSearch} disabled={isChecking}>
        Найти варианты
      </Button>
    </div>
  );
};

export default SearchFilters;