import { useState, useEffect } from 'react';
import { Menu, X, User, TabletSmartphone } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import Logo from '../../images/logo.svg';
import './Header.scss';



const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Проверяем размер экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) {
        setIsMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isMobile]);

  // Закрыть меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!document.body.contains(target)) return;
      if (!target.closest('.mobile-menu') && !target.closest('.burger-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Функция для определения активного класса
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'active' : '';

  return (
    <>
      <header className="site-header">
        <div className="container header-container">
          <div className="header-left">
          <NavLink to="/" className="logo-img">
            <img src={Logo} alt="Logo" />
          </NavLink>
        </div>

        

        {/* Десктоп навигация */}
        {!isMobile && (
          <nav className="header-nav">
            <NavLink to="/" className={getNavLinkClass} end>Главная</NavLink>
            <NavLink to="/catalog" className={getNavLinkClass}>Коттеджи</NavLink>
            <NavLink to="/about" className={getNavLinkClass}>О нас</NavLink>
            <NavLink to="/contact" className={getNavLinkClass}>Контакты</NavLink>
            <NavLink to="/booking" className={getNavLinkClass}>Бронирование</NavLink>
            <NavLink to="/reviews" className={getNavLinkClass}>Отзывы</NavLink>
            {user?.is_staff && (
                <NavLink to="/admin-board" className={(props) => getNavLinkClass(props) + ' header-nav__admin'}>Админ-панель</NavLink>
            )}
          </nav>
        )}


        {/* Кнопка бронирования (только на десктопе) */}
          {!isMobile && (
            <button
              className="btn-book-header"
              onClick={() => navigate('/booking')}
            >
              ЗАБРОНИРОВАТЬ
            </button>
          )}


        <div className="header-right">
          {/* Телефон (только на десктопе) */}
          {!isMobile && (
            <div className="phone-block">
              <TabletSmartphone size={24} strokeWidth={2} color="var(--color-primary)" />
              <span>+7 (938) 160-72-31</span>
            </div>
          )}

          {/* Кнопка бургер-меню */}
          {isMobile && (
            <button
              className={`burger-button ${isMenuOpen ? 'open' : ''}`}
              onClick={toggleMenu}
              aria-label="Меню"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {/* Иконка пользователя */}
          <div
            className={`user-icon ${user?.photo ? 'user-icon--has-photo' : ''}`}
            onClick={() => {
              if (!user) {
                navigate('/login')
              } else {
                navigate('/account')
              }
            }}
          >
            {user?.photo ? (
              <img src={user.photo} alt={user.name} className="user-avatar-img" />
            ) : (
              <User size={20} strokeWidth={2} />
            )}
          </div>
        </div>
      </div>

      </header>

      {/* Мобильное меню (Вынесено из <header> из-за backdrop-filter, который ломает position: fixed) */}
      {isMobile && (
        <>
          <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu} />
          <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
            <nav className="mobile-nav">
              <NavLink to="/" onClick={closeMenu} className={getNavLinkClass} end>Главная</NavLink>
              <NavLink to="/catalog" onClick={closeMenu} className={getNavLinkClass}>Коттеджи</NavLink>
              <NavLink to="/about" onClick={closeMenu} className={getNavLinkClass}>О нас</NavLink>
              <NavLink to="/contact" onClick={closeMenu} className={getNavLinkClass}>Контакты</NavLink>
              <NavLink to="/booking" onClick={closeMenu} className={getNavLinkClass}>Бронирование</NavLink>
              <NavLink to="/reviews" onClick={closeMenu} className={getNavLinkClass}>Отзывы</NavLink>
              {user?.is_staff && (
                <NavLink to="/admin-board" onClick={closeMenu} className={(props) => getNavLinkClass(props) + ' header-nav__admin'}>Админ-панель</NavLink>
              )}
            </nav>

            <div className="mobile-contacts">
              <div className="phone-block mobile">
                <TabletSmartphone size={24} strokeWidth={2} color="var(--color-primary)" />
                <span>+7 938 160 72 31</span>
              </div>
              <button
                className="btn-book-header mobile"
                onClick={() => {
                  closeMenu();
                  navigate('/booking');
                }}
              >
                ЗАБРОНИРОВАТЬ
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;