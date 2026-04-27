import React, { useState, useEffect } from 'react';
import { ChevronDown, Home, Calendar, ArrowRight, ChevronUp } from 'lucide-react';
import AccountBookingCard, { Booking } from './AccountBookingCard';
import bookingService from '../../../services/bookingService';

interface AccountBookingHistoryProps {}

const AccountBookingHistory: React.FC<AccountBookingHistoryProps> = () => {
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval>;

    const fetchHistory = (showLoading = false) => {
      if (showLoading) setIsLoading(true);

      bookingService.getMyBookings()
        .then(response => {
          if (!isMounted) return;
          const allBookings = Array.isArray(response) ? response : (response as any).results || [];
          
          // Фильтруем отмененные и завершенные
          const historyData = allBookings.filter((b: any) => b.status === 'cancelled' || b.status === 'completed');
          
          const statusMap: Record<string, string> = {
            'pending': 'Ожидает подтверждения',
            'confirmed': 'Подтверждено',
            'cancelled': 'Отменено',
            'completed': 'Завершено'
          };

          const mappedBookings: Booking[] = historyData.map((b: any) => {
            let cName = b.cottage_name || "";
            let houseNumStr = "";
            if (cName.includes(' №')) {
              const splitArr = cName.split(' №');
              cName = splitArr[0];
              houseNumStr = splitArr[1];
            } else if (cName.includes('КОТТЕДЖ №')) {
              const splitArr = cName.split('КОТТЕДЖ №');
              cName = splitArr[0].trim() || 'Коттедж';
              houseNumStr = splitArr[1];
            }

            return {
              id: b.id,
              complexName: "7 континент",
              cottageName: cName,
              houseNumStr: houseNumStr,
              checkIn: b.check_in_date,
              checkOut: b.check_out_date,
              checkInTime: "14:00",
              checkOutTime: "12:00",
              nights: b.nights_count,
              status: statusMap[b.status] || b.status,
              totalPrice: Number(b.total_price),
              extras: { extraBedCount: b.extra_bed_count || 0 }
            };
          });

          mappedBookings.sort((a, b) => b.id - a.id);
          setHistoryBookings(mappedBookings);
          if (showLoading) setIsLoading(false);
        })
        .catch(err => {
          console.error("Ошибка загрузки истории:", err);
          if (isMounted && showLoading) setIsLoading(false);
        });
    };

    fetchHistory(true); // Initial fetch with loading state
    intervalId = setInterval(() => fetchHistory(false), 10000); // Poll every 10 seconds without loading state

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const years = Array.from(new Set(historyBookings.map(b => parseInt(b.checkIn.substring(0, 4))))).sort((a, b) => b - a);

  const filteredBookings = filterYear === 'all'
    ? historyBookings
    : historyBookings.filter(b => parseInt(b.checkIn.substring(0, 4)) === filterYear);

  if (isLoading) {
    return <div className="booking-history"><p className="booking-history__loading-text">Загрузка истории...</p></div>;
  }

  if (historyBookings.length === 0) {
    return (
      <div className="booking-history">
        <div className="booking-history__empty">
          <h3>История пуста</h3>
          <p className="booking-history__empty-text">У вас пока нет отмененных или завершенных бронирований.</p>
        </div>
      </div>
    );
  }

  const formatDateLabel = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    return dateStr;
  };

  return (
    <div className="booking-history">
      <div className="booking-history__filters">
        <button
          className={`booking-history__filter-btn ${filterYear === 'all' ? 'booking-history__filter-btn--active' : ''}`}
          onClick={() => setFilterYear('all')}
        >
          Все брони
        </button>

        <div className="booking-history__dropdown">
          <button
            className={`booking-history__filter-btn booking-history__filter-btn--dropdown ${filterYear !== 'all' ? 'booking-history__filter-btn--active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {filterYear === 'all' ? 'Год' : filterYear}
            <ChevronDown size={16} className={isDropdownOpen ? 'booking-history__icon--rotate' : ''} />
          </button>

          {isDropdownOpen && (
            <div className="booking-history__dropdown-menu">
              <div
                className="booking-history__dropdown-item"
                onClick={() => { setFilterYear('all'); setIsDropdownOpen(false); }}
              >
                Все годы
              </div>
              {years.map(year => (
                <div
                  key={year}
                  className="booking-history__dropdown-item"
                  onClick={() => { setFilterYear(year); setIsDropdownOpen(false); }}
                >
                  {year}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="booking-history__list">
        {filteredBookings.map(booking => {
          const isExpanded = expandedId === booking.id;
          
          return (
            <div 
              key={booking.id} 
              className={`booking-history__card ${isExpanded ? 'booking-history__card--expanded' : ''}`}
            >
              {!isExpanded ? (
                <>
                  <div className="booking-history__card-header">
                    <span className="booking-history__card-id">Заявка №{booking.id}</span>
                    <span className={`booking-history__status ${booking.status === 'Отменено' ? 'booking-history__status--cancelled' : 'booking-history__status--default'}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="booking-history__card-body">
                    <div className="booking-history__card-detail">
                      <Home size={18} className="booking-history__card-icon" />
                      <span className="booking-history__card-text">{booking.cottageName} {booking.houseNumStr ? `№${booking.houseNumStr}` : ''}</span>
                    </div>
                    <div className="booking-history__card-detail">
                      <Calendar size={18} className="booking-history__card-icon" />
                      <span className="booking-history__card-text">{formatDateLabel(booking.checkIn)} — {formatDateLabel(booking.checkOut)}</span>
                    </div>
                  </div>

                  <div className="booking-history__card-footer">
                    <div className="booking-history__card-price">
                      <span className="booking-history__price-label">Итого:</span>
                      <span className="booking-history__price-value">{booking.totalPrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <button
                      className="booking-history__action-btn"
                      onClick={() => setExpandedId(booking.id)}
                    >
                      Подробнее <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="booking-history__expanded-content">
                  <AccountBookingCard bookingData={booking} readOnly={true} />
                  <div className="booking-history__expanded-action">
                    <button
                      className="booking-history__action-btn booking-history__action-btn--collapse"
                      onClick={() => setExpandedId(null)}
                    >
                      Скрыть <ChevronUp size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountBookingHistory;
