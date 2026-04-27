import React from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { Sofa, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccountSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <aside className="account__sidebar">
      <div className="account-user">
        <div className="account-user__info">
          <span className="account-user__name">{user?.name || 'Пользователь'}</span>
          <div className="account-user__avatar">
            {user?.photo ? (
              <img src={user.photo} alt={user?.name || 'Avatar'} />
            ) : (
              <Sofa size={24} color="#5B86E5" />
            )}
          </div>
        </div>
      </div>

      <nav className="account-menu">
        <div className="account-menu__section">
          <h4 className="account-menu__title">Бронирование</h4>
          <ul className="account-menu__list">
            <li
              className={`account-menu__item ${activeTab === 'current' ? 'account-menu__item--active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              Текущие бронирования
            </li>
            <li
              className={`account-menu__item ${activeTab === 'history' ? 'account-menu__item--active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              История бронирования
            </li>
          </ul>
        </div>

        <div className="account-menu__section">
          <h4 className="account-menu__title">Отзывы</h4>
          <ul className="account-menu__list">
            <li
              className={`account-menu__item ${activeTab === 'reviews' ? 'account-menu__item--active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Мои отзывы
            </li>
          </ul>
        </div>

        <div className="account-menu__section">
          <h4 className="account-menu__title">Персональные данные</h4>
          <ul className="account-menu__list">
            <li
              className={`account-menu__item ${activeTab === 'personal' ? 'account-menu__item--active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              Персональные данные
            </li>
          </ul>
        </div>
      </nav>

      <div className="account__sidebar-footer">
        <button className="account__logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Выйти из аккаунта</span>
        </button>
      </div>
    </aside>
  );
};

export default AccountSidebar;
