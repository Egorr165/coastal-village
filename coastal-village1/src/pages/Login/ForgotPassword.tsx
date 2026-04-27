import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import './Login.scss';

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetPasswordRequest, resetPasswordConfirm } = useAuth();
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await resetPasswordRequest(email);
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Невозможно запросить восстановление');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordConfirm(email, code, newPassword);
      setSuccess('Пароль успешно изменен! Вы можете войти.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Неверный код или ошибка сервера');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {step === 1 ? (
          <>
            <h1>Восстановление пароля</h1>
            <p className="subtitle">Введите ваш email, и мы отправим код</p>
          </>
        ) : (
          <>
            <h1>Сброс пароля</h1>
            <p className="subtitle">Мы отправили письмо с кодом на {email}</p>
          </>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 1 ? (
          <form className="login-form" onSubmit={handleRequest}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Отправка...' : 'Отправить код'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => navigate('/login')}
            >
              Вернуться назад
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleConfirm}>
            <div className="form-group">
              <label htmlFor="code">Код подтверждения из письма</label>
              <input
                type="text"
                id="code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="login-form__code-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Новый пароль</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading || code.length < 6}
            >
              {isLoading ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
