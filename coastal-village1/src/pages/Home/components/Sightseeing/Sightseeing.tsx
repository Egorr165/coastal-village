import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SIGHTS } from '../../../../data/homeData';
import './Sightseeing.scss';

const Sightseeing = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 340;
    const targetScroll =
      scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  return (
    <section className="sightseeing">
      <div className="sightseeing__bg-pattern"></div>

      <div className="container">
        <div className="sightseeing__header">
          <h2 className="sightseeing__title">Что посмотреть?</h2>
          <div className="sightseeing__controls">
            <button aria-label="Прокрутить влево" onClick={() => scroll('left')} className="sightseeing__nav-btn">
              <ArrowLeft size={20} />
            </button>
            <button aria-label="Прокрутить вправо" onClick={() => scroll('right')} className="sightseeing__nav-btn">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="sightseeing__scroll-container no-scrollbar">
          {SIGHTS.map((sight) => (
            <div key={sight.id} className="sightseeing__card">
              <img src={sight.image} alt={sight.title} className="sightseeing__card-img" />
              <div className="sightseeing__card-overlay"></div>
              <div className="sightseeing__card-content">
                <h3 className="sightseeing__card-title">{sight.title}</h3>
                <div className="sightseeing__card-line"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sightseeing;
