import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './features/auth/AuthContext'; 
import ToastContainer from './components/Toast/ToastContainer'; 
import { setNavigate } from './services/api'; 

import About from './pages/About/About';
import Booking from './pages/Booking/Booking';
import Catalog from './pages/Catalog/Catalog';
import Contact from './pages/Contact/Contact';
import Home from './pages/Home/Home';
import House from './pages/House/House';
import Reviews from './pages/Reviews/Reviews';
import CookieBanner from './components/Cookie/CookieBanner';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import Consent from './pages/Consent/Consent';

import Login from './pages/Login/Login';
import ForgotPassword from './pages/Login/ForgotPassword';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Account from './pages/Account/Account';
import ProtectedRoute from './features/auth/ProtectedRoute';
import ProtectedAdminRoute from './features/auth/ProtectedAdminRoute';
import AdminLayout from './pages/AdminBoard/AdminLayout';
import AdminDashboard from './pages/AdminBoard/pages/AdminDashboard';
import AdminBookings from './pages/AdminBoard/pages/AdminBookings';
import AdminReviews from './pages/AdminBoard/pages/AdminReviews';
import AdminCottages from './pages/AdminBoard/pages/AdminCottages';
import AdminUsers from './pages/AdminBoard/pages/AdminUsers';
import AdminContacts from './pages/AdminBoard/pages/AdminContacts';

const AppRoutes = () => {
    const navigate = useNavigate();

    useEffect(() => {
        setNavigate(navigate);
    }, [navigate]);


    return (
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/house/:id" element={<House />} />
      <Route path="/reviews" element={<Reviews />} />

      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/consent" element={<Consent />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-board"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="cottages" element={<AdminCottages />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="contacts" element={<AdminContacts />} />
      </Route>
    </Routes>
    );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastContainer />
      <CookieBanner />
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;