import React from 'react';
import {
  Flame,
  Maximize,
  Microwave,
  Shirt,
  ShowerHead,
  Snowflake,
  Tv,
  ThermometerSun,
  Users,
  Utensils,
  WashingMachine,
  Wifi,
  Wind
} from 'lucide-react';
import './AmenitiesList.scss';

const AmenitiesList: React.FC = () => {
  return (
    <div className="amenities-grid">
      <div className="amenity-item">
        <span className="amenity-icon"><Wind size={18} /></span>
        <span className="amenity-label">Кондиционер</span>
      </div>
      <div className="amenity-item">
        <span className="amenity-icon"><Utensils size={18} /></span>
        <span className="amenity-label">Кухня в доме</span>
      </div>

      <div className="amenity-item">
        <span className="amenity-icon"><Snowflake size={18} /></span>
        <span className="amenity-label">Холодильник</span>
      </div>
      <div className="amenity-item">
        <span className="amenity-icon"><Tv size={18} /></span>
        <span className="amenity-label">Телевизор</span>
      </div>

      <div className="amenity-item">
        <span className="amenity-icon"><Flame size={18} /></span>
        <span className="amenity-label">Мангал</span>
      </div>
      <div className="amenity-item">
        <span className="amenity-icon"><ShowerHead size={18} /></span>
        <span className="amenity-label">Душевая</span>
      </div>

      <div className="amenity-item">
        <span className="amenity-icon"><Shirt size={18} /></span>
        <span className="amenity-label">Утюг</span>
      </div>
      <div className="amenity-item">
        <span className="amenity-icon"><ThermometerSun size={18} /></span>
        <span className="amenity-label">Отопление</span>
      </div>

      <div className="amenity-item">
        <span className="amenity-icon"><ThermometerSun size={18} /></span>
        <span className="amenity-label">Теплый пол</span>
      </div>
      <div className="amenity-item">
        <span className="amenity-icon"><Flame size={18} /></span>
        <span className="amenity-label">Плита</span>
      </div>

      <div className="amenity-item">
        <span className="amenity-icon"><Microwave size={18} /></span>
        <span className="amenity-label">Микроволновка</span>
      </div>
      <div className="amenity-item">
        <span className="amenity-icon"><Users size={18} /></span>
        <span className="amenity-label">Туалет</span>
      </div>

      <div className="amenity-item">
        <span className="amenity-icon"><Wifi size={18} /></span>
        <span className="amenity-label">Wi-Fi</span>
      </div>
      <div className="amenity-item">
        <span className="amenity-icon"><Wind size={18} /></span>
        <span className="amenity-label">Фен (по запросу)</span>
      </div>

      <div className="amenity-item">
        <span className="amenity-icon"><WashingMachine size={18} /></span>
        <span className="amenity-label">Стиральная машина</span>
      </div>
      <div className="amenity-item">
        <span className="amenity-icon"><Maximize size={18} /></span>
        <span className="amenity-label">Балкон</span>
      </div>
    </div>
  );
};

export default AmenitiesList;
