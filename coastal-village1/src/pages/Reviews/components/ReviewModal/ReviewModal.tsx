import React, { useState } from 'react';
import { X, Star, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../features/auth/AuthContext';
import Button from '../../../../components/Button/Button';
import api from '../../../../services/api';
import { useToastStore } from '../../../../store/useToastStore';
import './ReviewModal.scss';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview?: (rating: number, text: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmitReview }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      addToast('Пожалуйста, выберите оценку', 'error');
      return;
    }
    if (!reviewText.trim()) {
      addToast('Пожалуйста, напишите отзыв', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Здесь вызывается новый апи создания отзыва
      await api.post('/api/reviews/', { rating, comment: reviewText });
      
      addToast('Ваш отзыв добавится в течение 10 минут', 'success');
      
      if (onSubmitReview) {
        // Мы можем передать его наверх, чтобы он сразу обновил UI, если нужно, или просто закрыть окно
        onSubmitReview(rating, reviewText);
      }
      
      // Сбросить форму
      onClose();
      setRating(0);
      setReviewText('');
    } catch (err) {
      console.error(err);
      addToast('Произошла ошибка при отправке отзыва.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {!isAuthenticated ? (
          <div className="review-modal-auth">
            <h3 className="review-modal-title">Необходимо войти</h3>
            <p className="review-modal-desc">
              Чтобы оставить отзыв, пожалуйста, войдите в свой аккаунт или зарегистрируйтесь.
            </p>
            <Button 
              fullWidth 
              onClick={() => {
                onClose();
                navigate('/login');
              }}
            >
              Войти в профиль
            </Button>
          </div>
        ) : (
          <div className="review-modal-form-container">
            <h3 className="review-modal-title">Оставить отзыв</h3>
            
            <div className="review-modal-user">
              <div className="review-modal-avatar">
                {user?.photo ? (
                  <img src={user.photo} alt={user.name} />
                ) : (
                  <UserIcon size={24} />
                )}
              </div>
              <div className="review-modal-user-info">
                <span className="review-modal-name">{user?.name}</span>
                <span className="review-modal-email">{user?.email}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="review-modal-form">
              <div className="review-modal-rating">
                <p>Ваша оценка</p>
                <div className="stars-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={28}
                      className={star <= (hoverRating || rating) ? 'star-filled' : 'star-empty'}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>

              <div className="review-modal-textarea-wrapper">
                <textarea
                  className="review-modal-textarea"
                  placeholder="Поделитесь своими впечатлениями об отдыхе..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={5}
                />
              </div>

              <Button type="submit" fullWidth>Отправить отзыв</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
