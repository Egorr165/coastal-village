import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  UserCheck,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import './Reviews.scss';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import CottageCard from '../../components/CottageCard/CottageCard';


import ContactForm from '../../components/ContactForm/ContactForm';
import Button from '../../components/Button/Button';
import ReviewModal from './components/ReviewModal/ReviewModal';

const bigHouseModules = import.meta.glob<{ default: string }>('../../images/house/big-house/*.{jpg,jpeg,png,webp}', { eager: true });
const bigGallery = Object.values(bigHouseModules).map(mod => mod.default);

const smallHouseModules = import.meta.glob<{ default: string }>('../../images/house/smoll-house/*.{jpg,jpeg,png,webp}', { eager: true });
const smallGallery = Object.values(smallHouseModules).map(mod => mod.default);

import { reviewsData } from '../../data/reviews';
import type { ReviewType } from '../../data/reviews';

const Reviews = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<ReviewType[]>(reviewsData);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Hook to handle incoming hash links like #2
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        // Убираем # из строки и пробуем распарсить как число
        const idFromHash = parseInt(hash.replace('#', ''), 10);
        if (!isNaN(idFromHash)) {
          const index = reviews.findIndex(r => r.id === idFromHash);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        }
      }
    };

    // Вызываем проверку сразу при монтировании компонента (заход по ссылке первый раз)
    handleHashChange();

    // Также вешаем слушатель на случай, если пользователь кликнет ссылку, находясь уже на странице
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [reviews]);

  const currentReview = reviews[currentIndex];

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const handleAddReview = (rating: number, text: string) => {
    const newReview: ReviewType = {
      id: Date.now(),
      title: rating === 5 ? 'Отличный отдых!' : rating >= 4 ? 'Хорошее место' : 'Мой отзыв',
      authorName: user?.name || 'Гость',
      authorPhoto: user?.photo,
      avatarIcon: <UserIcon size={40} className="avatar-icon" />,
      date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      text: text
    };

    setReviews([newReview, ...reviews]);
    setCurrentIndex(0); // сразу показываем новый отзыв
    setIsModalOpen(false);

    // Даем пользователю понять, что отзыв сохранён
    alert('Ваш отзыв успешно сохранен и добавлен в список!');
  };

  return (
    <div className="app">
      <Header />

      <section className="hero-section">
        <div className="container hero-content">
          <h1 className="hero-title">Истории наших<br />гостей</h1>
        </div>

        <div className="stats-bar">
          <div className="stat-card black">
            <div>
              <span className="stars">★★★★★</span>
              <span className="rating-title">5.0</span>
            </div>
            <p className="stat-text">Если верить Яндекс.Картам</p>
          </div>

          <div className="stat-card pink">
            <div className="stat-big">
              83% из них
              <Sun className="weather-icon" />
            </div>
            <p className="stat-sub">возвращаются к нам на следующий год</p>
          </div>

          <div className="stat-card blue">
            <div className="stat-row">
              <span className="stat-big">5 лет</span>
              <UserCheck className="user-icon-stat" />
            </div>
            <div className="stat-big">400+ гостей</div>
          </div>
        </div>
      </section>

      <section className="reviews-section" id="reviews">
        <div className="container">
          <div className="review-header">
            <div className="avatar">
              {currentReview.authorPhoto ? (
                <img src={currentReview.authorPhoto} alt="Аватар" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                currentReview.avatarIcon || <UserIcon size={40} className="avatar-icon" />
              )}
            </div>
            <div className="review-info">
              <h2 className="review-title">{currentReview.title}</h2>
              <p className="review-author">{currentReview.authorName}</p>
            </div>
            <div className="controls">
              <button className="nav-arrow" onClick={prevReview}><ArrowLeft size={20} /></button>
              <button className="nav-arrow" onClick={nextReview}><ArrowRight size={20} /></button>
            </div>
          </div>

          <div className="review-body">
            <p className="review-text">
              <span className="date">{currentReview.date}</span>
              {currentReview.text}
            </p>
            <div className="review-actions">
              <Button onClick={() => setIsModalOpen(true)}>Оставить отзыв</Button>
            </div>
          </div>
        </div>
      </section>

      <ContactForm />

      <section className="cottage-section" id="cottages">
        <div className="container">
          <h2 className="section-title">Коттеджи 2-х видов</h2>

          <CottageCard
            id="house-big-1"
            title="6-местный коттедж"
            capacity={6}
            area={75}
            houseCount={6}
            price={13000}
            images={bigGallery}
          />

          <CottageCard
            id="house-small-1"
            title="4-местный коттедж"
            capacity={4}
            area={36}
            houseCount={1}
            price={10000}
            images={smallGallery}
            isReversed={true}
          />
        </div>
      </section>

      <Footer />

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitReview={handleAddReview}
      />
    </div>
  );
};

export default Reviews;