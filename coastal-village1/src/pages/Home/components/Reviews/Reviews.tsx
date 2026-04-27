import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../../../components/Button/Button';
import api from '../../../../services/api';
import './Reviews.scss';

const Reviews = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(window.innerWidth >= 768 ? 2 : 1);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(window.innerWidth >= 768 ? 2 : 1);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let isMounted = true;
        api.get('/api/reviews/')
            .then(res => {
                if (isMounted) {
                    const reviewsData = res.data.results || res.data;
                    // Берем до 10 последних отзывов для карусели
                    const latestReviews = reviewsData.slice(0, 10).map((r: any) => ({
                        id: r.id,
                        rating: r.rating,
                        name: r.user_first_name || r.user_name || 'Гость',
                        avatar: r.user_avatar,
                        date: new Date(r.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }),
                        text: r.comment
                    }));
                    setReviews(latestReviews);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error('Ошибка при загрузке отзывов', err);
                if (isMounted) setLoading(false);
            });
            
        return () => { isMounted = false; };
        return () => { isMounted = false; };
    }, []);

    const maxIndex = Math.max(0, reviews.length - itemsPerView);

    const handlePrev = () => {
        if (reviews.length === 0) return;
        setCurrentIndex(prev => (prev === 0 ? maxIndex : prev - 1));
    };

    const handleNext = () => {
        if (reviews.length === 0) return;
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    };

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrev();
        }
    };

    return (
        <section id="reviews" className="reviews">
            <div className="container">
                <div className="reviews__header">
                    <h2 className="reviews__title">Отзывы</h2>
                    
                    <div className="reviews__controls">
                        <Button variant="secondary" size="lg" onClick={() => navigate('/reviews')}>Смотреть все</Button>
                    </div>
                </div>

                {loading ? (
                    <div className="reviews__loading">Загрузка отзывов...</div>
                ) : reviews.length === 0 ? (
                    <div className="reviews__empty">Пока нет подтвержденных отзывов</div>
                ) : (
                    <div className="reviews__carousel-container">
                        <button 
                            className="reviews__arrow reviews__arrow--prev" 
                            onClick={handlePrev} 
                            disabled={reviews.length === 0}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div 
                            className="reviews__slider-wrapper"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                        <div 
                            className="reviews__slider-track" 
                            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
                        >
                            {reviews.map((review) => (
                                <div key={review.id} className="reviews__slide">
                                    <div className="reviews__card">
                                        <Quote className="reviews__quote-icon" size={40} />
                                        <div className="reviews__card-header">
                                            {review.avatar ? (
                                                <img src={review.avatar} alt={review.name} className="reviews__avatar" />
                                            ) : (
                                                <div className="reviews__avatar reviews__avatar--placeholder">
                                                    <User size={32} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="reviews__date">{review.date}</p>
                                                <h3 className="reviews__name">{review.name}</h3>
                                            </div>
                                        </div>
                                        <div className="reviews__stars-container">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    color={star <= review.rating ? '#FFD700' : '#E0E0E0'}
                                                    fill={star <= review.rating ? '#FFD700' : 'none'}
                                                />
                                            ))}
                                        </div>
                                        <p className="reviews__text">{review.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        className="reviews__arrow reviews__arrow--next" 
                        onClick={handleNext} 
                        disabled={reviews.length === 0}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
                )}

                {/* Выводим кнопку внизу только для мобилок */}
                {!loading && reviews.length > 0 && (
                    <div className="reviews__mobile-btn-container">
                        <Button variant="secondary" onClick={() => navigate('/reviews')} className="reviews__btn-full">
                            СМОТРЕТЬ ВСЕ ОТЗЫВЫ
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Reviews;
