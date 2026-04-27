import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import './AccountReviews.scss';
import { Star } from 'lucide-react';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const AccountReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('/api/reviews/my_reviews/');
        setReviews(response.data);
      } catch (error) {
        console.error('Ошибка при получении отзывов', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return <div className="account-reviews__loading">Загрузка отзывов...</div>;
  }

  return (
    <div className="account-reviews">
      <div className="account-card">
        {reviews.length === 0 ? (
          <p className="account-reviews__empty">У вас пока нет одобренных отзывов.</p>
        ) : (
          <div className="account-reviews__list">
            {reviews.map((review) => (
              <div key={review.id} className="account-review-item">
                <div className="account-review-item__header">
                  <div className="account-review-item__stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating ? 'star-filled' : 'star-empty'}
                        color={star <= review.rating ? '#FFD700' : '#E0E0E0'}
                        fill={star <= review.rating ? '#FFD700' : 'none'}
                      />
                    ))}
                  </div>
                  <div className="account-review-item__date">
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <p className="account-review-item__comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountReviews;
