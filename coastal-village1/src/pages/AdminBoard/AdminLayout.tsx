import React, { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { adminService } from './services/adminService';
import './AdminLayout.scss';

export interface AdminStats {
    pending_bookings_count: number;
    unseen_pending_count: number;
    unseen_cancelled_count: number;
    pending_reviews_count: number;
    pending_contacts_count: number;
    unseen_users_count: number;
    latest_booking_id: number;
    latest_review_id: number;
    latest_contact_id: number;
    latest_user_id: number;
}

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats>({ 
      pending_bookings_count: 0, 
      unseen_pending_count: 0,
      unseen_cancelled_count: 0,
      pending_reviews_count: 0, 
      pending_contacts_count: 0, 
      unseen_users_count: 0,
      latest_booking_id: 0, 
      latest_review_id: 0,
      latest_contact_id: 0,
      latest_user_id: 0
    });
  const [toasts, setToasts] = useState<{id: number, message: React.ReactNode}[]>([]);
  const prevStats = useRef<AdminStats | null>(null);

  // Глобальный пуллинг
  useEffect(() => {
     let isMounted = true;
     const fetchStats = async () => {
        try {
           const data = await adminService.getStats();
           if (!isMounted) return;
           
           if (prevStats.current) {
              if (data.latest_booking_id > prevStats.current.latest_booking_id) {
                  const id = Date.now();
                  setToasts(t => [...t, {id, message: <><span className="toast-icon">🛎️</span> Новое бронирование!</>}]);
                  setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
              }
              if (data.unseen_cancelled_count > prevStats.current.unseen_cancelled_count) {
                  const id = Date.now() + 1;
                  setToasts(t => [...t, {id, message: <><span className="toast-icon">❌</span> Бронирование отменено!</>}]);
                  setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
              }
              if (data.latest_review_id > prevStats.current.latest_review_id) {
                  const id = Date.now() + 2;
                  setToasts(t => [...t, {id, message: <><span className="toast-icon">💬</span> Новый отзыв!</>}]);
                  setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
              }
              if (data.latest_contact_id > prevStats.current.latest_contact_id) {
                  const id = Date.now() + 3;
                  setToasts(t => [...t, {id, message: <><span className="toast-icon">📞</span> Новая заявка на связь!</>}]);
                  setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
              }
              if (data.latest_user_id > prevStats.current.latest_user_id) {
                  const id = Date.now() + 4;
                  setToasts(t => [...t, {id, message: <><span className="toast-icon">👤</span> Новый пользователь!</>}]);
                  setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
              }
           }
           
           prevStats.current = data;
           setStats(data);
        } catch(e) {}
     };

     // Первый запрос
     fetchStats();
     // Повторяем каждые 10 секунд
     const interval = setInterval(fetchStats, 10000); 
     return () => { isMounted = false; clearInterval(interval); }
  }, []);

  const refreshStats = async () => {
      try {
          const data = await adminService.getStats();
          setStats(data);
          prevStats.current = data;
      } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <h2><span className="text-accent">7continent</span> Admin</h2>
        </div>
        
        <nav className="admin-sidebar__nav">
          <NavLink to="/admin-board" end className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            Дашборд
          </NavLink>
          <NavLink to="/admin-board/bookings" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <div className="nav-link-content">
                <span>Бронирования</span>
                {stats.pending_bookings_count > 0 && (
                    <span className="admin-badge">{stats.pending_bookings_count > 99 ? '99+' : stats.pending_bookings_count}</span>
                )}
            </div>
          </NavLink>
          <NavLink to="/admin-board/cottages" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            Домики
          </NavLink>
          <NavLink to="/admin-board/reviews" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <div className="nav-link-content">
                <span>Отзывы</span>
                {stats.pending_reviews_count > 0 && (
                    <span className="admin-badge">{stats.pending_reviews_count > 99 ? '99+' : stats.pending_reviews_count}</span>
                )}
            </div>
          </NavLink>
          <NavLink to="/admin-board/users" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <div className="nav-link-content">
                <span>Пользователи</span>
                {stats.unseen_users_count > 0 && (
                    <span className="admin-badge">{stats.unseen_users_count > 99 ? '99+' : stats.unseen_users_count}</span>
                )}
            </div>
          </NavLink>
          <NavLink to="/admin-board/contacts" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <div className="nav-link-content">
                <span>Заявки</span>
                {stats.pending_contacts_count > 0 && (
                    <span className="admin-badge">{stats.pending_contacts_count > 99 ? '99+' : stats.pending_contacts_count}</span>
                )}
            </div>
          </NavLink>
        </nav>
        
        <div className="admin-sidebar__footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            Выйти
          </button>
        </div>
      </aside>

      <div className="admin-main">
        {toasts.length > 0 && (
           <div className="admin-toasts">
             {toasts.map(t => (
                <div key={t.id} className="admin-toast slide-in">{t.message}</div>
             ))}
           </div>
        )}

        <header className="admin-header">
          <div className="admin-header__user">
            Администратор: <strong>{user?.name || user?.email}</strong>
          </div>
        </header>

        <div className="admin-content fade-in">
          <Outlet context={{ stats, refreshStats }} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
