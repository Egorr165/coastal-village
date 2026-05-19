import { useState, useEffect } from 'react'; // Убрали useRef
import { Calendar, Users, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchHouses,
  getPriceByType,
  getHouseCountByType
} from '../../services/availabilityService';
import { HouseType, House } from '../../types/house';
import './SearchFilters.scss';
import Button from '../Button/Button';
import { CalendarModal } from '../CalendarModal/CalendarModal';

const SearchFilters = () => {
  const navigate = useNavigate();
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [houseType, setHouseType] = useState<HouseType | null>(null);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [houses, setHouses] = useState<House[]>([]);

  useEffect(() => {
    fetchHouses()
      .then(data => setHouses(data))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = () => {
    if (houseType || checkIn || checkOut) {
      const searchParams = new URLSearchParams();
      
      if (checkIn) searchParams.append('checkIn', checkIn);
      if (checkOut) searchParams.append('checkOut', checkOut);
      if (guests) searchParams.append('guests', guests.toString());
      if (houseType) searchParams.append('type', houseType);
      
      navigate(`/catalog?${searchParams.toString()}`);
    } else {
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

  const isBigHouseAvailable = guests <= 6;
  const isSmallHouseAvailable = guests <= 4;

  const bigHouseCount = getHouseCountByType(houses, 'big');
  const smallHouseCount = getHouseCountByType(houses, 'small');
  const bigHousePrice = getPriceByType(houses, 'big');
  const smallHousePrice = getPriceByType(houses, 'small');

  return (
    <div className="search-filters">
      <h2 className="filters-title">Поиск коттеджей</h2>
      
      <div className="dates-row">
        <div className="filter-item">
          <label className="filter-label">Заезд</label>
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

        <div className="filter-item">
          <label className="filter-label">Выезд</label>
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
      </div>

      <CalendarModal 
        activeDatePicker={activeDatePicker}
        setActiveDatePicker={setActiveDatePicker}
        checkIn={checkIn}
        checkOut={checkOut}
        onDatesChange={(dates) => {
          setCheckIn(dates.checkIn);
          setCheckOut(dates.checkOut);
        }}
        houseType={houseType}
        houses={houses}
      />

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

      <div className="cottage-type-selector">
        <label className="filter-label">Выберите дом</label>
        <div className="type-buttons">
          <button
            className={`type-btn ${houseType === 'small' ? 'selected' : ''} ${!isSmallHouseAvailable ? 'disabled' : ''}`}
            onClick={() => {
              if (!isSmallHouseAvailable) return;
              setHouseType(prev => prev === 'small' ? null : 'small');
            }}
            disabled={!isSmallHouseAvailable}
          >
            <span className="type-btn-title">Малый дом</span>
            <span className="type-btn-value">{smallHousePrice.toLocaleString('ru-RU')} ₽</span>
            <span className="type-btn-details">до 4 человек • {smallHouseCount} дом</span>
          </button>
          
          <button
            className={`type-btn ${houseType === 'big' ? 'selected' : ''} ${!isBigHouseAvailable ? 'disabled' : ''}`}
            onClick={() => {
              if (!isBigHouseAvailable) return;
              setHouseType(prev => prev === 'big' ? null : 'big');
            }}
            disabled={!isBigHouseAvailable}
          >
            <span className="type-btn-title">Большой дом</span>
            <span className="type-btn-value">{bigHousePrice.toLocaleString('ru-RU')} ₽</span>
            <span className="type-btn-details">до 6 человек • {bigHouseCount} домов</span>
          </button>
        </div>
      </div>

      <Button variant="secondary" size="lg" onClick={handleSearch}>
        Найти варианты
      </Button>
    </div>
  );
};

export default SearchFilters;