import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './FullscreenGalleryModal.scss';

interface FullscreenGalleryModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const FullscreenGalleryModal: React.FC<FullscreenGalleryModalProps> = ({ 
  images, 
  currentIndex, 
  onClose, 
  onNavigate 
}) => {
  return (
    <div className="fullscreen-overlay" onClick={onClose}>
      <button className="close-btn" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      
      <button className="nav-btn prev" onClick={(e) => {
        e.stopPropagation();
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }}>
        <ChevronLeft size={32} />
      </button>
      
      <img 
        src={images[currentIndex]} 
        alt="Fullscreen View" 
        onClick={(e) => e.stopPropagation()} 
      />
      
      <button className="nav-btn next" onClick={(e) => {
        e.stopPropagation();
        onNavigate((currentIndex + 1) % images.length);
      }}>
        <ChevronRight size={32} />
      </button>

      <div className="image-counter">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default FullscreenGalleryModal;
