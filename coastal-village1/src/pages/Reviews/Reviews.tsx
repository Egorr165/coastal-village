import React, { useState } from 'react';
import { Sun, UserCheck, ArrowLeft, ArrowRight, Star, User } from 'lucide-react';
import './Reviews.scss';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import CottageCard from '../../components/CottageCard/CottageCard';

const CustomArrowLeft = ({ size = 20 }) => <ArrowLeft size={size} />;
const CustomArrowRight = ({ size = 20 }) => <ArrowRight size={size} />;
const CustomStar = ({ size = 20, fill = 'none', color = '#E0E0E0' }) => <Star size={size} fill={fill} color={color} strokeWidth={1.5} />;
const CustomUserIcon = ({ size = 20, className = "" }) => <User size={size} className={className} strokeWidth={2} />;


import { fetchHouses } from '../../services/availabilityService';
import type { House } from '../../types/house';

import ContactForm from '../../components/ContactForm/ContactForm';
import Button from '../../components/Button/Button';
import ReviewModal from './components/ReviewModal/ReviewModal';


const Reviews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [houses, setHouses] = useState<House[]>([]);
  const [loadingHouses, setLoadingHouses] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    
    // Загрузка домиков
    fetchHouses()
      .then(data => {
        if (isMounted) {
          setHouses(data);
          setLoadingHouses(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoadingHouses(false);
      });

    // Загрузка одобренных отзывов
    import('../../services/api').then(({ default: api }) => {
      api.get('/api/reviews/')
        .then(res => {
          if (isMounted) {
            const reviewsData = res.data.results || res.data;
            let mappedReviews = reviewsData.map((r: any) => ({
              id: r.id,
              rating: r.rating,
              title: null, 
              authorName: r.user_first_name || r.user_name || 'Гость',
              authorPhoto: r.user_avatar, 
              avatarIcon: <CustomUserIcon size={40} className="avatar-icon" />,
              date: new Date(r.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }),
              text: r.comment
            }));
            
            // Если с бэкенда пусто, подставим хотя бы один отзыв для красоты или оставим пустой массив
            if (mappedReviews.length === 0) {
               mappedReviews = [];
            }
            
            setReviews(mappedReviews);
            setLoadingReviews(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (isMounted) setLoadingReviews(false);
        });
    });

    return () => { isMounted = false; };
  }, []);

  const groupedHouses: Record<string, { house: House, count: number }> = {};
  houses.forEach(house => {
    if (!groupedHouses[house.type]) {
      groupedHouses[house.type] = { house, count: 1 };
    } else {
      groupedHouses[house.type].count++;
    }
  });

  // Hook to handle incoming hash links like #2
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        // Убираем # из строки и пробуем распарсить как число
        const idFromHash = parseInt(hash.replace('#', ''), 10);
        if (!isNaN(idFromHash)) {
          const index = reviews.findIndex(r => r.id === idFromHash);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [reviews]);

  const currentReview = reviews.length > 0 ? reviews[currentIndex] : null;

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const handleAddReview = (rating: number, text: string) => {
    // В ReviewModal уже вызывается API и показывается Alert. 
    // Нам не нужно сразу добавлять в стейт, так как нужна модерация.
    setIsModalOpen(false);
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
              <span className="rating-title">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
                  : "5.0"}
              </span>
            </div>
            <p className="stat-text">Средняя оценка наших гостей</p>
          </div>

          <div className="stat-card pink">
            <div className="stat-big">
              83% из них
              <Sun className="weather-icon text-yellow-500" size={28} />
            </div>
            <p className="stat-sub">возвращаются к нам на следующий год</p>
          </div>

          <div className="stat-card blue">
            <div className="stat-row">
              <span className="stat-big">3 года</span>
              <UserCheck className="user-icon-stat text-pink-500" size={28} color="white" />
            </div>
            <div className="stat-big">200+ гостей</div>
          </div>
        </div>
      </section>

      <section className="reviews-section" id="reviews">
        <div className="container">
          {loadingReviews ? (
            <div className="reviews-section__loading">Загрузка отзывов...</div>
          ) : currentReview ? (
            <>
              <div className="review-header">
                <div className="avatar">
                  {currentReview.authorPhoto ? (
                    <img src={currentReview.authorPhoto} alt="Аватар" className="reviews-section__avatar-img" />
                  ) : (
                    currentReview.avatarIcon || <CustomUserIcon size={40} className="avatar-icon" />
                  )}
                </div>
                <div className="review-info">
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar
                        key={star}
                        size={20}
                        color={star <= currentReview.rating ? '#FFD700' : '#E0E0E0'}
                        fill={star <= currentReview.rating ? '#FFD700' : 'none'}
                      />
                    ))}
                  </div>
                  <p className="review-author">
                    {currentReview.authorName}
                  </p>
                </div>
                <div className="controls">
                  <button aria-label="Предыдущий отзыв" className="nav-arrow" onClick={prevReview}><CustomArrowLeft size={20} /></button>
                  <button aria-label="Следующий отзыв" className="nav-arrow" onClick={nextReview}><CustomArrowRight size={20} /></button>
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
            </>
          ) : (
            <div className="reviews-section__empty">
              <h3>Пока нет подтвержденных отзывов</h3>
              <div className="review-actions reviews-section__empty-actions">
                <Button onClick={() => setIsModalOpen(true)}>Оставить отзыв</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <ContactForm />

      <section className="cottage-section" id="cottages">
        <div className="container">
          <h2 className="section-title">Коттеджи 2-х видов</h2>

          {loadingHouses ? (
            <div className="cottage-section__loading">Загрузка домиков...</div>
          ) : (
            <>
              {groupedHouses['big'] && (
                <CottageCard
                  id={String(groupedHouses['big'].house.id)}
                  title="6-местный коттедж"
                  capacity={groupedHouses['big'].house.capacity || 6}
                  area={75}
                  houseCount={groupedHouses['big'].count}
                  price={groupedHouses['big'].house.pricePerNight}
                  images={groupedHouses['big'].house.images?.length ? groupedHouses['big'].house.images : ['https://placehold.co/800x600?text=ФОТО+ИЗ+АДМИНКИ']}
                />
              )}

              {groupedHouses['small'] && (
                <CottageCard
                  id={String(groupedHouses['small'].house.id)}
                  title="4-местный коттедж"
                  capacity={groupedHouses['small'].house.capacity || 4}
                  area={36}
                  houseCount={groupedHouses['small'].count}
                  price={groupedHouses['small'].house.pricePerNight}
                  images={groupedHouses['small'].house.images?.length ? groupedHouses['small'].house.images : ['https://placehold.co/800x600?text=ФОТО+ИЗ+АДМИНКИ']}
                  isReversed={true}
                />
              )}
            </>
          )}
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