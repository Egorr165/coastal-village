import React from 'react';
import { X, ExternalLink, MapPin } from 'lucide-react';
import './TransportModal.scss';

export type TransportType = 'bus' | 'car' | 'train' | 'taxi' | null;

interface TransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransportType;
}

const TransportModal: React.FC<TransportModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen || !type) return null;

  const renderContent = () => {
    switch (type) {
      case 'bus':
        return (
          <div className="transport-content">
            <h3>Поездка на автобусе</h3>
            <p>Удобный и доступный способ добраться до нашего комплекса.</p>
            <div className="location-info">
              <MapPin size={20} className="icon-accent" />
              <span>Северо-Кавказский федеральный округ, Республика Дагестан, Каякентский район, посёлок при станции Инчхе</span>
            </div>
            <div className="info-box">
              <p>Вы можете посмотреть актуальное расписание и купить билеты на сайтах наших партнеров.</p>
            </div>
            <div className="action-buttons">
              <a href="https://rasp.yandex.ru" target="_blank" rel="noreferrer" className="action-btn yandex">
                Яндекс Расписания <ExternalLink size={16} />
              </a>
              <a href="https://tutu.ru" target="_blank" rel="noreferrer" className="action-btn tutu">
                Tutu.ru <ExternalLink size={16} />
              </a>
            </div>
          </div>
        );
      case 'train':
        return (
          <div className="transport-content">
            <h3>Поездка на электричке</h3>
            <p>Быстрый способ доехать без пробок.</p>
            <div className="location-info">
              <MapPin size={20} className="icon-accent" />
              <span>Северо-Кавказский федеральный округ, Республика Дагестан, Каякентский район, посёлок при станции Инчхе</span>
            </div>
            <div className="info-box">
              <p>Узнайте актуальное расписание электричек и приобретите билеты онлайн.</p>
            </div>
            <div className="action-buttons">
              <a href="https://rasp.yandex.ru/suburban" target="_blank" rel="noreferrer" className="action-btn yandex">
                Электрички Яндекс <ExternalLink size={16} />
              </a>
            </div>
          </div>
        );
      case 'taxi':
        return (
          <div className="transport-content">
            <h3>Вызов такси</h3>
            <p>Доезжайте с комфортом прямо до дверей.</p>
            <div className="location-info">
              <MapPin size={20} className="icon-accent" />
              <span>Северо-Кавказский федеральный округ, Республика Дагестан, Каякентский район, посёлок при станции Инчхе</span>
            </div>
            <p className="hint">При нажатии на кнопку ниже, откроется приложение Яндекс Go с уже введенным адресом назначения.</p>
            <div className="action-buttons">
              <a href="https://go.yandex/ru_ru/" target="_blank" rel="noreferrer" className="action-btn yandex-go">
                Вызвать Яндекс Go <ExternalLink size={16} />
              </a>
            </div>
          </div>
        );
      case 'car':
        return (
          <div className="transport-content">
            <h3>Каршеринг</h3>
            <p>Возьмите автомобиль в аренду на время вашего отдыха.</p>
            <div className="location-info">
              <MapPin size={20} className="icon-accent" />
              <span>Северо-Кавказский федеральный округ, Республика Дагестан, Каякентский район, посёлок при станции Инчхе</span>
            </div>
            <div className="info-box warning">
              <p>Обратите внимание: перед завершением аренды убедитесь, что наша турбаза входит в разрешенную зону парковки выбранного сервиса.</p>
            </div>
            <div className="action-buttons">
              <a href="https://delimobil.ru" target="_blank" rel="noreferrer" className="action-btn delimobil">
                Делимобиль <ExternalLink size={16} />
              </a>
              <a href="https://yandex.ru/drive/" target="_blank" rel="noreferrer" className="action-btn yandex">
                Яндекс Драйв <ExternalLink size={16} />
              </a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="transport-modal-overlay" onClick={onClose}>
      <div className="transport-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default TransportModal;
