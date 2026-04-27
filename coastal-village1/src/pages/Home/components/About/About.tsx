import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '../../../../components/Button/Button';
import { FEATURES } from '../../../../data/homeData';
import './About.scss';
import aboutImg from '../../../../images/about/ab.jpg';

const aboutGallery = [aboutImg];

const About = () => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev === aboutGallery.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImgIndex((prev) => (prev === 0 ? aboutGallery.length - 1 : prev - 1));
  };

  const currentImageUrl = aboutGallery.length > 0 ? aboutGallery[currentImgIndex] : '';

  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about__content-wrapper">
          <div className="about__text-col">
            <h2 className="about__title">О нас</h2>
            <p className="about__paragraph">
              <span className="about__text-bold">7 Континент</span> — это современные деревянные коттеджи на&nbsp;берегу Каспийского моря. Мы создали идеальное место в&nbsp;Дагестане для&nbsp;тех, кто ценит уединённый отдых, гармонию с&nbsp;природой и&nbsp;высокий уровень комфорта.
            </p>

            <div className="about__highlights">
              <div className="about__highlight">
                <span className="about__highlight-title">Море в&nbsp;паре минут</span>
                <span className="about__highlight-text">Коттеджи расположены на&nbsp;второй линии в 100 метрах от&nbsp;берега — идеальный баланс тишины и&nbsp;близости к&nbsp;пляжу</span>
              </div>
              
              <div className="about__highlight">
                <span className="about__highlight-title">Эко-комфорт</span>
                <span className="about__highlight-text">Современные деревянные коттеджи, в&nbsp;которых есть всё необходимое для&nbsp;беззаботного отдыха</span>
              </div>
              
            </div>
            <Button>Подробнее</Button>
          </div>

          <div className="about__image-col">
            <div className="about__image-frame">
              {currentImageUrl && (
                <img
                  src={currentImageUrl}
                  alt="О нас галерея"
                  className="about__image"
                />
              )}
            </div>
            {aboutGallery.length > 1 && (
              <>
                <button aria-label="Предыдущее фото" className="about__slider-nav about__slider-nav--left" onClick={prevImage}>
                  <ArrowLeft size={20} />
                </button>
                <button aria-label="Следующее фото" className="about__slider-nav about__slider-nav--right" onClick={nextImage}>
                  <ArrowRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="about__features">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="about__feature">
                <div className="about__feature-icon">
                  <Icon className="about__feature-svg text-pink-500" size={24} strokeWidth={1.5} color="var(--color-primary)" />
                </div>
                <p className="about__feature-text">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
