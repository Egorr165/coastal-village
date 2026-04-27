import React, { useState, useEffect } from 'react';
import CottageCard from '../../../../components/CottageCard/CottageCard';
import { fetchHouses } from '../../../../services/availabilityService';
import type { House } from '../../../../types/house';
import './CottagesList.scss';

const CottagesList = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loadingHouses, setLoadingHouses] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchHouses()
      .then(data => {
        if (isMounted) {
          setHouses(data);
          setLoadingHouses(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoadingHouses(false);
      });
    return () => { isMounted = false; };
  }, []);

  const groupedHouses: Record<string, { house: House, count: number }> = {};
  houses.forEach(house => {
    if (!groupedHouses[house.type]) {
      groupedHouses[house.type] = { house, count: 1 };
    } else {
      groupedHouses[house.type].count++;
    }
  });

  return (
    <section id="cottages" className="cottages">
      <div className="container">
        <h2 className="cottages__title">Коттеджи 2-х видов</h2>

        {loadingHouses ? (
          <div className="cottages__loading">Загрузка домиков...</div>
        ) : (
          <div className="cottages__list">
            {groupedHouses['big'] && (
              <CottageCard
                id={String(groupedHouses['big'].house.id)}
                title="6-местный коттедж"
                capacity={groupedHouses['big'].house.capacity || 6}
                area={75}
                houseCount={groupedHouses['big'].count}
                price={groupedHouses['big'].house.pricePerNight}
                images={groupedHouses['big'].house.images?.length ? groupedHouses['big'].house.images : ['https://placehold.co/800x600?text=ФОТО+ИЗ+АДМИНКИ']}
              />
            )}

            {groupedHouses['small'] && (
              <CottageCard
                id={String(groupedHouses['small'].house.id)}
                title="4-местный коттедж"
                capacity={groupedHouses['small'].house.capacity || 4}
                area={36}
                houseCount={groupedHouses['small'].count}
                price={groupedHouses['small'].house.pricePerNight}
                images={groupedHouses['small'].house.images?.length ? groupedHouses['small'].house.images : ['https://placehold.co/800x600?text=ФОТО+ИЗ+АДМИНКИ']}
                isReversed={true}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CottagesList;
