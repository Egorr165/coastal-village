// src/components/CottageCard/CottageCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './CottageCard.scss';

import UserIcon from '../../images/icons/user-icon.svg';
import AreaIcon from '../../images/icons/area-icon.svg';
import HomeIcon from '../../images/icons/home-icon.svg';
import FlameIcon from '../../images/icons/flame-icon.svg';
import KitchenIcon from '../../images/icons/kitchen-icon.svg';

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

      {/* Левая (или правая) часть: Слайдер с фото */}
      <div className="cottage-card__gallery">
        <img
          src={images[currentImgIndex]}
          alt={title}
          className="cottage-card__image"
        />

        {images.length > 1 && (
          <>
            <button className="cottage-card__nav-btn left" onClick={prevImage}>
              <ArrowLeft size={16} />
            </button>
            <button className="cottage-card__nav-btn right" onClick={nextImage}>
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
            <img src={UserIcon} alt="Вместимость" className="cottage-card__feature-icon" />
            <span>До {capacity} человек</span>
          </li>
          <li>
            <img src={AreaIcon} alt="Площадь" className="cottage-card__feature-icon" />
            <span>{area} м²</span>
          </li>
          <li>
            <img src={HomeIcon} alt="Количество" className="cottage-card__feature-icon" />
            <span>Количество домов {houseCount}</span>
          </li>
          <li>
            <img src={FlameIcon} alt="Мангал" className="cottage-card__feature-icon" />
            <span>Терраса и оборудованная мангальная зона</span>
          </li>
          <li>
            <img src={KitchenIcon} alt="Кухня" className="cottage-card__feature-icon" />
            <span>Гостиная, объединённая с кухней, которая имеет полный набор встроенной мебели и техники.</span>
          </li>
        </ul>

        <div className="cottage-card__footer">
          <div className="cottage-card__price">
            {price.toLocaleString('ru-RU')} ₽ <span>/ сутки</span>
          </div>
          <button className="cottage-card__btn" onClick={handleNavigate}>
            Узнать подробнее
          </button>
        </div>
      </div>
    </article>
  );
};

export default CottageCard;