import React from 'react';
import './HouseDescription.scss';

interface HouseDescriptionProps {
  description?: string;
}

const HouseDescription: React.FC<HouseDescriptionProps> = ({ description }) => {
  return (
    <div className="description-text">
      <h3>Описание</h3>
      <p>В каждом номере есть всё необходимое для комфортного проживания:</p>
      <ul className="description-list">
        <li>Собственная кухня с необходимой техникой</li>
        <li>2 уютные спальни и современная мягкая мебель</li>
        <li>Быстрый и безлимитный Wi-Fi</li>
        <li>2 сплит-системы для поддержания идеального климата</li>

      </ul>
      <p>
        Закрытая территория защитит вас от шума центральных улиц, обеспечивая безопасность, покой и настоящий релакс на побережье Дагестана.
      </p>
    </div>
  );
};

export default HouseDescription;
