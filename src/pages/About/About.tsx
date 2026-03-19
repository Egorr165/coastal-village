import {
  Heart,
  Home,
  Palmtree,
  Trees,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './About.scss';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BronWidget from '../../components/BronWidget/BronWidget';
import Button from '../../components/Button/Button';

// Import images
import fonAbout from '../../images/fon-about.jpeg';
import paintingSvg from '../../images/about/painting.svg';
import iconPaintingSvg from '../../images/about/icon_painting.svg';
// Import gallery images
import G1 from '../../images/galery/galery-1.png';
import G2 from '../../images/galery/galery-2.png';
import G3 from '../../images/galery/galery-3.png';
import G4 from '../../images/galery/galery-4.png';
import G5 from '../../images/galery/galery-5.png';
import G6 from '../../images/galery/galery-6.png';
import G7 from '../../images/galery/galery-7.png';
import G8 from '../../images/galery/galery-8.png';
import G9 from '../../images/galery/galery-9.png';
import G10 from '../../images/galery/galery-10.png';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="app-wrapper">
      <Header />

      <main>
        <section className="about-hero" style={{ backgroundImage: `url(${fonAbout})` }}>
          <div className="about-hero__overlay"></div>

          <div className="container about-hero__container">
            <div className="about-hero__content">
              <h1 className="about-hero__title">Наша история</h1>
              <p className="about-hero__quote">
                «Мы верим, что настоящий отдых — это когда море<br />
                становится частью тебя, а время замедляет свой бег.»
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="about-hero__btn"
              onClick={() => navigate('/catalog')}
            >
              ВЫБРАТЬ КОТТЕДЖ
            </Button>
          </div>
        </section>

        <section className="history">
          <div className="history__watermark">ОСНОВАН 2020</div>

          <div className="container history__container">
            <div className="history__left">
              <div className="history__photo">
                Вставить<br />фото
              </div>
              <div className="history__signature">
                <img src={paintingSvg} alt="Подпись" />
              </div>
            </div>

            <div className="history__right">
              <div className="history__person">
                <span className="history__person-name">Вещевайлов Юрий</span>
                <span className="history__person-role">Президент</span>
              </div>

              <p className="history__quote">
                «Мы приехали на Каспий отдыхать — и остались навсегда.»
              </p>

              <div className="history__text">
                <p>
                  Помним тот самый отпуск, когда поняли: это не просто море, а место, где сердце нашло дом.
                  За два года своими руками превратили мечту в реальность — построили первое гнездышко у воды.
                </p>
                <br />
                <p>
                  Сегодня открываем его двери для вас. Это не просто аренда — это частичка нашей души,
                  наше семейное тепло у моря. Приезжайте. Отдохните. Вдохните каспийский воздух и увезите с собой
                  частичку этого покоя. Мы ждём вас!
                </p>
              </div>

              <div className="history__bottom-quote">
                <div className="history__quote-icon">
                  <img src={iconPaintingSvg} alt="Quote" />
                </div>
                «Иногда нужно приехать на море как гость, чтобы понять: ты просто вернулся домой.»
              </div>
            </div>
          </div>
        </section>

        <section className="values">
          <div className="container">
            <div className="section-title-wrapper">
              <div className="title-line"></div>
              <h2 className="section-title">Наши ценности</h2>
            </div>

            <div className="values__grid">
              <div className="values__card values__card--wide">
                <div className="values__icon-wrapper">
                  <Home size={32} className="values__icon" />
                </div>
                <div className="values__content">
                  <h3 className="values__card-title">Как у себя дома</h3>
                  <p className="values__text">
                    Мы создаем уют не для «гостей», а для новых друзей. Здесь вы всегда почувствуете себя как дома — без жестких правил отелей и лишних формальностей. Ваш комфорт — наш приоритет.
                  </p>
                </div>
              </div>

              <div className="values__card">
                <div className="values__icon-wrapper">
                  <Trees size={32} className="values__icon" />
                </div>
                <div className="values__content">
                  <h3 className="values__card-title">Гармония с природой</h3>
                  <p className="values__text">
                    Мы бережно встроили наши домики в ландшафт. Вы окажетесь наедине с природой, слушая лишь шум прибоя и пение птиц.
                  </p>
                </div>
              </div>

              <div className="values__card">
                <div className="values__icon-wrapper">
                  <Heart size={32} className="values__icon" />
                </div>
                <div className="values__content">
                  <h3 className="values__card-title">Тепло и забота</h3>
                  <p className="values__text">
                    Мы сами отвечаем на ваши сообщения, сами следим за идеальной чистотой и честно рассказываем обо всем. Наша цель — ваш по-настоящему спокойный отдых без сюрпризов.
                  </p>
                </div>
              </div>

              <div className="values__card values__card--wide">
                <div className="values__icon-wrapper">
                  <Palmtree size={32} className="values__icon" />
                </div>
                <div className="values__content">
                  <h3 className="values__card-title">Абсолютная приватность</h3>
                  <p className="values__text">
                    Мы уважаем ваше личное пространство и свободу. Здесь полная приватность, ваш собственный уголок рая у моря, но мы всегда рядом, если вам что-то понадобится.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="gallery">
          <div className="container">
            <div className="section-title-wrapper">
              <div className="title-line"></div>
              <h2 className="section-title">Немного закулисья</h2>
            </div>

            <div className="gallery__grid">
              <div className="gallery__col">
                <div className="gallery__item gallery__item--1">
                  <img src={G1} alt="Backstage 1" />
                </div>
                <div className="gallery__item gallery__item--6">
                  <img src={G6} alt="Backstage 6" />
                </div>
              </div>

              <div className="gallery__col">
                <div className="gallery__item gallery__item--2">
                  <img src={G2} alt="Backstage 2" />

                </div>
                <div className="gallery__item gallery__item--7">
                  <img src={G7} alt="Backstage 7" />
                </div>
              </div>

              <div className="gallery__col">
                <div className="gallery__item gallery__item--3">
                  <img src={G3} alt="Backstage 3" />
                </div>
                <div className="gallery__item gallery__item--8">
                  <img src={G8} alt="Backstage 8" />
                </div>
              </div>

              <div className="gallery__col">
                <div className="gallery__item gallery__item--4">
                  <img src={G4} alt="Backstage 4" />
                </div>
                <div className="gallery__item gallery__item--9">
                  <img src={G9} alt="Backstage 9" />
                </div>
              </div>

              <div className="gallery__col">
                <div className="gallery__item gallery__item--5">
                  <img src={G5} alt="Backstage 5" />
                </div>
                <div className="gallery__item gallery__item--10">
                  <img src={G10} alt="Backstage 10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <BronWidget />
      </main>

      <Footer />
    </div>
  );
};

export default About;
