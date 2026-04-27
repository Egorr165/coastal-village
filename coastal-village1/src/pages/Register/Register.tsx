import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import './Register.scss';

const Register: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;
    let digitsOnly = inputVal.replace(/\D/g, ''); 

    if (!digitsOnly) {
      setPhone('');
      setPhoneError('Телефон обязателен');
      return;
    }

    if (['7', '8', '9'].includes(digitsOnly[0])) {
      if (digitsOnly[0] === '9') {
        digitsOnly = '7' + digitsOnly; 
      }

      digitsOnly = digitsOnly.substring(0, 11);

      let formattedPhone = '+7';
      if (digitsOnly.length > 1) formattedPhone += ' (' + digitsOnly.substring(1, 4);
      if (digitsOnly.length >= 5) formattedPhone += ') ' + digitsOnly.substring(4, 7);
      if (digitsOnly.length >= 8) formattedPhone += '-' + digitsOnly.substring(7, 9);
      if (digitsOnly.length >= 10) formattedPhone += '-' + digitsOnly.substring(9, 11);

      setPhone(formattedPhone);
      
      if (digitsOnly.length !== 11) {
        setPhoneError('Номер должен содержать 11 цифр');
      } else {
        setPhoneError('');
      }
    } else {
      digitsOnly = digitsOnly.substring(0, 15);
      const formattedPhone = '+' + digitsOnly;
      setPhone(formattedPhone);
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (phoneError || !phone) {
      setPhoneTouched(true);
      setError('Пожалуйста, введите корректный номер телефона');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, phone, password);
      // Switch to verification step
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при регистрации');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await verifyEmail(email, code);
      const returnUrl = sessionStorage.getItem('returnUrl');
      if (returnUrl) {
          sessionStorage.removeItem('returnUrl');
          navigate(returnUrl);
      } else {
          navigate('/catalog');
      }
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
    <div className="register-page">
      <div className="register-card">
        {step === 1 ? (
          <>
            <h1>Регистрация</h1>
            <p className="subtitle">Станьте частью нашего уютного сообщества</p>
          </>
        ) : (
          <>
            <h1>Подтверждение E-mail</h1>
            <p className="subtitle">Мы отправили 6-значный код на {email}</p>
          </>
        )}

        {error && <div className="error-message">{error}</div>}

        {step === 1 ? (
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <input
                type="text"
                id="name"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Номер телефона</label>
              <input
                type="tel"
                id="phone"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={handlePhoneChange}
                onBlur={() => setPhoneTouched(true)}
                className={phoneTouched && phoneError ? 'input-error' : ''}
                required
                autoComplete="tel"
              />
              {phoneTouched && phoneError && <span className="field-error-text">{phoneError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
              <label htmlFor="confirmPassword">Подтверждение пароля</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

            <div className="checkbox-group checkbox-group--mb">
              <input 
                type="checkbox" 
                id="register-policy" 
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                required
              />
              <label htmlFor="register-policy">
                Я ознакомился с <a href="#">политикой конфиденциальности</a> и даю согласие на <a href="#">обработку персональных данных</a>
              </label>
            </div>

            <div className="checkbox-group checkbox-group--mt-none">
              <input 
                type="checkbox" 
                id="register-marketing" 
                checked={marketingAccepted}
                onChange={(e) => setMarketingAccepted(e.target.checked)}
              />
              <label htmlFor="register-marketing">
                Я соглашаюсь на получение рекламных рассылок и персональных предложений
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-register"
              disabled={isLoading || !policyAccepted}
            >
              {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
            </button>
          </form>
        ) : (
          <form className="register-form" onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="code">Код подтверждения</label>
              <input
                type="text"
                id="code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoComplete="off"
                className="login-form__code-input"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-register"
              disabled={isLoading || code.length < 6}
            >
              {isLoading ? 'Проверка...' : 'Подтвердить код'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => setStep(1)}
            >
              Изменить данные
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="login-link">
            Уже есть аккаунт? 
            <Link to="/login">Войти</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
