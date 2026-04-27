import React, { useState, useRef } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { Camera, Check, Car } from 'lucide-react';

const AccountPersonalData: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    photo: user?.photo || ''
  });

  const [isSaved, setIsSaved] = useState(false);

  // Formatting phone: +7 (XXX) XXX-XX-XX
  const formatPhone = (value: string) => {
    // Only numbers
    const numbers = value.replace(/\D/g, '');

    // Limit to 11 digits (7 + 10)
    const limited = numbers.slice(0, 11);

    // If empty or just 7/8
    if (limited.length <= 1) return limited.length === 1 ? '+7 (' : '';

    let formatted = '+7 (';

    if (limited.length > 1) {
      // Skip the first digit if it's 7 or 8 and use the next 3 for (XXX)
      const start = (limited[0] === '7' || limited[0] === '8') ? 1 : 0;
      const areaCode = limited.slice(start, start + 3);
      formatted += areaCode;

      if (limited.length > start + 3) {
        formatted += ') ' + limited.slice(start + 3, start + 6);

        if (limited.length > start + 6) {
          formatted += '-' + limited.slice(start + 6, start + 8);

          if (limited.length > start + 8) {
            formatted += '-' + limited.slice(start + 8, start + 10);
          }
        }
      }
    }

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSave = async () => {
    try {
      if (avatarFile) {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('avatar', avatarFile);
        await updateUser(data);
      } else {
        // Если аватарка не менялась, отправляем обычный JSON
        const data: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };
        await updateUser(data);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert("Ошибка при сохранении: " + err.message);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, photo: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="personal-data">
      <div className="personal-data__card">
        <div className="personal-data__avatar-section">
          <div className="personal-data__avatar-container">
            {formData.photo ? (
              <img src={formData.photo} alt="Avatar" className="personal-data__avatar-img" />
            ) : (
              <div className="personal-data__avatar-placeholder">
                <Car size={64} color="#5B86E5" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="personal-data__file-input"
          />

          <button className="personal-data__change-btn" onClick={handlePhotoClick}>
            ИЗМЕНИТЬ
          </button>

          <button
            className={`personal-data__save-btn ${isSaved ? 'personal-data__save-btn--success' : ''}`}
            onClick={handleSave}
          >
            {isSaved ? (
              <>
                <Check size={18} /> СОХРАНЕНО
              </>
            ) : (
              'СОХРАНИТЬ'
            )}
          </button>
        </div>

        <div className="personal-data__form">
          <div className="personal-data__input-group">
            <input
              type="text"
              name="name"
              placeholder="Имя"
              className="personal-data__input"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="personal-data__input-group personal-data__input-group--phone">
            <div className="personal-data__phone-prefix">🇷🇺</div>
            <input
              type="tel"
              name="phone"
              placeholder="+7 (933) 569-79-96"
              className="personal-data__input"
              value={formData.phone}
              onChange={handlePhoneChange}
            />
          </div>

          <div className="personal-data__input-group">
            <input
              type="email"
              name="email"
              placeholder="Почта"
              className="personal-data__input"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPersonalData;
