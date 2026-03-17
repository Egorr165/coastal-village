import React from 'react';
import { BedDouble, Home, UserCheck } from 'lucide-react';
import './PropertySummary.scss';

// Assuming House type is available, otherwise define minimal needed props
interface PropertySummaryProps {
  area: number;
  capacity: number;
  bedrooms: number;
  type: 'big' | 'small';
}

const PropertySummary: React.FC<PropertySummaryProps> = ({
  area,
  capacity,
  bedrooms,
  type
}) => {
  return (
    <div className="property-summary-block">
      <div className="stats-row">
        <div className="stat-item">
          <label>Тип жилья</label>
          <strong>Дом у моря</strong>
        </div>
        <div className="stat-item">
          <label>Этажи</label>
          <strong>2 этажа</strong>
        </div>
        <div className="stat-item">
          <label>Площадь</label>
          <strong>{area || 75} м²</strong>
        </div>
        <div className="stat-item">
          <label>Участок</label>
          <strong>Общий двор</strong>
        </div>
      </div>

      <div className="summary-divider"></div>

      <div className="capacity-row">
        <div className="capacity-item">
          <BedDouble className="icon-accent" strokeWidth={1.5} size={32} />
          <span>{capacity} спальных мест</span>
        </div>
        <div className="capacity-item centered">
          <Home className="icon-accent" strokeWidth={1.5} size={30} />
          <span>{bedrooms || 2} спальни</span>
        </div>
        <div className="capacity-item right">
          <UserCheck className="icon-accent" strokeWidth={1.5} size={30} />
          <span>до {capacity} человек</span>
        </div>
      </div>
    </div>
  );
};

export default PropertySummary;
