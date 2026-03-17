import React from 'react';
import './HouseConditions.scss';

const HouseConditions: React.FC = () => {
  return (
    <div className="conditions-box">
      <h3>Условия</h3>
      <ul className="conditions-list">
        <li>Все включено (нет обязательных дополнительных плат)</li>
        <li>Курение разрешено строго в отведенных местах</li>
        <li>Просим вас соблюдать тишину в период с 23:00 до 08:00</li>
        <li>Смена постельного белья и полотенец производится 1 раз в 3 дня (чаще по требованию).</li>
        <li>Пожалуйста, бережно относитесь к имуществу гостевого дома. В случае причинения ущерба, вам необходимо будет возместить его стоимость.</li>
      </ul>
    </div>
  );
};

export default HouseConditions;
