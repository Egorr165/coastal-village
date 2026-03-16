import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BedSingle, Home, Layout, Coffee, Tv, Wind } from 'lucide-react';
import {
  calculateStayPrice,
  findNearestAvailableDate,
  getAvailableHouseTypes,
  getFirstAvailableHouse,
} from '../../services/availabilityService';
import './Catalog.scss';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import CatalogCard from './components/CatalogCard/CatalogCard';

import CatalogFilters from './components/CatalogFilters/CatalogFilters';
import CatalogMap from './components/CatalogMap/CatalogMap';

const Catalog = () => {
  const [searchParams] = useSearchParams();

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'big' | 'small' | null>(null);

  // Загружаем параметры из URL при монтировании
  useEffect(() => {
    const urlCheckIn = searchParams.get('checkIn');
    const urlCheckOut = searchParams.get('checkOut');
    const urlType = searchParams.get('type') as 'big' | 'small' | null;

    if (urlCheckIn) setStartDate(urlCheckIn);
    if (urlCheckOut) setEndDate(urlCheckOut);
    if (urlType) setSelectedType(urlType);
  }, [searchParams]);

  const availableTypes = getAvailableHouseTypes(startDate as string | null, endDate as string | null);
  const hasSelectedDates = Boolean(startDate && endDate);
  const bigStayPrice =
    hasSelectedDates && startDate && endDate
      ? calculateStayPrice(14000, startDate, endDate)
      : null;
  const smallStayPrice =
    hasSelectedDates && startDate && endDate
      ? calculateStayPrice(10000, startDate, endDate)
      : null;

  // Показывать только выбранный тип дома
  const showBigHouse = selectedType === 'big';
  const showSmallHouse = selectedType === 'small';
  const showAllHouses = !selectedType;

  const shouldShowBigHouse = (showAllHouses || showBigHouse) && (!hasSelectedDates || availableTypes.includes('big'));
  const shouldShowSmallHouse = (showAllHouses || showSmallHouse) && (!hasSelectedDates || availableTypes.includes('small'));

  const hasAvailableHouses = (showAllHouses && availableTypes.length > 0) ||
    (selectedType && availableTypes.includes(selectedType));

  const hasNoAvailableTypes = hasSelectedDates && availableTypes.length === 0;
  const nearestBigDate = hasNoAvailableTypes
    ? findNearestAvailableDate('big')
    : null;
  const nearestSmallDate = hasNoAvailableTypes
    ? findNearestAvailableDate('small')
    : null;

  const assignedBigHouse = hasSelectedDates && startDate && endDate 
    ? getFirstAvailableHouse('big', startDate, endDate) 
    : null;
  const assignedSmallHouse = hasSelectedDates && startDate && endDate 
    ? getFirstAvailableHouse('small', startDate, endDate) 
    : null;

  return (
    <div className="catalog">
      <Header />

      <CatalogFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      <main className="catalog__main">
        <div className="catalog__container">
          <div className="catalog__grid">
            <div className="catalog__list">
              {!hasAvailableHouses && (
                <div className="catalog__no-results">
                  <p className="catalog__no-results-title">
                    На выбранные даты все коттеджи заняты
                  </p>
                  <p className="catalog__no-results-text">
                    Ближайшая дата для 6-местного дома:{' '}
                    {nearestBigDate ?? 'нет доступных дат'}
                  </p>
                  <p className="catalog__no-results-text">
                    Ближайшая дата для 4-местного дома:{' '}
                    {nearestSmallDate ?? 'нет доступных дат'}
                  </p>
                </div>
              )}

              {shouldShowBigHouse && (
                <CatalogCard
                  id={assignedBigHouse ? assignedBigHouse.id : "house-big-1"}
                  title="6-местный"
                  capacity={6}
                  features={[
                    { icon: <BedSingle size={18} />, text: '2 спальни' },
                    { icon: <Home size={18} />, text: '2 Этажа' },
                    { icon: <Layout size={18} />, text: 'Балкон' },
                    { icon: <Coffee size={18} />, text: 'Кухня' }
                  ]}
                  pricePerNight={14000}
                  images={['https://picsum.photos/400/300?random=1']}
                  checkIn={hasSelectedDates ? startDate : null}
                  checkOut={hasSelectedDates ? endDate : null}
                  totalPrice={bigStayPrice}
                />
              )}

              {shouldShowSmallHouse && (
                <CatalogCard
                  id={assignedSmallHouse ? assignedSmallHouse.id : "house-small-1"}
                  title="4-местный"
                  capacity={4}
                  features={[
                    { icon: <BedSingle size={18} />, text: '1 спальня' },
                    { icon: <Home size={18} />, text: '2 этажа' },
                    { icon: <Tv size={18} />, text: 'Телевизор' },
                    { icon: <Wind size={18} />, text: 'Кондиционер' }
                  ]}
                  pricePerNight={10000}
                  images={['https://picsum.photos/400/300?random=2']}
                  checkIn={hasSelectedDates ? startDate : null}
                  checkOut={hasSelectedDates ? endDate : null}
                  totalPrice={smallStayPrice}
                />
              )}
            </div>

            <CatalogMap />
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;