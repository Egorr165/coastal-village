import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import './LazyMap.scss';

interface LazyMapProps {
  src: string;
  className?: string;
}

const LazyMap: React.FC<LazyMapProps> = ({ src, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`lazy-map ${className}`}>
      {!isLoaded ? (
        <div 
          className="lazy-map__placeholder" 
          onClick={() => setIsLoaded(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsLoaded(true);
            }
          }}
        >
          <div className="lazy-map__overlay">
            <div className="lazy-map__icon-pulse">
              <MapPin size={48} className="lazy-map__icon" strokeWidth={1.5} />
            </div>
            <span className="lazy-map__button-text">Показать интерактивную карту</span>
          </div>
        </div>
      ) : (
        <iframe
          src={src}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen={true}
          className="lazy-map__iframe lazy-map__iframe--loaded"
          title="Интерактивная карта"
        ></iframe>
      )}
    </div>
  );
};

export default LazyMap;
