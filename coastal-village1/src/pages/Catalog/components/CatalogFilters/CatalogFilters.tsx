import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CalendarModal } from '../../../../components/CalendarModal/CalendarModal';
import './CatalogFilters.scss';

interface CatalogFiltersProps {
  startDate: string | null;
  setStartDate: (date: string | null) => void;
  endDate: string | null;
  setEndDate: (date: string | null) => void;
  selectedType: 'big' | 'small' | null;
  setSelectedType: (type: 'big' | 'small' | null) => void;
  houses: import('../../../../types/house').House[];
}

const CatalogFilters = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedType,
  setSelectedType,
  houses,
}: CatalogFiltersProps) => {
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.catalog-filters__guests-wrapper')) {
        setIsGuestsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateInput = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
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
                    className={`catalog-filters__date-input-fake catalog-filters__date-input-btn ${endDate ? 'selected' : ''}`} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDatePicker(activeDatePicker ? null : 'checkOut');
                    }}
                  >
                    {endDate ? formatDateInput(endDate) : 'Отъезд'}
                  </button>
                </div>
              </div>

              <button className="catalog-filters__search-btn">
                Найти
              </button>

              <div className="catalog-filters__guests-wrapper">
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
            <button className="catalog-filters__reset" onClick={() => { setStartDate(null); setEndDate(null); setSelectedType(null); }}>
              Сбросить
            </button>

            <CalendarModal 
              activeDatePicker={activeDatePicker}
              setActiveDatePicker={setActiveDatePicker}
              checkIn={startDate || ''}
              checkOut={endDate || ''}
              onDatesChange={(dates) => {
                setStartDate(dates.checkIn);
                setEndDate(dates.checkOut || null);
              }}
              houseType={selectedType}
              houses={houses}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CatalogFilters;
