import React from 'react';
import './HouseInfo.scss';

const HouseInfo: React.FC = () => {
  return (
    <div className="info-split">
      <div className="info-block">
        <h3>Способы оплаты</h3>
        <div className="tags-list">
          <span className="tag tag--payment">Перевод на карту</span>
          <span className="tag tag--payment">Оплата наличными</span>
        </div>
      </div>
      <div className="info-block">
        <h3>Время заезда/выезда</h3>
        <div className="check-times">
          Заезд: 14:00 Выезд: 12:00
        </div>
      </div>
    </div>
  );
};

export default HouseInfo;
