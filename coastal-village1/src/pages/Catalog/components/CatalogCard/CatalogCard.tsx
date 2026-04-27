import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import './CatalogCard.scss';

export interface CatalogCardFeature {
  icon: React.ReactNode;
  text: string;
}

export interface CatalogCardProps {
  id: string;
  title: string;
  capacity: number;
  features: CatalogCardFeature[];
  pricePerNight: number;
  images: string[];
  checkIn?: string | null;
  checkOut?: string | null;
  totalPrice?: number | null;
}

const CatalogCard: React.FC<CatalogCardProps> = ({
  id,
  title,
  capacity,
  features,
  pricePerNight,
  images,
  checkIn,
  checkOut,
  totalPrice,
}) => {
  const navigate = useNavigate();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNavigate = () => {
    let url = `/house/${id}`;
    if (checkIn && checkOut) {
      url += `?checkIn=${checkIn}&checkOut=${checkOut}`;
    }
    navigate(url);
  };

  const hasDates = checkIn && checkOut && totalPrice;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  return (
    <article className="catalog-custom-card">
      <div className="catalog-custom-card__gallery">
        <img
          src={images[currentImgIndex]}
          alt={title}
          className="catalog-custom-card__image"
        />

        {images.length > 1 && (
          <>
            <button className="catalog-custom-card__nav-btn left" onClick={prevImage}>
              <ChevronLeft size={20} />
            </button>
            <button className="catalog-custom-card__nav-btn right" onClick={nextImage}>
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      <div className="catalog-custom-card__content">
        <div className="catalog-custom-card__header">
          <h3 className="catalog-custom-card__title">{title}</h3>
          <div className="catalog-custom-card__capacity">
            <User size={14} />
            <span>до {capacity}</span>
          </div>
        </div>

        <div className="catalog-custom-card__body">
          <div className="catalog-custom-card__features">
            {features.map((feature, idx) => (
              <div key={idx} className="catalog-custom-card__feature">
                <span className="catalog-custom-card__feature-icon">{feature.icon}</span>
                <span className="catalog-custom-card__feature-text">{feature.text}</span>
              </div>
            ))}
          </div>

          {hasDates && (
            <div className="catalog-custom-card__dates-info">
              <div className="catalog-custom-card__dates-row">
                <div className="catalog-custom-card__date-col">
                  <span className="catalog-custom-card__date-label">Заезд</span>
                  <span className="catalog-custom-card__date-value">{formatDate(checkIn)}</span>
                </div>
                <div className="catalog-custom-card__date-col">
                  <span className="catalog-custom-card__date-label">Выезд</span>
                  <span className="catalog-custom-card__date-value">{formatDate(checkOut)}</span>
                </div>
              </div>
              <div className="catalog-custom-card__total-price desktop-only">
                Итог: <strong>{totalPrice.toLocaleString('ru-RU')} ₽</strong>
              </div>
            </div>
          )}
        </div>

        <div className={`catalog-custom-card__footer ${hasDates ? 'with-dates' : 'without-dates'}`}>
          <div className="catalog-custom-card__prices-row">
            {hasDates && (
              <div className="catalog-custom-card__total-price mobile-only">
                Итог: <strong>{totalPrice.toLocaleString('ru-RU')} ₽</strong>
              </div>
            )}
            <div className="catalog-custom-card__price-night">
              от <strong>{pricePerNight.toLocaleString('ru-RU')} ₽</strong> / сут.
            </div>
          </div>
          <button className="catalog-custom-card__details-btn" onClick={handleNavigate}>
            Подробнее
          </button>
        </div>
      </div>
    </article>
  );
};

export default CatalogCard;
