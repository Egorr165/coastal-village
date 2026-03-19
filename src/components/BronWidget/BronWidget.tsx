import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import './BronWidget.scss';
import bgImage from '../../images/fon-bron-widget.png';
import leftImage from '../../images/bron_widget.jpg';

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
            Приезжайте в гости. Мы с радостью лично покажем наши «гнёздышки», расскажем<br />
            истории и угостим чаем с душистыми травами.
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
