import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { ArrowRight, Wallet, Calendar, Users, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  revenue: { total: number, month: number };
  bookings: { total: number, month: number };
  users: { total: number, month: number };
  cottages: { active: number };
  recent_bookings: any[];
  chart_data: { date: string, revenue: number, bookings: number }[];
}

const formatPrice = (price: string | number) => {
  return Number(price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 });
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Ошибка загрузки статистики дашборда', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="admin-dashboard__loading">Загрузка дашборда...</div>;
  if (!stats) return <div className="admin-dashboard__error">Ошибка загрузки данных</div>;

  return (
    <div>
      <div className="section-title-wrapper">
        <div className="title-line"></div>
        <h1 className="section-title">Дашборд</h1>
      </div>

      {/* Карточки */}
      <div className="dashboard-cards">
        
        {/* Выручка */}
        <div className="dashboard-card">
          <div className="card-header">
            <span>Выручка за месяц</span>
            <div className="icon-wrapper blue">
              <Wallet size={21} strokeWidth={1.5} color="currentColor" />
            </div>
          </div>
          <div className="card-value">
            {formatPrice(stats.revenue.month)}
          </div>
          <div className="card-subtitle">
            <span className="bold">{formatPrice(stats.revenue.total)}</span> за всё время
          </div>
        </div>

        {/* Бронирования */}
        <div className="dashboard-card">
          <div className="card-header">
            <span>Броней в этом месяце</span>
            <div className="icon-wrapper yellow">
              <Calendar size={20} strokeWidth={1.5} color="currentColor" />
            </div>
          </div>
          <div className="card-value">
            {stats.bookings.month}
          </div>
          <div className="card-subtitle">
            <span className="bold">{stats.bookings.total}</span> за всё время
          </div>
        </div>

        {/* Пользователи */}
        <div className="dashboard-card">
          <div className="card-header">
            <span>Новые клиенты (месяц)</span>
            <div className="icon-wrapper indigo">
              <Users size={22} strokeWidth={1.5} color="currentColor" />
            </div>
          </div>
          <div className="card-value">
            {stats.users.month}
          </div>
          <div className="card-subtitle">
            <span className="bold">{stats.users.total}</span> за всё время
          </div>
        </div>

        {/* Домики */}
        <div className="dashboard-card">
          <div className="card-header">
            <span>Активных домиков</span>
            <div className="icon-wrapper green">
              <Home size={23} strokeWidth={1.5} color="currentColor" />
            </div>
          </div>
          <div className="card-value">
            {stats.cottages.active}
          </div>
          <div className="card-subtitle">
            Отображаются в каталоге
          </div>
        </div>

      </div>

      {/* График Выручки */}
      <div className="dashboard-section">
        <h2>Динамика выручки (последние 14 дней)</h2>
        <div className="dashboard-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip 
                formatter={(value: any) => [formatPrice(value), 'Выручка']} 
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Таблица последних бронирований */}
      <div className="dashboard-section dashboard-section--last">
        <div className="section-header">
          <h2>Последние бронирования</h2>
          <button 
            onClick={() => navigate('/admin/bookings')}
            className="btn-link"
          >
            Смотреть все <ArrowRight size={16} />
          </button>
        </div>

        {stats.recent_bookings.length > 0 ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Клиент</th>
                  <th>Домик</th>
                  <th>Даты</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_bookings.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>
                      <strong className="admin-table__user-name">{b.user_first_name} {b.user_last_name}</strong>
                    </td>
                    <td>{b.cottage_name}</td>
                    <td>{b.check_in_date} - {b.check_out_date}</td>
                    <td><strong>{formatPrice(b.total_price)}</strong></td>
                    <td>
                      <span className={`status-badge status-${b.status}`}>
                        {b.status === 'confirmed' ? 'Подтверждено' : 
                         b.status === 'pending' ? 'Ожидает' : 
                         b.status === 'completed' ? 'Завершено' : 'Отменено'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-section__empty">Пока нет бронирований</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
