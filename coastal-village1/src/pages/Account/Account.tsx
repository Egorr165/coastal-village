import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import AccountSidebar from './components/AccountSidebar';
import AccountCurrentBookings from './components/AccountCurrentBookings';
import AccountBookingHistory from './components/AccountBookingHistory';
import AccountPersonalData from './components/AccountPersonalData';
import AccountReviews from './components/AccountReviews';
import './Account.scss';
import Footer from '../../components/Footer/Footer';

const Account: React.FC = () => {
  const [activeTab, setActiveTab] = useState('current');

  const renderContent = () => {
    switch (activeTab) {
      case 'current':
        return (
          <div className="account__main-card">
            <h1 className="account__title account__title--current">Текущие бронирования</h1>
            <AccountCurrentBookings />
          </div>
        );
      case 'history':
        return <AccountBookingHistory />;
      case 'personal':
        return <AccountPersonalData />;
      case 'reviews':
        return <AccountReviews />;
      default:
        return null;
    }
  };

  return (
    <div className="account-page">
      <Header />
      
      <main className="account">
        <div className="container account__container">
          <div className="account__layout">
            <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <section className="account__content">
              {activeTab !== 'current' && (
                <h1 className="account__title">
                  {activeTab === 'history' ? 'История бронирований' : 
                   activeTab === 'reviews' ? 'Мои отзывы' :
                   'Персональные данные'}
                </h1>
              )}
              
              {renderContent()}
            </section>
          </div>
        </div>
      </main>

      <Footer/>
    </div>
  );
};

export default Account;
