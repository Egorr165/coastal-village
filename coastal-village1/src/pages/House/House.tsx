import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { fetchHouses, getFirstAvailableHouse } from '../../services/availabilityService';
import bookingService from '../../services/bookingService';
import type { House as HouseType } from '../../types/house';
import './House.scss';

import { useToastStore } from '../../store/useToastStore';

// Layout and Common Components
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ContactForm from '../../components/ContactForm/ContactForm';
import Reviews from '../Home/components/Reviews/Reviews';
import BookingCalendar from '../../components/BookingCalendar/BookingCalendar';
// House Page Specific Components
import BookingConfirmationModal, { BookingDetails } from '../../components/BookingConfirmationModal/BookingConfirmationModal';
import HouseGallery from './components/HouseGallery/HouseGallery';
import FullscreenGalleryModal from './components/FullscreenGalleryModal/FullscreenGalleryModal';
import TransportOptions from './components/TransportOptions/TransportOptions';
import AmenitiesList from './components/AmenitiesList/AmenitiesList';
import HouseConditions from './components/HouseConditions/HouseConditions';
import HouseDescription from './components/HouseDescription/HouseDescription';
import HouseMap from './components/HouseMap/HouseMap';

// Фолбэк изображение, если у домика нет фото
const fallbackImage = "https://picsum.photos/seed/house/800/600";

const House = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useToastStore(state => state.addToast);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBookingDetails, setModalBookingDetails] = useState<BookingDetails | null>(null);
  const [orderNumber, setOrderNumber] = useState(0);

  const [house, setHouse] = useState<HouseType | null>(null);
  const [allHouses, setAllHouses] = useState<HouseType[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    fetchHouses()
      .then(data => {
        if (!isMounted) return;
        setAllHouses(data);
        const found = data.find((h: HouseType) => String(h.id) === String(id));
        setHouse(found || null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [id]);

  React.useEffect(() => {
    if (user) {
      const pendingDataStr = sessionStorage.getItem('pendingBookingDetails');
      if (pendingDataStr) {
        try {
          const pendingData = JSON.parse(pendingDataStr);
          setModalBookingDetails(pendingData);
          bookingService.getNextBookingId().then(id => setOrderNumber(id)).catch(() => setOrderNumber(Math.floor(1000 + Math.random() * 9000)));
          setIsModalOpen(true);
        } catch (e) {
          console.error('Ошибка при восстановлении брони', e);
        }
        sessionStorage.removeItem('pendingBookingDetails');
      }
    }
  }, [user]);

  const urlCheckIn = searchParams.get('checkIn');
  const urlCheckOut = searchParams.get('checkOut');

  const handleBookClick = async (details: BookingDetails) => {
    setModalBookingDetails(details);
    try {
        const nextId = await bookingService.getNextBookingId();
        setOrderNumber(nextId);
    } catch {
        setOrderNumber(Math.floor(1000 + Math.random() * 9000));
    }
    setIsModalOpen(true);
  };

  const handleConfirmOrder = async (finalData?: any) => {
    if (!house || !modalBookingDetails) return;

    // Находим реальный свободный домик нужного типа на эти конкретные даты
    const availableHouse = getFirstAvailableHouse(
      allHouses, 
      house.type as 'big' | 'small', 
      modalBookingDetails.checkIn, 
      modalBookingDetails.checkOut
    );

    if (!availableHouse) {
      addToast('К сожалению, на выбранные даты все домики такого типа уже заняты.', 'error');
      return;
    }

    try {
      const payload = {
        cottage: Number(availableHouse.id),
        check_in_date: modalBookingDetails.checkIn,
        check_out_date: modalBookingDetails.checkOut,
        guests_count: house.type === 'big' ? 6 : 4,
        extra_bed_count: modalBookingDetails.extras.extraBed ? 1 : 0,
        special_requests: finalData ? `Данные гостя: ${finalData.name}, Тел: ${finalData.phone}, Email: ${finalData.email}` : ''
      };

      await bookingService.createBooking(payload);
      
      addToast('Заявка успешно принята! Ожидайте звонка менеджера в течение 15 минут для уточнения деталей.', 'success');
      setIsModalOpen(false);
      navigate('/account'); // Перенаправляем в личный кабинет
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Проверьте авторизацию';
      addToast(`Ошибка: ${errorMsg}`, 'error');
    }
  };

  const personalData = user ? {
    name: user.name || '',
    phone: user.phone || '',
    email: user.email || ''
  } : null;



  if (loading) {
    return (
      <div className="app house-page">
        <Header />
        <main className="main-content house-page__loading">
          <h2>Загрузка...</h2>
        </main>
        <Footer />
      </div>
    );
  }

  if (!house) {
    return (
      <div className="app house-page">
        <Header />
        <main className="main-content not-found">
          <h2>Дом не найден</h2>
          <p>Запрошенный дом не существует или был удален</p>
          <button onClick={() => window.history.back()} className="back-btn">
            Вернуться назад
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const hasSpecificHouse = urlCheckIn && urlCheckOut;
  const baseTitle = house.type === 'big' ? '6-ти местный' : '4-х местный';

  // Используем ТОЛЬКО изображения из базы данных, либо фолбэк
  const mainGalleryImages = house.images && house.images.length > 0 
    ? house.images 
    : [fallbackImage];

  return (
    <div className="app house-page">
      <Header />

      <main className="main-content">
        <div className="house-layout container">
          <div className="house-layout__left">
            <HouseGallery
              houseTitle={`${baseTitle} коттедж`}
              mainGalleryImages={mainGalleryImages}
              yardImages={[]}
              beachImages={[]}
              currentHouseImages={mainGalleryImages}
              onOpenFullscreen={(index) => setFullScreenImageIndex(index)}
              capacity={house.capacity}
              bedrooms={house.bedrooms || 2}
              area={house.area || 75}
              houseType={house.type as 'big' | 'small'}
            />

            <section className="property-details">
              <HouseConditions />
              <TransportOptions />
            </section>
          </div>

          <div className="house-layout__right">
            <div className="sticky-sidebar">
              <div className="sidebar-header-titles">
                <div className="sidebar-titles">
                  <h1 className="house-main-title">
                    {baseTitle} {hasSpecificHouse ? <span className="house-number-badge">{house.title}</span> : 'коттедж'}
                  </h1>
                </div>
                <button className="share-btn" title="Поделиться">
                  <Share2 size={24} strokeWidth={1.5} color="var(--color-primary)" className="share-btn__icon" />
                </button>
              </div>
              <AmenitiesList />
              
              <HouseDescription description={house.description} />

              <BookingCalendar
                houseId={String(house.id)}
                houseTitle={house.title}
                houseType={house.type as 'big' | 'small'}
                pricePerNight={house.pricePerNight}
                houses={allHouses}
                initialCheckIn={urlCheckIn}
                initialCheckOut={urlCheckOut}
                checkInTime="14:00"
                checkOutTime="12:00"
                onBookClick={handleBookClick}
              />
            </div>
          </div>
        </div>

        <section className="bottom-sections container">
          <HouseMap />
        </section>
        
        <ContactForm />
        <Reviews />

        <BookingConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmOrder}
          bookingDetails={modalBookingDetails}
          personalData={personalData}
          orderNumber={orderNumber}
        />
      </main>

      <Footer />

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