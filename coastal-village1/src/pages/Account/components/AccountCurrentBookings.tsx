import React, { useState, useEffect } from 'react';
import { Home, Calendar, ArrowRight, ChevronUp } from 'lucide-react';
import AccountBookingCard, { Booking } from './AccountBookingCard';
import bookingService from '../../../services/bookingService';
import Button from '../../../components/Button/Button';

interface AccountCurrentBookingsProps {}

const AccountCurrentBookings: React.FC<AccountCurrentBookingsProps> = () => {
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval>;

    const fetchBookings = (showLoading = false) => {
      if (showLoading) setIsLoading(true);

      bookingService.getUpcomingBookings()
        .then(response => {
          if (!isMounted) return;
          const allBookings = Array.isArray(response) ? response : (response as any).results || [];
          
          const mappedBookings: Booking[] = allBookings.map((b: any) => {
            let cName = b.cottage_name || "";
            let houseNumStr = "1";
            if (cName.includes(' №')) {
              const splitArr = cName.split(' №');
              cName = splitArr[0];
              houseNumStr = splitArr[1];
            } else if (cName.includes('КОТТЕДЖ №')) {
              const splitArr = cName.split('КОТТЕДЖ №');
              cName = splitArr[0].trim() || 'Коттедж';
              houseNumStr = splitArr[1];
            }

            let statusRu = b.status;
            if (b.status === 'pending') statusRu = 'Ожидает подтверждения';
            if (b.status === 'confirmed') statusRu = 'Подтверждено';

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
              status: statusRu,
              totalPrice: Number(b.total_price),
              extras: { extraBedCount: b.extra_bed_count || 0 }
            };
          });

          mappedBookings.sort((a, b) => b.id - a.id);
          setCurrentBookings(mappedBookings);
          if (showLoading) setIsLoading(false);
        })
        .catch(err => {
          console.error("Ошибка загрузки текущих броней:", err);
          if (isMounted && showLoading) setIsLoading(false);
        });
    };

    fetchBookings(true); // Initial fetch with loading state
    intervalId = setInterval(() => fetchBookings(false), 10000); // Poll every 10 seconds without loading state

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (isLoading) {
    return <div className="booking-history"><p className="booking-history__loading-text">Загрузка...</p></div>;
  }

  if (currentBookings.length === 0) {
    return (
      <div className="booking-history__empty booking-history__empty--current">
        <h3 className="booking-history__empty-title">У вас пока нет текущих бронирований</h3>
        <p className="booking-history__empty-subtitle">Самое время запланировать незабываемый отдых на море!</p>
        <Button variant="secondary" size="lg" onClick={() => window.location.href='/catalog'}>
          Забронировать дом
        </Button>
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
      <div className="booking-history__list booking-history__list--mt-none">
        {currentBookings.map(booking => {
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
                    <span className={`booking-history__status ${booking.status === 'Ожидает подтверждения' ? 'booking-history__status--pending' : booking.status === 'Подтверждено' ? 'booking-history__status--confirmed' : 'booking-history__status--default'}`}>
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
                  <AccountBookingCard bookingData={booking} readOnly={false} />
                  <div className="booking-history__expanded-action">
                    <button
                      className="booking-history__action-btn booking-history__action-btn--collapse"
                      onClick={() => setExpandedId(null)}
                    >
                      Скрыть детали <ChevronUp size={16} />
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

export default AccountCurrentBookings;
