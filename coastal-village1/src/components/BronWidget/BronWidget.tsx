import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import './BronWidget.scss';
import bgImage from '../../images/fon-bron-widget.webp';
import leftImage from '../../images/bron_widget.webp';

const BronWidget = () => {
  const navigate = useNavigate();

  return (
    <section
      className="bron-widget"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="container bron-widget__container">
        <div className="bron-widget__image-wrapper">
          <img src={leftImage} alt="Our cottages" className="bron-widget__image" />
        </div>

        <div className="bron-widget__content">
          <h2 className="bron-widget__title">Хотите увидеть всё своими глазами?</h2>
          <p className="bron-widget__text">
            Приезжайте к нам и оцените уровень комфорта лично. Выбирайте идеальный коттедж<br />
            и отправляйтесь за незабываемым отдыхом на берег к Каспийскому морю.
          </p>
        </div>

        <div className="bron-widget__action">
          <Button size="lg" variant="secondary" onClick={() => navigate('/catalog')}>
            ЗАБРОНИРОВАТЬ
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BronWidget;
