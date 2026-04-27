import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Plus, Calendar, ShieldCheck, Handshake, CalendarCheck, ConciergeBell } from 'lucide-react';

import './Booking.scss';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BookingCalendar from '../../components/BookingCalendar/BookingCalendar';
import ContactForm from '../../components/ContactForm/ContactForm';
import BookingConfirmationModal, { BookingDetails } from '../../components/BookingConfirmationModal/BookingConfirmationModal';
import bookingService from '../../services/bookingService';
import { useToastStore } from '../../store/useToastStore';

const Booking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useToastStore(state => state.addToast);

  const [selectedHouseType, setSelectedHouseType] = useState<'big' | 'small'>('big');

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [orderNumber, setOrderNumber] = useState<number>(0);
  
  const [houses, setHouses] = useState<any[]>([]);

  useEffect(() => {
    import('../../services/availabilityService').then(({ fetchHouses }) => {
      fetchHouses().then(setHouses).catch(console.error);
    });
  }, []);

  useEffect(() => {
    if (user) {
      const pendingDataStr = sessionStorage.getItem('pendingBookingDetails');
      if (pendingDataStr) {
        try {
          const pendingData = JSON.parse(pendingDataStr);
          setBookingDetails(pendingData);
          bookingService.getNextBookingId().then(id => setOrderNumber(id)).catch(() => setOrderNumber(Math.floor(1000 + Math.random() * 9000)));
          setIsModalOpen(true);
        } catch (e) {
          console.error('Ошибка при восстановлении брони', e);
        }
        sessionStorage.removeItem('pendingBookingDetails');
      }
    }
  }, [user]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleBeforeBooking = (): boolean => {
    return true; // Разрешаем открыть модалку, не требуя заполнить форму
  };

  const handleBookClick = async (details: BookingDetails) => {
    try {
        const nextId = await bookingService.getNextBookingId();
        setOrderNumber(nextId);
    } catch {
        setOrderNumber(Math.floor(1000 + Math.random() * 9000));
    }
    setBookingDetails(details);
    setIsModalOpen(true);
  };

  const handleConfirmOrder = async (finalData?: any) => {
    if (!bookingDetails) return;
    
    // Ensure we have a valid numeric cottage ID
    const cottageId = parseInt(bookingDetails.houseId);
    
    if (isNaN(cottageId)) {
        addToast('К сожалению, произошла ошибка идентификации коттеджа. Пожалуйста, попробуйте выбрать конкретный коттедж в каталоге.', 'error');
        setIsModalOpen(false);
        return;
    }

    const payload = {
        cottage: cottageId,
        check_in_date: bookingDetails.checkIn,
        check_out_date: bookingDetails.checkOut,
        guests_count: selectedHouseType === 'big' ? 6 : 4,
        extra_bed_count: bookingDetails.extras.extraBed ? 1 : 0,
        special_requests: finalData?.phone 
            ? `Имя: ${finalData.name}, Телефон: ${finalData.phone}, Email: ${finalData.email}`
            : ''
    };

    try {
        await bookingService.createBooking(payload);
        addToast('Заявка успешно принята! Ожидайте звонка менеджера в течение 15 минут для уточнения деталей вашего отдыха.', 'success');
        setIsModalOpen(false);
        // Очищаем форму бронирования
        setBookingDetails(null);
        navigate('/account');
    } catch (error) {
        console.error('Ошибка при создании бронирования:', error);
        addToast('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте связаться с нами по телефону.', 'error');
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-page__hero-wrapper">
        <Header />

        <section className="booking-hero">
          <div className="booking-hero__overlay"></div>
          <div className="booking-hero__container">
            <h1 className="booking-hero__title">
              Забронируйте свой <br />
              идеальный отдых
            </h1>
            <p className="booking-hero__subtitle">
              Всего 5 шагов до отпуска <br />
              вашей мечты
            </p>

            <div className="booking-hero__features">
              <div className="booking-hero__feature">
                <div className="booking-hero__feature-icon-wrapper">
                  <Calendar size={28} strokeWidth={2} color="var(--color-primary)" />
                </div>
                <span>Бесплатная отмена за 14 дней до заезда</span>
              </div>
              <div className="booking-hero__feature">
                <div className="booking-hero__feature-icon-wrapper">
                  <ShieldCheck size={30} strokeWidth={2} color="var(--color-primary)" />
                </div>
                <span>Прозрачная система бронирования</span>
              </div>
            </div>

            <button className="btn-secondary ui-button--lg booking-hero__btn" onClick={() => navigate('/catalog')}>ВЫБРАТЬ КОТТЕДЖ</button>
          </div>
        </section>
      </div>

      <main className="container booking-content">
        <div className="booking-content__main">
          <section className="booking-section">
            <h2 className="booking-title">
              Ваше идеальное путешествие на <br /> Каспий начинается здесь.
            </h2>
            <p className="booking-section__desc">
              Мы сделали процесс бронирования максимально простым и прозрачным.
              Всего за несколько минут вы оформите тот самый отдых, о котором мечтали.
            </p>

            <div className="booking-features">
              <div className="booking-features__card">
                <div className="booking-features__icon booking-features__icon--blue">
                  <Handshake size={32} strokeWidth={1.5} color="white" />
                </div>
                <div>
                  <h3 className="booking-features__title">Выбирайте честно</h3>
                  <p className="booking-features__text">
                    Видите точную стоимость сразу. В окончательную цену уже включено всё: уборка,
                    постельное бельё, коммунальные услуги. Никаких сюрпризов при заезде.
                  </p>
                </div>
              </div>

              <div className="booking-features__card">
                <div className="booking-features__icon booking-features__icon--shield">
                  <CalendarCheck size={32} strokeWidth={1.5} color="white" />
                </div>
                <div>
                  <h3 className="booking-features__title">Бронируйте безопасно</h3>
                  <p className="booking-features__text">
                    Оформление брони абсолютно безопасно. Мы понимаем, что планы могут меняться, поэтому предусмотрели возможность отмены за 14 дней до приезда.
                  </p>
                </div>
              </div>

              <div className="booking-features__card">
                <div className="booking-features__icon booking-features__icon--help">
                  <ConciergeBell size={32} strokeWidth={1.5} color="white" />
                </div>
                <div>
                  <h3 className="booking-features__title">Помощь в решении любого вопроса</h3>
                  <p className="booking-features__text">
                    Забыли вещь? Нужен врач? Не работает телевизор? Поможем в решении всех
                    возможных проблем.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="booking-how">
            <h3 className="booking-title">Как это работает:</h3>
            <div className="booking-how__list">
              <div className="booking-how__item">
                <div className="booking-how__num">1</div>
                <span className="booking-how__text">Выбрать коттедж</span>
              </div>
              <div className="booking-how__item">
                <div className="booking-how__num">2</div>
                <span className="booking-how__text">Расчитать стоимость через калькулятор</span>
              </div>
              <div className="booking-how__item">
                <div className="booking-how__num">3</div>
                <span className="booking-how__text">Нажать кнопку "Забронировать"</span>
              </div>
              <div className="booking-how__item">
                <div className="booking-how__num">4</div>
                <span className="booking-how__text">Проверить данные и подтвердить</span>
              </div>
              <div className="booking-how__item">
                <div className="booking-how__num">5</div>
                <span className="booking-how__text">Отслеживать статус заявки в личном кабинете</span>
              </div>
            </div>
          </section>

        </div>

        <aside className="booking-content__sidebar">
          <div className="booking-content__sticky">
            <BookingCalendar
              houseId="default"
              houseType={selectedHouseType}
              allowHouseSelection={true}
              onHouseTypeChange={setSelectedHouseType}
              pricePerNight={selectedHouseType === 'big' ? 14000 : 10000}
              houses={houses}
              onBeforeBooking={handleBeforeBooking}
              onBookClick={handleBookClick}
            />
          </div>
        </aside>
      </main>

      <div className="container booking-faq-container">
        <section className="booking-faq">
          <h2 className="booking-faq__title">Ответы на вопросы</h2>
          <div className="booking-faq-list">
            <div className={`booking-faq-list__item ${openFaq === 0 ? 'is-open' : ''}`} onClick={() => toggleFaq(0)}>
              <div className="booking-faq-list__question">
                <span>В какое время осуществляются заезд и выезд? Возможен ли ранний заезд?</span>
                <span className="booking-faq-list__icon">
                  <Plus size={20} strokeWidth={1.5} />
                </span>
              </div>
              <div className="booking-faq-list__answer">
                Стандартное время заезда в наши коттеджи — с 14:00, а время выезда — до 12:00. Если вы приезжаете раньше или планируете уехать позже, обязательно сообщите нам об этом заранее! При наличии свободных и убранных номеров мы с радостью пойдем вам навстречу.
              </div>
            </div>
            <div className={`booking-faq-list__item ${openFaq === 1 ? 'is-open' : ''}`} onClick={() => toggleFaq(1)}>
              <div className="booking-faq-list__question">
                <span>Что именно входит в стоимость аренды коттеджа? Есть ли скрытые платежи?</span>
                <span className="booking-faq-list__icon">
                  <Plus size={20} strokeWidth={1.5} />
                </span>
              </div>
              <div className="booking-faq-list__answer">
                У нас честный подход — никаких скрытых доплат. В стоимость аренды уже включено всё необходимое для комфортного отдыха: проживание, пользование собственной оборудованной кухней, террасой и мангальной зоной, скоростной Wi-Fi, а также свежее постельное белье и полотенца.
              </div>
            </div>
            <div className={`booking-faq-list__item ${openFaq === 2 ? 'is-open' : ''}`} onClick={() => toggleFaq(2)}>
              <div className="booking-faq-list__question">
                <span>Какие у вас правила проживания? Можно ли шуметь вечером?</span>
                <span className="booking-faq-list__icon">
                  <Plus size={20} strokeWidth={1.5} />
                </span>
              </div>
              <div className="booking-faq-list__answer">
                «7 Континент» — это место для спокойного, расслабляющего и семейного отдыха вдали от городского шума. Поэтому главное правило нашего гостевого дома: мы просим гостей соблюдать тихие часы с 23:00 до 08:00. Курение в самих коттеджах строго запрещено, но разрешено в специально отведенных местах на свежем воздухе.
              </div>
            </div>
            <div className={`booking-faq-list__item ${openFaq === 3 ? 'is-open' : ''}`} onClick={() => toggleFaq(3)}>
              <div className="booking-faq-list__question">
                <span>Как далеко находится пляж и береговая линия?</span>
                <span className="booking-faq-list__icon">
                  <Plus size={20} strokeWidth={1.5} />
                </span>
              </div>
              <div className="booking-faq-list__answer">
                Наши коттеджи расположены на второй береговой линии — это всего пара минут неспешной прогулки до моря. Пляж здесь песчаный, чистый, с пологим и безопасным входом в воду, что делает его идеальным местом для отдыха даже с самыми маленькими детьми.
              </div>
            </div>
            <div className={`booking-faq-list__item ${openFaq === 4 ? 'is-open' : ''}`} onClick={() => toggleFaq(4)}>
              <div className="booking-faq-list__question">
                <span>Где мы можем оставить свой автомобиль? Это безопасно?</span>
                <span className="booking-faq-list__icon">
                  <Plus size={20} strokeWidth={1.5} />
                </span>
              </div>
              <div className="booking-faq-list__answer">
                Да, абсолютно! Для всех наших гостей предусмотрена бесплатная и удобная парковка рядом с территорией коттеджей. Вам не придется беспокоиться о сохранности вашего автомобиля во время отдыха.
              </div>
            </div>
          </div>
        </section>
      </div>



      <ContactForm />

      <BookingConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmOrder}
        bookingDetails={bookingDetails}
        personalData={user ? { name: user.name, phone: user.phone || '', email: user.email || '' } : null}
        orderNumber={orderNumber}
      />

      <Footer />
    </div>
  );
};

export default Booking;
