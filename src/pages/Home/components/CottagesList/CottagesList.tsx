import CottageCard from '../../../../components/CottageCard/CottageCard';
import { COTTAGES } from '../../../../data/homeData';
import './CottagesList.scss';

const CottagesList = () => {
  return (
    <section id="cottages" className="cottages">
      <div className="container">
        <h2 className="cottages__title">Коттеджи 2-х видов</h2>

        <div className="cottages__list">
          {COTTAGES.map((cottage) => (
            <CottageCard key={cottage.id} {...cottage} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CottagesList;
