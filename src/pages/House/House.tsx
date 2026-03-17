import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { houses } from '../../data/houses';
import './House.scss';

// Layout and Common Components
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import TransportModal from '../../components/TransportModal/TransportModal';
import type { TransportType } from '../../components/TransportModal/TransportModal';
import ContactForm from '../../components/ContactForm/ContactForm';
import Reviews from '../Home/components/Reviews/Reviews';
import BookingCalendar from '../../components/BookingCalendar/BookingCalendar';

// House Page Specific Components
import HouseGallery from './components/HouseGallery/HouseGallery';
import FullscreenGalleryModal from './components/FullscreenGalleryModal/FullscreenGalleryModal';
import PropertySummary from './components/PropertySummary/PropertySummary';
import HouseInfo from './components/HouseInfo/HouseInfo';
import TransportOptions from './components/TransportOptions/TransportOptions';
import AmenitiesList from './components/AmenitiesList/AmenitiesList';
import HouseConditions from './components/HouseConditions/HouseConditions';
import HouseDescription from './components/HouseDescription/HouseDescription';
import HouseMap from './components/HouseMap/HouseMap';

// Import images correctly. If they are missing, consider adding placeholders or copying them manually.
const yardModules = import.meta.glob<{ default: string }>('../../images/house/yard-house/*.{jpg,jpeg,png,webp}', { eager: true });
const yardImages = Object.values(yardModules).map(mod => mod.default);

const beachModules = import.meta.glob<{ default: string }>('../../images/house/beach/*.{jpg,jpeg,png,webp}', { eager: true });
const beachImages = Object.values(beachModules).map(mod => mod.default);

const bigHouseModules = import.meta.glob<{ default: string }>('../../images/house/big-house/*.{jpg,jpeg,png,webp}', { eager: true });
const bigHouseImages = Object.values(bigHouseModules).map(mod => mod.default);

const smallHouseModules = import.meta.glob<{ default: string }>('../../images/house/smoll-house/*.{jpg,jpeg,png,webp}', { eager: true });
const smallHouseImages = Object.values(smallHouseModules).map(mod => mod.default);

const House = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [modalType, setModalType] = useState<TransportType>(null);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState<number | null>(null);

  const handleTransportClick = (type: TransportType) => {
    setModalType(type);
  };

  const closeTransportModal = () => {
    setModalType(null);
  };

  const house = houses.find(h => h.id === id);

  const urlCheckIn = searchParams.get('checkIn');
  const urlCheckOut = searchParams.get('checkOut');

  if (!house) {
    return (
      <div className="app house-page">
        <Header />
        <main className="main-content not-found">
          <h2>Дом не найден</h2>
          <p>Запрошенный дом не существует или был удален</p>
          <button onClick={() => window.history.back()} className="back-btn">
            Вернуться назад
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const houseTitle = house.type === 'big' ? '6-ти местный коттедж' : '4-х местный коттедж';
  const parts = house.id.split('-');
  const houseNumber = parts[parts.length - 1];
  const assignedName = urlCheckIn && urlCheckOut ? `КОТТЕДЖ №${houseNumber}` : null;

  const currentHouseImages = house.type === 'big' ? bigHouseImages : smallHouseImages;
  const mainGalleryImages = [...yardImages, ...currentHouseImages, ...beachImages];

  return (
    <div className="app house-page">
      <Header />

      <main className="main-content">
        <HouseGallery
          houseTitle={houseTitle}
          assignedName={assignedName}
          mainGalleryImages={mainGalleryImages}
          yardImages={yardImages}
          beachImages={beachImages}
          currentHouseImages={currentHouseImages}
          onOpenFullscreen={(index) => setFullScreenImageIndex(index)}
        />

        <div className="content-grid container">
          <div className="left-column">
            <section className="property-details">
              <PropertySummary 
                area={/*house.area || */ 75} 
                capacity={house.capacity} 
                bedrooms={/*house.bedrooms || */ 2} 
                type={house.type as 'big' | 'small'} 
              />
              <HouseInfo />
              <TransportOptions onSelect={handleTransportClick} />
              <AmenitiesList />
              <HouseConditions />
            </section>
          </div>

          <div className="right-column">
            <BookingCalendar
              houseId={house.id}
              houseType={house.type}
              pricePerNight={house.pricePerNight}
              bookedRanges={house.bookedRanges}
              initialCheckIn={urlCheckIn}
              initialCheckOut={urlCheckOut}
              checkInTime="14:00"
              checkOutTime="12:00"
              deposit={2000}
            />
          </div>
        </div>

        <section className="bottom-sections container">
          <HouseDescription description={/*house.description*/ "Прекрасный дом!"} />
          <HouseMap />
        </section>
        
        <ContactForm />
        <Reviews />
      </main>

      <Footer />
      
      <TransportModal 
        isOpen={modalType !== null} 
        onClose={closeTransportModal} 
        type={modalType} 
      />

      {fullScreenImageIndex !== null && (
        <FullscreenGalleryModal
          images={mainGalleryImages}
          currentIndex={fullScreenImageIndex}
          onClose={() => setFullScreenImageIndex(null)}
          onNavigate={(index) => setFullScreenImageIndex(index)}
        />
      )}
    </div>
  );
};

export default House;
