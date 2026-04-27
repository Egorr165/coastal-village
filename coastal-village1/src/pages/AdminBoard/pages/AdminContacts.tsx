import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { useOutletContext } from 'react-router-dom';
import './AdminTable.scss';

interface ContactRequest {
  id: number;
  name: string;
  phone: string;
  status: string;
  created_at: string;
  manager_comment: string | null;
}

const AdminContacts: React.FC = () => {
  const { stats, refreshStats } = useOutletContext<any>();
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'COMPLETED'>('ALL');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const fetchContacts = async () => {
    try {
      const data = await adminService.getContacts();
      setContacts(data);
      await adminService.markContactsViewed();
      if (refreshStats) refreshStats();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();

    const interval = setInterval(fetchContacts, 10000);
    return () => clearInterval(interval);
  }, []);

  const executeSingleAction = async (id: number, status: string) => {
    try {
      await adminService.bulkUpdateContactStatus([id], status);
      fetchContacts();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Загрузка заявок...</div>;

  const filteredContacts = activeTab === 'ALL' ? contacts : contacts.filter(c => c.status === activeTab);

  return (
    <div className="admin-page fade-in">
      <div className="section-title-wrapper mb-20">
        <div className="title-line"></div>
        <h1 className="section-title h2">Заявки</h1>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>Все</button>
        <button className={`admin-tab ${activeTab === 'NEW' ? 'active' : ''}`} onClick={() => setActiveTab('NEW')}>
            Новые {stats?.pending_contacts_count > 0 && <span className="admin-badge">{stats.pending_contacts_count > 99 ? '99+' : stats.pending_contacts_count}</span>}
        </button>
        <button className={`admin-tab ${activeTab === 'COMPLETED' ? 'active' : ''}`} onClick={() => setActiveTab('COMPLETED')}>Завершены</button>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(c => (
              <tr 
                key={c.id} 
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
                <td><strong>{c.name}</strong></td>
                <td>{c.phone}</td>
                   <td className="td-relative">
                     <span className={`status-badge status-${c.status === 'COMPLETED' ? 'completed' : 'pending'} ${hoveredId === c.id && c.status !== 'COMPLETED' ? 'hidden' : ''}`}>
                        {c.status === 'COMPLETED' ? 'Завершена' : 'Новая'}
                    </span>
                    {hoveredId === c.id && c.status !== 'COMPLETED' && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); executeSingleAction(c.id, 'COMPLETED'); }} 
                            className="btn-hover-action">
                            Завершить заявку
                        </button>
                    )}
                </td>
              </tr>
            ))}
            {filteredContacts.length === 0 && (
                <tr>
                    <td colSpan={4} className="empty-state">Пусто</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminContacts;
