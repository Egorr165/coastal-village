import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { adminService } from '../services/adminService';
import '../pages/AdminTable.scss';

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export const UserInfoModal: React.FC<{userId: number, onClose: () => void}> = ({ userId, onClose }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getUser(userId).then(data => {
            setUser(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        })
    }, [userId]);

    return createPortal(
        <div className="admin-modal-overlay">
            <div className="admin-modal admin-modal--medium">
                <div className="admin-modal-header">
                    <h2>Информация о пользователе</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                {loading ? <p>Загрузка...</p> : user ? (
                    <div>
                        <div className="user-info-grid">
                            <strong className="info-label">ID:</strong> <span>#{user.id}</span>
                            <strong className="info-label">Логин:</strong> <span>{user.username}</span>
                            <strong className="info-label">ФИО:</strong> <span>{user.first_name} {user.last_name || ''}</span>
                            <strong className="info-label">Email:</strong> <span>{user.email || '—'}</span>
                            <strong className="info-label">Телефон:</strong> <span>{user.phone || '—'}</span>
                            <strong className="info-label">Роль:</strong> <span>{user.is_staff ? <span className="admin-users__role admin-users__role--admin">Администратор</span> : 'Пользователь'}</span>
                            <strong className="info-label">Статус:</strong> <span>{user.is_active ? '✅ Активен' : '❌ Заблокирован'}</span>
                            <strong className="info-label">Регистрация:</strong> <span>{new Date(user.date_joined).toLocaleDateString()}</span>
                        </div>
                        <div className="modal-actions user-info-actions">
                            <button className="btn btn-primary btn--full-width" onClick={onClose}>Закрыть</button>
                        </div>
                    </div>
                ) : <p>Пользователь не найден</p>}
            </div>
        </div>,
        document.body
    )
}
