import React from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import './Profile.scss';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>Личный кабинет</h1>
        
        <div className="info-group">
          <label>Имя пользователя</label>
          <div className="value">{user.name}</div>
        </div>

        <div className="info-group">
          <label>Email пользователя</label>
          <div className="value">{user.email}</div>
        </div>

        {user.phone && (
          <div className="info-group">
            <label>Номер телефона</label>
            <div className="value">{user.phone}</div>
          </div>
        )}

        <div className="placeholder-msg">
            Здесь скоро появятся ваши бронирования и настройки.
        </div>
      </div>
    </div>
  );
};

export default Profile;
