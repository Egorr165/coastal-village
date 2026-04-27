import React, { useState } from 'react';
import { Share2, Maximize, ChevronLeft, ChevronRight, BedDouble, Home, UserCheck } from 'lucide-react';
import './HouseGallery.scss';
import mainHouseVideo from '../../../../images/main_house.mp4';

interface HouseGalleryProps {
  houseTitle: string;
  mainGalleryImages: string[];
  yardImages: string[];
  beachImages: string[];
  currentHouseImages: string[];
  onOpenFullscreen: (index: number) => void;
  capacity: number;
  bedrooms: number;
  area: number;
  houseType: 'big' | 'small';
}

const HouseGallery: React.FC<HouseGalleryProps> = ({
  houseTitle,
  mainGalleryImages,
  yardImages,
  beachImages,
  currentHouseImages,
  onOpenFullscreen,
  capacity,
  bedrooms,
  area,
  houseType
}) => {
  const [mainIndex, setMainIndex] = useState(0);
  const [yardIndex, setYardIndex] = useState(0);
  const [beachIndex, setBeachIndex] = useState(0);
  const [houseIndex, setHouseIndex] = useState(0);

  const nextImage = (e: React.MouseEvent, setter: React.Dispatch<React.SetStateAction<number>>, length: number) => {
    e.stopPropagation();
    if (length > 0) setter(prev => (prev + 1) % length);
  };

  const prevImage = (e: React.MouseEvent, setter: React.Dispatch<React.SetStateAction<number>>, length: number) => {
    e.stopPropagation();
    if (length > 0) setter(prev => (prev - 1 + length) % length);
  };

  const handleMiniGalleryClick = (imageSrc: string) => {
    if (!imageSrc) return;
    const index = mainGalleryImages.indexOf(imageSrc);
    if (index !== -1) {
      setMainIndex(index);
    }
  };

  return (
    <section className="gallery-section">
      <div className="house-gallery-container flex-column">
        {/* Главное фото */}
        <div className="gallery-main-image" onClick={() => onOpenFullscreen(mainIndex)}>
          <img src={mainGalleryImages[mainIndex] || "https://picsum.photos/seed/int1/800/600"} alt="Main View" />
          
          <div className="gallery-overlay-top-stats">
            <div className="top-stat-item">
              <span className="top-stat-value">2 этажа</span>
            </div>
            <div className="top-stat-item">
              <span className="top-stat-value">{area} м²</span>
            </div>
            <div className="top-stat-item">
              <span className="top-stat-value">Общий двор</span>
            </div>
            <div className="top-stat-item">
              <span className="top-stat-value">2 спальни</span>
            </div>
            <div className="top-stat-item">
              <span className="top-stat-value">до {capacity} человек</span>
            </div>
          </div>

          {mainGalleryImages.length > 1 && (
            <div className="hover-arrows">
              <button className="arrow-btn left" onClick={(e) => prevImage(e, setMainIndex, mainGalleryImages.length)}><ChevronLeft size={20} /></button>
              <button className="arrow-btn right" onClick={(e) => nextImage(e, setMainIndex, mainGalleryImages.length)}><ChevronRight size={20} /></button>
            </div>
          )}
        </div>

        {/* Миниатюры */}
        <div className="gallery-thumbnails">
          {mainGalleryImages.map((imgSrc, idx) => (
            <div 
              key={idx} 
              className={`thumbnail-item ${idx === mainIndex ? 'active' : ''}`}
              onClick={() => handleMiniGalleryClick(imgSrc)}
            >
              <img src={imgSrc} alt={`Thumbnail ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HouseGallery;
