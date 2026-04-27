import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { adminService } from '../services/adminService';
import { CalendarModal } from '../../../components/CalendarModal/CalendarModal';
import { UserInfoModal } from '../components/UserInfoModal';
import { useOutletContext } from 'react-router-dom';
import { getFirstAvailableHouse, calculateStayPrice } from '../../../services/availabilityService';
import type { House } from '../../../types/house';
import './AdminTable.scss';

interface Booking {
  id: number;
  user: number;
  user_name: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email: string;
  cottage_name: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_price: string;
  status: string;
  special_requests?: string;
  cottage_type?: string;
  extra_bed_count?: number;
}

interface UserData {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
}

interface Cottage {
    id: number;
    title: string;
    type: string;
    pricePerNight: string;
}

const AdminBookings: React.FC = () => {
  const { stats, refreshStats } = useOutletContext<any>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [availableCottages, setAvailableCottages] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Модалка
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [viewUserId, setViewUserId] = useState<number | null>(null);

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
    setFormData({...formData, guest_phone: formatPhone(e.target.value)});
  };

  const initialFormState = {
      user: '',
      houseType: 'small' as 'small' | 'big',
      check_in_date: '',
      check_out_date: '',
      guests_count: 2,
      extra_bed_count: 0,
      status: 'confirmed',
      total_price: 0,
      guest_name: '',
      guest_phone: '',
      special_requests: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = () => {
      const offlineUser = availableUsers.find(u => u.email === 'offline@guest.local');
      setFormData({
          ...initialFormState,
          user: offlineUser ? offlineUser.id.toString() : ''
      });
      setIsModalOpen(true);
  };

  const fetchData = async () => {
    try {
      const [bookingsData, usersData, cottagesData] = await Promise.all([
          adminService.getBookings(),
          adminService.getUsers(),
          adminService.getCottages()
      ]);
      setBookings(bookingsData);
      setAvailableUsers(usersData);
      setAvailableCottages(cottagesData.map((c: any) => ({
          ...c,
          id: String(c.id),
          type: c.house_type,
          pricePerNight: Number(c.price_per_night),
          bookedRanges: c.bookedRanges || []
      })));
      
      if (refreshStats) refreshStats();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Авторасчет цены при изменении дат или типа домика
  useEffect(() => {
    if (formData.check_in_date && formData.check_out_date && formData.houseType && availableCottages.length > 0) {
      const anyHouseOfType = availableCottages.find(h => h.type === formData.houseType);
      if (anyHouseOfType) {
        let price = calculateStayPrice(anyHouseOfType.pricePerNight, formData.check_in_date, formData.check_out_date);
        
        // Учет дополнительных мест
        if (formData.extra_bed_count > 0) {
          const start = new Date(`${formData.check_in_date}T00:00:00.000Z`).getTime();
          const end = new Date(`${formData.check_out_date}T00:00:00.000Z`).getTime();
          const nights = Math.max(0, Math.floor((end - start) / (24 * 60 * 60 * 1000)));
          price += formData.extra_bed_count * 1500 * nights;
        }

        setFormData(prev => ({ ...prev, total_price: price }));
      }
    }
  }, [formData.check_in_date, formData.check_out_date, formData.houseType, formData.extra_bed_count, availableCottages]);

  useEffect(() => {
    fetchData();

    // Автоматическое обновление списка заявок каждые 10 секунд (Polling)
    const interval = setInterval(async () => {
        try {
            const bookingsData = await adminService.getBookings();
            setBookings(bookingsData);
        } catch (e) {
            console.error('Ошибка при фоновом обновлении бронирований', e);
        }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    adminService.markBookingsViewed(activeTab).then(() => {
        if (refreshStats) refreshStats();
    });
  }, [activeTab]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await adminService.updateBooking(id, { status: newStatus });
      fetchData();
    } catch (e) {
      console.error('Ошибка обновления статуса:', e);
      alert('Не удалось обновить статус');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const availableHouse = getFirstAvailableHouse(availableCottages, formData.houseType, formData.check_in_date, formData.check_out_date);
          
          if (!availableHouse) {
             alert(`На выбранные даты нет свободных домиков типа "${formData.houseType === 'big' ? 'Большой' : 'Малый'}".`);
             return;
          }

          const isOfflineGuest = formData.user === availableUsers.find(u => u.email === 'offline@guest.local')?.id?.toString();
          const finalSpecialRequests = isOfflineGuest 
              ? `ОФФЛАЙН КЛИЕНТ: Имя - ${formData.guest_name}, Телефон - ${formData.guest_phone}` + (formData.special_requests ? `\n\nКомментарий: ${formData.special_requests}` : '')
              : formData.special_requests;

          const submitData = {
              user: formData.user,
              cottage: availableHouse.id,
              check_in_date: formData.check_in_date,
              check_out_date: formData.check_out_date,
              guests_count: formData.guests_count,
              extra_bed_count: formData.extra_bed_count,
              status: formData.status,
              total_price: formData.total_price,
              special_requests: finalSpecialRequests
          };

          await adminService.createBooking(submitData);
          setIsModalOpen(false);
          fetchData();
          refreshStats();
      } catch (err) {
          console.error(err);
          alert('Ошибка при создании бронирования. Проверьте заполнение обязательных полей.');
      }
  };

  if (loading) return <div>Загрузка бронирований...</div>;

  const filteredBookings = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);

  return (
    <div className="admin-page fade-in">
      <div className="section-title-wrapper mb-20 admin-bookings__header">
        <div className="admin-bookings__title-group">
            <div className="title-line"></div>
            <h1 className="section-title h2">Бронирования</h1>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>+ Создать вручную</button>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Все</button>
        <button className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            Ожидают {stats?.unseen_pending_count > 0 && <span className="admin-badge">{stats.unseen_pending_count > 99 ? '99+' : stats.unseen_pending_count}</span>}
        </button>
        <button className={`admin-tab ${activeTab === 'confirmed' ? 'active' : ''}`} onClick={() => setActiveTab('confirmed')}>Подтверждены</button>
        <button className={`admin-tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Завершены</button>
        <button className={`admin-tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>
            Отменены {stats?.unseen_cancelled_count > 0 && <span className="admin-badge">{stats.unseen_cancelled_count > 99 ? '99+' : stats.unseen_cancelled_count}</span>}
        </button>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Гость (ФИО)</th>
              <th>Домик</th>
              <th>Детали домика</th>
              <th>Заезд</th>
              <th>Выезд</th>
              <th>Сумма</th>
              <th>Офлайн</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b.id}>
                <td>#{b.id}</td>
                <td>
                  <div className="user-clickable" onClick={() => setViewUserId(b.user)}>
                    <div><strong>{((b.user_first_name || b.user_last_name) ? `${b.user_first_name || ''} ${b.user_last_name || ''}` : b.user_name).replace('(Без регистрации)', '').trim()}</strong></div>
                    <div className="admin-bookings__user-email">{b.user_email}</div>
                  </div>
                </td>
                <td>{b.cottage_name}</td>
                <td>
                    <div className="admin-bookings__cottage-details">
                        <span className="admin-bookings__cottage-type">
                            {b.cottage_type === 'big' ? 'Большой' : (b.cottage_type === 'small' ? 'Малый' : 'Стандарт')}
                        </span>
                        <div className="admin-bookings__cottage-extra">
                            Доп. место:{' '}
                            {b.extra_bed_count && b.extra_bed_count > 0 ? (
                                <span className="admin-bookings__status-yes">Да</span>
                            ) : (
                                <span className="admin-bookings__status-no">Нет</span>
                            )}
                        </div>
                    </div>
                </td>
                <td>{b.check_in_date}</td>
                <td>{b.check_out_date}</td>
                <td>{b.total_price} ₽</td>
                <td className="admin-bookings__created-by-cell">
                    {b.user_email === 'offline@guest.local' ? (
                        <div className="custom-tooltip">
                          <span className="admin-bookings__status-yes">Да</span>
                          <div className="tooltip-text">{b.special_requests}</div>
                        </div>
                    ) : (
                        <span className="admin-bookings__status-no">Нет</span>
                    )}
                </td>
                <td>
                  <select 
                     className={`status-badge status-${b.status}`}
                     value={b.status}
                     onChange={(e) => handleStatusChange(b.id, e.target.value)}
                  >
                     {b.status === 'pending' && <option value="pending">Ожидает</option>}
                     <option value="confirmed">Подтверждено</option>
                     <option value="cancelled">Отменено</option>
                     {b.status === 'completed' && <option value="completed">Завершено</option>}
                  </select>
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (<tr><td colSpan={9} className="admin-bookings__empty-cell">Нет данных</td></tr>)}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>Ручное бронирование</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Пользователь</label>
                <select value={formData.user} onChange={e => setFormData({...formData, user: e.target.value, special_requests: ''})} required>
                  <option value="" disabled>Выберите пользователя</option>
                  
                  {availableUsers.find(u => u.email === 'offline@guest.local') && (
                      <option value={availableUsers.find(u => u.email === 'offline@guest.local')?.id} className="admin-bookings__offline-option">
                         ОФФЛАЙН КЛИЕНТ
                      </option>
                  )}
                  
                  <optgroup label="Зарегистрированные на сайте">
                      {availableUsers.filter(u => u.email !== 'offline@guest.local').map(u => (
                          <option key={u.id} value={u.id}>{u.email} ({u.first_name} {u.last_name})</option>
                      ))}
                  </optgroup>
                </select>
              </div>
              
              {formData.user === availableUsers.find(u => u.email === 'offline@guest.local')?.id?.toString() && (
                  <div className="form-group fade-in admin-bookings__guest-data">
                     <label className="admin-bookings__guest-label">Данные гостя <span className="admin-bookings__required">*</span></label>
                     <div className="admin-bookings__guest-inputs">
                         <input 
                            type="text" 
                            placeholder="Имя гостя (Например: Иван Иванов)" 
                            value={formData.guest_name}
                            onChange={e => setFormData({...formData, guest_name: e.target.value})}
                            required={formData.user === availableUsers.find(u => u.email === 'offline@guest.local')?.id?.toString()}
                            className="admin-bookings__guest-input"
                         />
                         <input 
                            type="text" 
                            placeholder="Номер телефона (+7...)" 
                            value={formData.guest_phone}
                            onChange={handlePhoneChange}
                            required={formData.user === availableUsers.find(u => u.email === 'offline@guest.local')?.id?.toString()}
                            className="admin-bookings__guest-input"
                         />
                     </div>
                  </div>
              )}
              <div className="form-group">
                <label>Тип домика</label>
                <select value={formData.houseType} onChange={e => setFormData({...formData, houseType: e.target.value as 'small'|'big'})} required>
                  <option value="small">Малый (4-местный)</option>
                  <option value="big">Большой (6-местный)</option>
                </select>
              </div>

              <div className="admin-bookings__row">
                  <div className="form-group admin-bookings__col">
                    <label>Дата заезда</label>
                    <div 
                       onClick={() => setActiveDatePicker('checkIn')}
                       className="admin-bookings__date-picker"
                    >
                       {formData.check_in_date || 'Выберите дату'}
                    </div>
                  </div>
                  <div className="form-group admin-bookings__col">
                    <label>Дата выезда</label>
                    <div 
                       onClick={() => {
                           if (!formData.check_in_date) {
                               alert('Сначала выберите дату заезда');
                               setActiveDatePicker('checkIn');
                           } else {
                               setActiveDatePicker('checkOut');
                           }
                       }}
                       className="admin-bookings__date-picker"
                    >
                       {formData.check_out_date || 'Выберите дату'}
                    </div>
                  </div>
              </div>

              <div className="admin-bookings__row">
                  <div className="form-group admin-bookings__col">
                    <label>Гостей</label>
                    <input type="number" min="1" max="10" value={formData.guests_count} onChange={e => setFormData({...formData, guests_count: parseInt(e.target.value) || 1})} required />
                  </div>
                  <div className="form-group admin-bookings__col">
                    <label>Доп. место (+1500 ₽/сут)</label>
                    <select value={formData.extra_bed_count} onChange={e => setFormData({...formData, extra_bed_count: parseInt(e.target.value) || 0})}>
                        <option value={0}>Нет</option>
                        <option value={1}>Да (1 место)</option>
                        <option value={2}>Да (2 места)</option>
                    </select>
                  </div>
              </div>

              <div className="form-group">
                <label>Сумма к оплате (₽)</label>
                <input type="number" value={formData.total_price} onChange={e => setFormData({...formData, total_price: parseInt(e.target.value) || 0})} required readOnly className="admin-bookings__input-readonly" />
                <small className="admin-bookings__hint">Рассчитывается автоматически</small>
              </div>

              <div className="form-group">
                  <label>Статус</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="pending">Ожидает подтверждения</option>
                      <option value="confirmed">Подтверждено</option>
                  </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary" disabled={!formData.check_in_date || !formData.check_out_date || !formData.user}>Создать</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {activeDatePicker && (
        <CalendarModal
            activeDatePicker={activeDatePicker}
            setActiveDatePicker={setActiveDatePicker}
            checkIn={formData.check_in_date}
            checkOut={formData.check_out_date}
            onDatesChange={(dates) => setFormData(prev => ({...prev, check_in_date: dates.checkIn, check_out_date: dates.checkOut}))}
            houseType={formData.houseType}
            houses={availableCottages}
        />
      )}

      {viewUserId && <UserInfoModal userId={viewUserId} onClose={() => setViewUserId(null)} />}

    </div>
  );
};

export default AdminBookings;
