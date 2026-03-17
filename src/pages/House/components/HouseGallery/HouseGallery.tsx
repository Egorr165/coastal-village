import React, { useState } from 'react';
import { Share2, Maximize, ChevronLeft, ChevronRight } from 'lucide-react';
import './HouseGallery.scss';
// Fallback video path until copied
import mainHouseVideo from '../../../../images/main_house.mp4';

interface HouseGalleryProps {
  houseTitle: string;
  assignedName: string | null;
  mainGalleryImages: string[];
  yardImages: string[];
  beachImages: string[];
  currentHouseImages: string[];
  onOpenFullscreen: (index: number) => void;
}

const HouseGallery: React.FC<HouseGalleryProps> = ({
  houseTitle,
  assignedName,
  mainGalleryImages,
  yardImages,
  beachImages,
  currentHouseImages,
  onOpenFullscreen
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
    <section className="gallery-section container">
      <div className="gallery-header">
        <div className="gallery-title-wrapper">
          <h1 className="gallery-title">{houseTitle}</h1>
          {assignedName && <span className="assigned-name">{assignedName}</span>}
        </div>
        <button className="share-btn">
          <Share2 size={24} className="icon-primary" />
        </button>
      </div>

      <div className="gallery-grid">
        <div className="gallery-item main-item" onClick={() => onOpenFullscreen(mainIndex)}>
          <img src={mainGalleryImages[mainIndex] || "https://picsum.photos/seed/int1/800/600"} alt="Main View" />
          <div className="hover-overlay" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
            <Maximize size={32} color="white" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.8 }} />
          </div>
          {mainGalleryImages.length > 1 && (
            <div className="hover-arrows">
              <button className="arrow-btn left" onClick={(e) => prevImage(e, setMainIndex, mainGalleryImages.length)}><ChevronLeft size={20} /></button>
              <button className="arrow-btn right" onClick={(e) => nextImage(e, setMainIndex, mainGalleryImages.length)}><ChevronRight size={20} /></button>
            </div>
          )}
        </div>

        <div className="gallery-item" onClick={() => handleMiniGalleryClick(yardImages[yardIndex])}>
          <img src={yardImages[yardIndex] || "https://picsum.photos/seed/int2/400/300"} alt="Gallery 1" style={{ cursor: 'pointer' }} />
          <div className="hover-overlay"></div>
          {yardImages.length > 1 && (
            <div className="hover-arrows">
              <button className="arrow-btn left" onClick={(e) => prevImage(e, setYardIndex, yardImages.length)}><ChevronLeft size={16} /></button>
              <button className="arrow-btn right" onClick={(e) => nextImage(e, setYardIndex, yardImages.length)}><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
        
        <div className="gallery-item" onClick={() => handleMiniGalleryClick(beachImages[beachIndex])}>
          <img src={beachImages[beachIndex] || "https://picsum.photos/seed/ext1/400/300"} alt="Gallery 2" style={{ cursor: 'pointer' }} />
          <div className="hover-overlay"></div>
          {beachImages.length > 1 && (
            <div className="hover-arrows">
              <button className="arrow-btn left" onClick={(e) => prevImage(e, setBeachIndex, beachImages.length)}><ChevronLeft size={16} /></button>
              <button className="arrow-btn right" onClick={(e) => nextImage(e, setBeachIndex, beachImages.length)}><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
        
        <div className="gallery-item" onClick={() => handleMiniGalleryClick(currentHouseImages[houseIndex])}>
          <img src={currentHouseImages[houseIndex] || "https://picsum.photos/seed/yard1/400/300"} alt="Gallery 3" style={{ cursor: 'pointer' }} />
          <div className="hover-overlay"></div>
          {currentHouseImages.length > 1 && (
            <div className="hover-arrows">
              <button className="arrow-btn left" onClick={(e) => prevImage(e, setHouseIndex, currentHouseImages.length)}><ChevronLeft size={16} /></button>
              <button className="arrow-btn right" onClick={(e) => nextImage(e, setHouseIndex, currentHouseImages.length)}><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
        
        <div className="gallery-item">
          <video 
            src={mainHouseVideo} 
            autoPlay 
            loop 
            muted 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div className="hover-overlay"></div>
          <div className="video-badge">Смотреть видео</div>
        </div>
      </div>
    </section>
  );
};

export default HouseGallery;
