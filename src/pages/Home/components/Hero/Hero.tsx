import SearchFilters from '../../../../components/SearchFilters/SearchFilters';
import './Hero.scss';

const Hero = () => {
  return (
    <section id="main" className="hero">
      <div className="hero__overlay"></div>
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title">Аренда коттеджей на берегу Каспийского моря</h1>
          <p className="hero__subtitle">Подберите идеальный вариант для вашего отдыха</p>

          <div className="hero__photos">
            <div className="hero__photo hero__photo--1">
              <img src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800&auto=format&fit=crop" alt="Sea view" />
            </div>
            <div className="hero__photo hero__photo--2">
              <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop" alt="Cottage at night" />
            </div>
            <div className="hero__photo hero__photo--3">
              <img src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800&auto=format&fit=crop" alt="Resort courtyard" />
            </div>
          </div>
        </div>
        <SearchFilters />
      </div>
    </section>
  );
};

export default Hero;
