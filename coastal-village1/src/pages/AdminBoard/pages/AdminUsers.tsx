import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { UserInfoModal } from '../components/UserInfoModal';
import './AdminTable.scss';

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
}

const AdminUsers: React.FC = () => {
  const { refreshStats } = useOutletContext<{ refreshStats: () => void }>();
  const [users, setUsers] = useState<UserData[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  
  const [searchPhone, setSearchPhone] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        await adminService.markUsersViewed();
        if (showLoading && isMounted) {
            refreshStats();
        }

        const [uData, bData] = await Promise.all([
          adminService.getUsers(),
          adminService.getBookings()
        ]);
        if (isMounted) {
          setUsers(uData);
          setBookings(bData);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          console.error('Ошибка при фоновом обновлении пользователей:', e);
          setLoading(false);
        }
      }
    };

    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const toggleRow = (userId: number) => {
    setExpandedRows(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleToggleBlock = async (user: UserData) => {
    const action = user.is_active ? 'заблокировать' : 'разблокировать';
    try {
      await adminService.updateUser(user.id, { is_active: !user.is_active });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !user.is_active } : u));
    } catch (e) {
      console.error(`Ошибка при попытке ${action} пользователя:`, e);
      alert(`Не удалось ${action} пользователя.`);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    if (limited.length <= 1) return limited.length === 1 ? '+7 (' : '';

    let formatted = '+7 (';

    if (limited.length > 1) {
      const start = (limited[0] === '7' || limited[0] === '8') ? 1 : 0;
      const areaCode = limited.slice(start, start + 3);
      formatted += areaCode;

      if (limited.length > start + 3) {
        formatted += ') ' + limited.slice(start + 3, start + 6);

        if (limited.length > start + 6) {
          formatted += '-' + limited.slice(start + 6, start + 8);

          if (limited.length > start + 8) {
            formatted += '-' + limited.slice(start + 8, start + 10);
          }
        }
      }
    }

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchPhone(formatPhone(e.target.value));
  };

  const isValidPhone = searchPhone.length === 0 || searchPhone.length === 18;

  const offlineGuest = users.find(u => u.username === 'offline_guest');
  const staffUsers = users.filter(u => u.is_staff && u.username !== 'offline_guest');
  const regularUsers = users.filter(u => !u.is_staff && u.username !== 'offline_guest');

  const filteredRegularUsers = regularUsers.filter(u => {
      // Фильтр по поиску номера
      if (searchPhone) {
          const cleanSearch = searchPhone.replace(/\D/g, '');
          const cleanPhone = (u.phone || '').replace(/\D/g, '');
          if (!cleanPhone.includes(cleanSearch)) return false;
      }
      
      // Фильтр по вкладке
      if (activeTab === 'ACTIVE' && !u.is_active) return false;
      if (activeTab === 'BLOCKED' && u.is_active) return false;
      
      return true;
  });

  const displayedUsers = [];
  if (activeTab === 'ALL') {
      if (offlineGuest) displayedUsers.push(offlineGuest);
      displayedUsers.push(...staffUsers);
  }
  displayedUsers.push(...filteredRegularUsers);

  if (loading) return <div className="admin-loading">Загрузка пользователей...</div>;

  return (
    <div className="admin-page fade-in">
      <div className="section-title-wrapper mb-20 section-title-wrapper--between">
        <div className="admin-header-group">
          <div className="title-line"></div>
          <h1 className="section-title h2" style={{margin: 0}}>Пользователи</h1>
        </div>
        
        <div className="admin-search-wrapper">
           <input 
              type="tel"
              placeholder="+7 (999) 999-99-99"
              value={searchPhone}
              onChange={handlePhoneChange}
              className={`admin-search-input ${!isValidPhone ? 'error' : ''}`}
           />
           {!isValidPhone && (
              <span className="admin-search-error">
                 Введите номер полностью для точного поиска
              </span>
           )}
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>Все</button>
        <button className={`admin-tab ${activeTab === 'ACTIVE' ? 'active' : ''}`} onClick={() => setActiveTab('ACTIVE')}>Активные</button>
        <button className={`admin-tab ${activeTab === 'BLOCKED' ? 'active' : ''}`} onClick={() => setActiveTab('BLOCKED')}>Заблокированные</button>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table__col-small"></th>
              <th>ID</th>
              <th>Пользователь (ФИО)</th>
              <th>Email / Phone</th>
              <th>Роль</th>
              <th>Статус</th>
              <th className="admin-table__col-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map((u, index) => {
              const userBookings = bookings.filter(b => b.user === u.id);
              const isExpanded = expandedRows.includes(u.id);
              const isOfflineGuest = u.username === 'offline_guest';
              
              return (
              <React.Fragment key={u.id}>
                <tr className={`${isExpanded ? 'expanded-parent-row' : ''} ${isOfflineGuest ? 'system-user' : ''}`}>
                  <td className="admin-table__toggle-cell" onClick={() => toggleRow(u.id)}>
                     {isExpanded ? '▼' : '▶'}
                  </td>
                  <td>#{u.id}</td>
                  <td>
                      <strong className="user-clickable" onClick={() => setViewUserId(u.id)}>
                          {(u.first_name || u.last_name) ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                      </strong>
                  </td>
                  <td>
                    <div>{u.email}</div>
                    <div className="admin-users__phone">{u.phone}</div>
                  </td>
                  <td>{u.is_staff ? <span className="admin-users__role admin-users__role--admin">Администратор</span> : isOfflineGuest ? <span className="admin-users__role admin-users__role--system">Системный</span> : 'Пользователь'}</td>
                  <td>
                      <span className={`status-badge status-${u.is_active}`}>
                          {isOfflineGuest ? 'Системный' : u.is_active ? 'Активен' : 'Заблокирован'}
                      </span>
                  </td>
                  <td className="admin-table__col-right">
                     {!isOfflineGuest && !u.is_staff && (
                         <button 
                             onClick={(e) => { e.stopPropagation(); handleToggleBlock(u); }}
                             className={`btn-text ${u.is_active ? 'danger' : 'success'}`}
                             title={u.is_active ? "Заблокировать пользователя" : "Разблокировать пользователя"}
                         >
                            {u.is_active ? 'Заблокировать' : 'Разблокировать'}
                         </button>
                     )}
                  </td>
                </tr>
                {isExpanded && (
                   <tr className="expanded-child-row">
                      <td colSpan={7}>
                         <div className="admin-inner-card">
                             <h4>История бронирований ({userBookings.length})</h4>
                             {userBookings.length > 0 ? (
                                 <table className="admin-table inner-table">
                                    <thead>
                                       <tr>
                                          <th>ID</th>
                                          <th>Коттедж</th>
                                          <th>Даты</th>
                                          <th>Гости</th>
                                          <th>Сумма</th>
                                          <th>Статус</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {userBookings.map(b => (
                                           <tr key={b.id}>
                                               <td>#{b.id}</td>
                                               <td>{b.cottage_name}</td>
                                               <td>{b.check_in_date} — {b.check_out_date}</td>
                                               <td>{b.guests_count} чел.</td>
                                               <td className="admin-table__price-cell">{b.total_price} ₽</td>
                                               <td>
                                                  <span className={`status-badge status-${b.status}`}>
                                                      {b.status === 'pending' ? 'Ожидает' : b.status === 'confirmed' ? 'Подтверждено' : b.status === 'cancelled' ? 'Отменено' : 'Завершено'}
                                                  </span>
                                               </td>
                                           </tr>
                                       ))}
                                    </tbody>
                                 </table>
                             ) : (
                                 <div className="admin-table__empty-state">У этого пользователя пока нет бронирований</div>
                             )}
                         </div>
                      </td>
                   </tr>
                )}
              </React.Fragment>
            )})}
            {displayedUsers.length === 0 && (
               <tr>
                  <td colSpan={7} className="admin-table__empty-cell">
                     Пользователи не найдены
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewUserId && <UserInfoModal userId={viewUserId} onClose={() => setViewUserId(null)} />}
    </div>
  );
};

export default AdminUsers;
