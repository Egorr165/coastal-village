import SearchFilters from '../../../../components/SearchFilters/SearchFilters';
import './Hero.scss';

import photo1 from '../../../../images/galery/galery-1.webp';
import photo2 from '../../../../images/galery/galery-2.webp';
import photo3 from '../../../../images/galery/galery-3.webp';

const Hero = () => {
  return (
    <section id="main" className="hero">
      <div className="hero__overlay"></div>
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title">Аренда коттеджей на&nbsp;берегу Каспийского моря</h1>
          <p className="hero__subtitle">Подберите идеальный вариант для&nbsp;вашего отдыха</p>

          <div className="hero__photos">
            <div className="hero__photo hero__photo--1">
              <img src={photo1} alt="Sea view" />
            </div>
            <div className="hero__photo hero__photo--2">
              <img src={photo2} alt="Cottage at night" />
            </div>
            <div className="hero__photo hero__photo--3">
              <img src={photo3} alt="Resort courtyard" />
            </div>
          </div>
        </div>
        <SearchFilters />
      </div>
    </section>
  );
};

export default Hero;
