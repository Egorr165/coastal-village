import './CatalogMap.scss';
import LazyMap from '../../../../components/LazyMap/LazyMap';

const CatalogMap = () => {
  return (
    <div className="catalog-map">
      <div className="catalog-map__container">
        <a 
          href="https://yandex.ru/maps/org/7_kontinent/201915250712/?utm_medium=mapframe&utm_source=maps" 
          className="catalog-map__link-top"
        >
          7 Континент
        </a>
        <a 
          href="https://yandex.ru/maps/11010/republic-of-dagestan/category/resort/184106400/?utm_medium=mapframe&utm_source=maps" 
          className="catalog-map__link-bottom"
        >
          База, дом отдыха в Республике Дагестан
        </a>
        <LazyMap 
          src="https://yandex.ru/map-widget/v1/?ll=47.934658%2C42.484620&mode=search&oid=201915250712&ol=biz&z=16.47" 
          className="catalog-map__iframe"
        />
      </div>
    </div>
  );
};

export default CatalogMap;
