import React from 'react';
import { Bus, Car, CarTaxiFront, Train } from 'lucide-react';
import './TransportOptions.scss';

const TransportOptions: React.FC = () => {
  return (
    <div className="transport-section">
      <h3>Способы добраться:</h3>
      <div className="transport-grid">
        <div className="transport-item">
          <div className="transport-icon"><Bus size={28} strokeWidth={1.5} /></div>
          <span>Автобус</span>
        </div>
        <div className="transport-item">
          <div className="transport-icon"><Car size={28} strokeWidth={1.5} /></div>
          <span>Каршеринг</span>
        </div>
        <div className="transport-item">
          <div className="transport-icon"><Train size={28} strokeWidth={1.5} /></div>
          <span>Электричка</span>
        </div>
        <div className="transport-item">
          <div className="transport-icon"><CarTaxiFront size={28} strokeWidth={1.5} /></div>
          <span>Такси</span>
        </div>
      </div>
    </div>
  );
};

export default TransportOptions;
