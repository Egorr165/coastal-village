// src/components/CottageCard/CottageCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Users, Maximize, Home, Flame, Utensils } from 'lucide-react';
import Button from '../Button/Button';
import './CottageCard.scss';

export interface CottageCardProps {
  id: string;
  title: string;
  capacity: number;
  area: number;
  houseCount: number;
  price: number;
  images: string[];
  isReversed?: boolean;
}

const CottageCard: React.FC<CottageCardProps> = ({
  id,
  title,
  capacity,
  area,
  houseCount,
  price,
  images,
  isReversed = false
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
    navigate(`/house/${id}`);
  };

  return (
    <article className={`cottage-card ${isReversed ? 'cottage-card--reversed' : ''}`}>

      {/* Левая (или правая) часть: Слайдер с фото */}
      <div className="cottage-card__gallery">
        <img
          src={images[currentImgIndex]}
          alt={title}
          className="cottage-card__image"
        />

        {images.length > 1 && (
          <>
            <button aria-label="Предыдущее фото" className="cottage-card__nav-btn left" onClick={prevImage}>
              <ArrowLeft size={16} />
            </button>
            <button aria-label="Следующее фото" className="cottage-card__nav-btn right" onClick={nextImage}>
              <ArrowRight size={16} />
            </button>

            <div className="cottage-card__dots">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`cottage-card__dot ${idx === currentImgIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Правая (или левая) часть: Информация */}
      <div className="cottage-card__info">
        <h3 className="cottage-card__title">{title}</h3>

        <ul className="cottage-card__features">
          <li>
            <Users className="cottage-card__feature-icon" size={24} strokeWidth={2} color="var(--color-primary)" />
            <span>До&nbsp;{capacity} человек</span>
          </li>
          <li>
            <Maximize className="cottage-card__feature-icon" size={24} strokeWidth={2} color="var(--color-primary)" />
            <span>{area} м²</span>
          </li>
          <li>
            <Home className="cottage-card__feature-icon" size={24} strokeWidth={2} color="var(--color-primary)" />
            <span>Количество домов {houseCount}</span>
          </li>
          <li>
            <Flame className="cottage-card__feature-icon" size={24} strokeWidth={2} color="var(--color-primary)" />
            <span>Терраса и&nbsp;оборудованная мангальная зона</span>
          </li>
          <li>
            <Utensils className="cottage-card__feature-icon" size={24} strokeWidth={2} color="var(--color-primary)" />
            <span>Кухня-гостиная с&nbsp;полным набором мебели и&nbsp;техники</span>
          </li>
        </ul>

        <div className="cottage-card__footer">
          <div className="cottage-card__price">
            {price.toLocaleString('ru-RU')} ₽ <span>/ сутки</span>
          </div>
          <Button variant="secondary" className="cottage-card__btn" onClick={handleNavigate}>
            Узнать подробнее
          </Button>
        </div>
      </div>
    </article>
  );
};

export default CottageCard;