import React from 'react';
import './HouseMap.scss';

const HouseMap: React.FC = () => {
  return (
    <div className="map-section">
      <h3>Наше расположение</h3>
      <div className="map-placeholder" style={{ position: 'relative', overflow: 'hidden' }}>
        <a href="https://yandex.ru/maps/org/7_kontinent/201915250712/?utm_medium=mapframe&utm_source=maps" style={{ color: '#eee', fontSize: '12px', position: 'absolute', top: '0px' }}>7 Континент</a>
        <a href="https://yandex.ru/maps/11010/republic-of-dagestan/category/resort/184106400/?utm_medium=mapframe&utm_source=maps" style={{ color: '#eee', fontSize: '12px', position: 'absolute', top: '14px' }}>База, дом отдыха в Республике Дагестан</a>
        <iframe 
          src="https://yandex.ru/map-widget/v1/?ll=47.935889%2C42.488504&mode=search&oid=201915250712&ol=biz&sctx=ZAAAAAgBEAAaKAoSCUZ4exAC3ENAEdqSVRFunEdAEhIJDJQUWABT1j8ResTouYWuwj8iBgABAgMEBSgKOABA%2FocGSAFiOnJlYXJyPXNjaGVtZV9Mb2NhbC9HZW91cHBlci9BZHZlcnRzL0N1c3RvbU1heGFkdi9FbmFibGVkPTFiOnJlYXJyPXNjaGVtZV9Mb2NhbC9HZW91cHBlci9BZHZlcnRzL0N1c3RvbU1heGFkdi9NYXhhZHY9MTViQHJlYXJyPXNjaGVtZV9Mb2NhbC9HZW91cHBlci9BZHZlcnRzL01heGFkdlRvcE1peC9NYXhhZHZGb3JNaXg9MTBqAnJ1nQHNzMw9oAEAqAEAvQHREq5TggIUNyDQmtC%2B0L3RgtC40L3QtdC90YKKAgCSAgCaAgxkZXNrdG9wLW1hcHM%3D&sll=47.935889%2C42.488504&sspn=0.042705%2C0.019416&text=7%20%D0%9A%D0%BE%D0%BD%D1%82%D0%B8%D0%BD%D0%B5%D0%BD%D1%82&z=15.03" 
          width="100%" 
          height="100%" 
          frameBorder="1" 
          allowFullScreen={true} 
          style={{ position: 'relative', border: 'none' }}>
        </iframe>
      </div>
    </div>
  );
};

export default HouseMap;
