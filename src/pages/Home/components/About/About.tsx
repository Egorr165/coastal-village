import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '../../../../components/Button/Button';
import { FEATURES } from '../../../../data/homeData';
import './About.scss';

const About = () => {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about__content-wrapper">
          <div className="about__text-col">
            <h2 className="about__title">О нас</h2>
            <p className="about__paragraph">
              <span className="about__text-bold">7 Континент</span> – это уютные домики для отдыха на
              берегу Каспийского моря в Дагестане. Мы предлагаем комфортное размещение в
              современных деревянных коттеджах, расположенных всего в нескольких шагах от
              морского побережья. Наши гости получают возможность отдыхать на собственном
              оборудованном пляже, дышать чистым морским воздухом и наслаждаться живописными
              видами.
            </p>
            <p className="about__paragraph">
              7 Континент создан для ценителей уединенного отдыха у моря, комфорта в гармонии с
              природой и аутентичной атмосферы приморского Дагестана.
            </p>
            <Button>Подробнее</Button>
          </div>

          <div className="about__image-col">
            <div className="about__image-frame">
              <img
                src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop"
                alt="Cottage Interior"
                className="about__image"
              />
            </div>
            <button className="about__slider-nav about__slider-nav--left">
              <ArrowLeft size={20} />
            </button>
            <button className="about__slider-nav about__slider-nav--right">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="about__features">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="about__feature">
              <div className="about__feature-icon">
                <feature.icon className="about__feature-svg" />
              </div>
              <p className="about__feature-text">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
