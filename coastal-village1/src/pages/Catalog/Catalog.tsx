import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BedSingle, Home, Layout, Coffee, Tv, Wind } from 'lucide-react';
import {
  calculateStayPrice,
  findNearestAvailableDate,
  getAvailableHouseTypes,
  isHouseAvailable,
  fetchHouses
} from '../../services/availabilityService';
import type { House } from '../../types/house';
import './Catalog.scss';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import CatalogCard from './components/CatalogCard/CatalogCard';

import CatalogFilters from './components/CatalogFilters/CatalogFilters';
import CatalogMap from './components/CatalogMap/CatalogMap';
import { Helmet } from 'react-helmet-async';

const defaultPlaceholder = 'https://placehold.co/800x600?text=ФОТО+ИЗ+АДМИНКИ';

const Catalog = () => {
  const [searchParams] = useSearchParams();

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'big' | 'small' | null>(null);

  useEffect(() => {
    const urlCheckIn = searchParams.get('checkIn');
    const urlCheckOut = searchParams.get('checkOut');
    const urlType = searchParams.get('type') as 'big' | 'small' | null;

    if (urlCheckIn) setStartDate(urlCheckIn);
    if (urlCheckOut) setEndDate(urlCheckOut);
    if (urlType) setSelectedType(urlType);
  }, [searchParams]);

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHouses()
      .then(data => { setHouses(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const availableTypes = getAvailableHouseTypes(houses, startDate as string | null, endDate as string | null);
  const hasSelectedDates = Boolean(startDate && endDate);

  const filteredHouses = houses.filter(house => {
    const matchesType = !selectedType || house.type === selectedType;
    const isAvailable = !hasSelectedDates || (startDate && endDate && isHouseAvailable(house, startDate, endDate));
    return matchesType && isAvailable;
  });

  const groupedHouses: Record<string, House> = {};
  filteredHouses.forEach(house => {
    if (!groupedHouses[house.type]) {
      groupedHouses[house.type] = house;
    }
  });
  const typesToRender = Object.values(groupedHouses);

  const hasAvailableHouses = typesToRender.length > 0;

  const hasNoAvailableTypes = hasSelectedDates && availableTypes.length === 0;
  const nearestBigDate = hasNoAvailableTypes
    ? findNearestAvailableDate(houses, 'big')
    : null;
  const nearestSmallDate = hasNoAvailableTypes
    ? findNearestAvailableDate(houses, 'small')
    : null;

  if (loading) return <div className="catalog__loading">Загрузка домиков...</div>;

  const catalogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://7continent-dagestan.ru/house/15"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "url": "https://7continent-dagestan.ru/house/16"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "url": "https://7continent-dagestan.ru/house/18"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "url": "https://7continent-dagestan.ru/house/19"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "url": "https://7continent-dagestan.ru/house/20"
      },
      {
        "@type": "ListItem",
        "position": 6,
        "url": "https://7continent-dagestan.ru/house/21"
      }
    ]
  };

  return (
    <div className="catalog">

      <Helmet>
        <title>Снять коттедж в Дагестане у моря — Цены и фото домиков | 7 Континент</title>
        <meta 
          name="description" 
          content="Выберите идеальный домик для отдыха на Каспийском море. В нашем каталоге — коттеджи разной вместимости со всеми удобствами. Честные цены, отзывы и фото." 
        />

        <script type="application/ld+json">
          {JSON.stringify(catalogSchema)}
        </script>
      </Helmet>

      <Header />

      <CatalogFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        houses={houses}
      />

      <main className="catalog__main">
        <div className="catalog__container">
          <div className="catalog__grid">
            <div className="catalog__list">
              {!hasAvailableHouses && (
                <div className="catalog__no-results">
                  <p className="catalog__no-results-title">
                    К сожалению на выбранные даты все коттеджи этого типа заняты.
                  </p>
                </div>
              )}

              {hasAvailableHouses && typesToRender.map(house => {
                  const gallery = house.images && house.images.length > 0 
                    ? house.images 
                    : [defaultPlaceholder];
                  
                  const stayPrice = hasSelectedDates && startDate && endDate
                    ? calculateStayPrice(house.pricePerNight, startDate, endDate)
                    : null;

                  const features = [
                    { icon: <BedSingle size={18} />, text: `${house.bedrooms || (house.type === 'big' ? 2 : 1)} спальн${house.bedrooms === 1 ? 'я' : 'и'}` },
                    { icon: <Home size={18} />, text: '2 этажа' }
                  ];

                  if (house.type === 'big') {
                    features.push(
                      { icon: <Layout size={18} />, text: 'Балкон' },
                      { icon: <Coffee size={18} />, text: 'Кухня' }
                    );
                  } else {
                    features.push(
                      { icon: <Tv size={18} />, text: 'Телевизор' },
                      { icon: <Wind size={18} />, text: 'Кондиционер' }
                    );
                  }

                  return (
                    <CatalogCard
                      key={house.id}
                      id={String(house.id)}
                      title={house.type === 'big' ? '6-местный коттедж' : '4-местный коттедж'}
                      capacity={house.capacity || (house.type === 'big' ? 6 : 4)}
                      features={features}
                      pricePerNight={house.pricePerNight}
                      images={gallery}
                      checkIn={hasSelectedDates ? startDate : null}
                      checkOut={hasSelectedDates ? endDate : null}
                      totalPrice={stayPrice}
                    />
                  );
                })}
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