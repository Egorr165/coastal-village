import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { UserInfoModal } from '../components/UserInfoModal';
import { useOutletContext } from 'react-router-dom';
import './AdminTable.scss';

interface Review {
  id: number;
  user: number;
  user_name: string;
  user_first_name?: string;
  user_last_name?: string;
  cottage_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

const AdminReviews: React.FC = () => {
  const { refreshStats } = useOutletContext<any>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

  const toggleComment = (id: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const fetchReviews = async () => {
    try {
      const data = await adminService.getReviews();
      setReviews(data);
      await adminService.markReviewsViewed();
      refreshStats();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    const interval = setInterval(async () => {
        try {
            const data = await adminService.getReviews();
            setReviews(data);
        } catch (e) {
            console.error('Ошибка при фоновом обновлении отзывов', e);
        }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const quickReject = async (id: number) => {
    try {
      await adminService.bulkRejectReviews([id]);
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  const quickApprove = async (id: number) => {
    try {
      await adminService.approveReview(id);
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="admin-loading">Загрузка отзывов...</div>;

  return (
    <div className="admin-page fade-in">
      <div className="section-title-wrapper mb-20">
        <div className="title-line"></div>
        <h1 className="section-title h2">Отзывы</h1>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Автор</th>
              <th>Оценка</th>
              <th>Текст</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>
                  <strong className="user-clickable" onClick={() => setViewUserId(r.user)}>
                    {(r.user_first_name || r.user_last_name) ? `${r.user_first_name || ''} ${r.user_last_name || ''}`.trim() : r.user_name}
                  </strong>
                </td>
                <td>
                  <div>{r.cottage_name}</div>
                  <div className="admin-reviews__rating">⭐ {r.rating}</div>
                </td>
                <td className="admin-reviews__comment-cell">
                  <div 
                    onClick={() => {
                        if (r.comment.length > 80) toggleComment(r.id);
                    }}
                    className={`admin-reviews__comment ${r.comment.length > 80 ? 'admin-reviews__comment--clickable' : ''}`}
                    title={r.comment.length > 80 ? (expandedComments[r.id] ? "Нажмите чтобы свернуть" : "Нажмите чтобы развернуть") : ""}
                  >
                    {expandedComments[r.id] ? (
                      <>
                        {r.comment}{' '}
                        <span className="admin-reviews__comment-toggle">
                          скрыть
                        </span>
                      </>
                    ) : r.comment.length <= 80 ? (
                      r.comment
                    ) : (
                      <>
                        {r.comment.substring(0, 80)}...{' '}
                        <span className="admin-reviews__comment-toggle">
                          читать далее
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td>
                  <select 
                     className={`status-badge status-${r.is_approved ? 'confirmed' : 'cancelled'}`}
                     value={r.is_approved ? 'approved' : 'rejected'}
                     onChange={(e) => {
                       if (e.target.value === 'approved') quickApprove(r.id);
                       else quickReject(r.id);
                     }}
                  >
                     <option value="approved">Одобрен</option>
                     <option value="rejected">Не одобрен</option>
                  </select>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (<tr><td colSpan={5} className="admin-table__empty-cell">Нет данных</td></tr>)}
          </tbody>
        </table>
      </div>

      {viewUserId && <UserInfoModal userId={viewUserId} onClose={() => setViewUserId(null)} />}
    </div>
  );
};

export default AdminReviews;
