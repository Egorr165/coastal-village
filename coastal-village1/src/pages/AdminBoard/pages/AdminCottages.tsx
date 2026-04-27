import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { adminService } from '../services/adminService';
import './AdminTable.scss';

interface Cottage {
  id: number;
  title: string;
  house_type: string;
  price_per_night: string;
  capacity: number;
  bedrooms: number;
  area?: number;
  is_active: boolean;
}

interface CottageImage {
  id: number;
  image: string;
  is_main: boolean;
}

const AdminCottages: React.FC = () => {
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Состояние модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'small',
    pricePerNight: '10000',
    capacity: 4,
    bedrooms: 1,
    area: 40,
    is_active: true
  });
  
  // Состояние галереи
  const [galleryImages, setGalleryImages] = useState<CottageImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [selectedGalleryIds, setSelectedGalleryIds] = useState<number[]>([]);

  const fetchCottages = async () => {
    try {
      const data = await adminService.getCottages();
      setCottages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCottages();
  }, []);

  const fetchGallery = async (type: string) => {
    setLoadingGallery(true);
    setSelectedGalleryIds([]);
    try {
      const imgs = await adminService.getCottageImages(type);
      setGalleryImages(imgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchGallery(formData.type);
    }
  }, [isModalOpen, formData.type]);

  const generateTitle = (type: string) => {
    const existing = cottages.filter(c => c.house_type === type);
    return `Коттедж №${existing.length + 1}`;
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ title: generateTitle('small'), type: 'small', pricePerNight: '10000', capacity: 4, bedrooms: 1, area: 40, is_active: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Cottage) => {
    setEditingId(c.id);
    setFormData({
      title: c.title,
      type: c.house_type,
      pricePerNight: c.price_per_night,
      capacity: c.capacity,
      bedrooms: c.bedrooms,
      area: c.area || 40,
      is_active: c.is_active
    });
    setIsModalOpen(true);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    const shouldUpdateTitle = !formData.title || formData.title.startsWith('Коттедж №');
    
    if (newType === 'big') {
      setFormData({
        ...formData,
        title: shouldUpdateTitle ? generateTitle(newType) : formData.title,
        type: newType,
        pricePerNight: '14000',
        capacity: 6,
        bedrooms: 2,
        area: 75
      });
    } else {
      setFormData({
        ...formData,
        title: shouldUpdateTitle ? generateTitle(newType) : formData.title,
        type: newType,
        pricePerNight: '10000',
        capacity: 4,
        bedrooms: 1,
        area: 40
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        house_type: formData.type, // Сопоставление с бэкендом
        price_per_night: formData.pricePerNight,
        capacity: formData.capacity,
        bedrooms: formData.bedrooms,
        area: formData.area,
        is_active: formData.is_active
      };

      if (editingId) {
        await adminService.updateCottage(editingId, payload);
      } else {
        await adminService.createCottage(payload);
      }

      setIsModalOpen(false);
      fetchCottages();
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении домика');
    }
  };

  const handleDeleteCottage = async (id: number) => {
    if (window.confirm('Вы действительно хотите удалить этот коттедж? Это действие необратимо и удалит все связанные бронирования и отзывы.')) {
        try {
            await adminService.deleteCottage(id);
            fetchCottages();
        } catch (e) {
            console.error(e);
            alert('Ошибка при удалении домика. Возможно, есть активные связанные бронирования.');
        }
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteImage = async (id: number) => {
    if (window.confirm('Удалить эту фотографию?')) {
      try {
        await adminService.deleteCottageImage(id);
        fetchGallery(formData.type);
      } catch (e) {
        console.error(e);
        alert('Ошибка при удалении фото');
      }
    }
  };

  const handleSelectGalleryImage = (id: number) => {
    setSelectedGalleryIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDeleteImages = async () => {
    if (selectedGalleryIds.length === 0) return;
    if (window.confirm(`Удалить выбранные фотографии (${selectedGalleryIds.length} шт.)?`)) {
      try {
        await adminService.bulkDeleteCottageImages(selectedGalleryIds);
        fetchGallery(formData.type);
      } catch (e) {
        console.error(e);
        alert('Ошибка при массовом удалении фото');
      }
    }
  };

  const handleSetMainImage = async (id: number) => {
    try {
      await adminService.setMainCottageImage(id);
      fetchGallery(formData.type);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadNewImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLoadingGallery(true);
      try {
        await adminService.bulkUploadCottageImages(formData.type, e.target.files);
        fetchGallery(formData.type);
      } catch (err) {
        console.error(err);
        alert('Ошибка загрузки фото');
      } finally {
        setLoadingGallery(false);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const items = [...galleryImages];
    const draggedIdx = items.findIndex(i => i.id === draggedId);
    const targetIdx = items.findIndex(i => i.id === targetId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    const [draggedItem] = items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, draggedItem);
    
    setGalleryImages(items);
    setDraggedId(null);

    const orderPayload = items.map((img, idx) => ({ id: img.id, display_order: idx }));
    try {
        await adminService.reorderCottageImages(orderPayload);
    } catch (err) {
        console.error(err);
        alert('Ошибка при сохранении порядка фото');
        fetchGallery(formData.type);
    }
  };

  const filteredCottages = cottages.filter(c => {
      if (activeTab === 'all') return true;
      if (activeTab === 'small') return c.house_type === 'small';
      if (activeTab === 'big') return c.house_type === 'big';
      return false;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCottages.length && filteredCottages.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCottages.map(c => c.id));
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Вы уверены, что хотите удалить ${selectedIds.length} коттеджей? Это действие удалит все связанные бронирования и отзывы.`)) {
        try {
            await adminService.bulkDeleteCottages(selectedIds);
            setSelectedIds([]);
            fetchCottages();
        } catch (e) {
            console.error(e);
            alert('Ошибка при массовом удалении');
        }
    }
  };

  if (loading) return <div className="admin-loading">Загрузка домиков...</div>;

  return (
    <div className="admin-page fade-in">
      <div className="section-title-wrapper mb-20 section-title-wrapper--between">
        <div className="admin-header-group">
            <div className="title-line"></div>
            <h1 className="section-title h2">Коттеджи</h1>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>+ Добавить</button>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => {setActiveTab('all'); setSelectedIds([]);}}>Все</button>
        <button className={`admin-tab ${activeTab === 'small' ? 'active' : ''}`} onClick={() => {setActiveTab('small'); setSelectedIds([]);}}>Small (4-местный)</button>
        <button className={`admin-tab ${activeTab === 'big' ? 'active' : ''}`} onClick={() => {setActiveTab('big'); setSelectedIds([]);}}>Big (6-местный)</button>
      </div>

      {selectedIds.length > 0 && (
        <div className="admin-actions-panel fade-in">
          <span>Выбрано: <strong>{selectedIds.length}</strong></span>
          <div className="admin-actions-btns">
            <button className="btn btn-danger" onClick={executeBulkDelete}>❌ Удалить выбранные</button>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={handleSelectAll} checked={filteredCottages.length > 0 && selectedIds.length === filteredCottages.length} /></th>
              <th>ID</th>
              <th>Название</th>
              <th>Тип</th>
              <th>Цена за ночь</th>
              <th>Вместимость</th>
              <th>Статус</th>
              <th>Управление</th>
            </tr>
          </thead>
          <tbody>
            {filteredCottages.map(c => (
              <tr key={c.id} className={selectedIds.includes(c.id) ? 'selected' : ''}>
                <td><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleSelect(c.id)} /></td>
                <td>#{c.id}</td>
                <td><strong>{c.title}</strong></td>
                <td>{c.house_type === 'big' ? 'Большой (6-мест)' : 'Малый (4-мест)'}</td>
                <td>{c.price_per_night} ₽</td>
                <td>{c.capacity} чел. / {c.bedrooms} спал.</td>
                <td>
                  <span className={`status-badge status-${c.is_active}`}>
                    {c.is_active ? 'Активен' : 'Отключен'}
                  </span>
                </td>
                <td>
                   <button className="btn btn-outline-primary" onClick={() => handleOpenEdit(c)}>Изменить</button>
                </td>
              </tr>
            ))}
            {filteredCottages.length === 0 && (<tr><td colSpan={8} className="admin-table__empty-cell">Нет данных</td></tr>)}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{editingId ? 'Редактировать домик' : 'Новый домик'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>  
              <div className="form-group">
                <label>Тип коттеджей</label>
                <select value={formData.type} onChange={handleTypeChange}>
                  <option value="small">Малый (4-местный)</option>
                  <option value="big">Большой (6-местный)</option>
                </select>
              </div>
              <div className="form-group-row">
                  <div className="form-group">
                    <label>Цена (₽)</label>
                    <input type="number" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Площадь (м²)</label>
                    <input type="number" value={formData.area} onChange={e => setFormData({...formData, area: parseInt(e.target.value)})} required />
                  </div>
              </div>
              <div className="form-group-row">
                  <div className="form-group">
                    <label>Вместимость (чел)</label>
                    <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} required />
                  </div>
                  <div className="form-group">
                    <label>Спален</label>
                    <input type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: parseInt(e.target.value)})} required />
                  </div>
              </div>
              <div className="form-group form-group--checkbox">
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="form-group-checkbox-input" />
                <label className="form-group-checkbox-label">Домик активен (доступен для бронирования)</label>
              </div>

              <hr className="admin-modal-divider" />
              
              <div className="form-group gallery-section">
                  <div className="gallery-section-header">
                    <label className="gallery-section-label">Галерея для типа <strong>{formData.type === 'big' ? 'Большой (6-местный)' : 'Small (4-местный)'}</strong></label>
                    <div className="gallery-section-actions">
                        {selectedGalleryIds.length > 0 && (
                            <button type="button" className="btn btn-danger-outline" onClick={handleBulkDeleteImages}>
                                Удалить ({selectedGalleryIds.length})
                            </button>
                        )}
                        <label className="btn btn-outline">
                           + ДОБАВИТЬ ФОТО
                           <input type="file" multiple accept="image/*" className="hidden-file-input" onChange={handleUploadNewImages} />
                        </label>
                    </div>
                  </div>
                  <small className="gallery-section-hint">Все домики этого типа используют эти фотографии. Перетащите фото, чтобы изменить их порядок отображения.</small>
                  
                  {loadingGallery ? (
                     <div className="gallery-loading">Загрузка галереи...</div>
                  ) : galleryImages.length === 0 ? (
                     <div className="gallery-empty">Нет фотографий для этого типа домика. Добавьте новые!</div>
                  ) : (
                     <div className="gallery-grid">
                        {galleryImages.map(img => (
                           <div 
                              draggable
                              onDragStart={(e) => handleDragStart(e, img.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, img.id)}
                              key={img.id} 
                              className={`gallery-item fade-in ${img.is_main ? 'main' : ''} ${draggedId === img.id ? 'dragging' : ''}`}
                           >
                              <img src={img.image} alt="Cottage" draggable={false} />
                              
                              <div className="checkbox-wrapper">
                                 <input 
                                    type="checkbox" 
                                    checked={selectedGalleryIds.includes(img.id)}
                                    onChange={() => handleSelectGalleryImage(img.id)}
                                 />
                              </div>

                              {img.is_main && (
                                <div className="main-badge">Главная</div>
                              )}
                              <div className="item-actions">
                                 {!img.is_main ? (
                                   <button type="button" onClick={() => handleSetMainImage(img.id)} className="action-main" title="Сделать главной">★</button>
                                 ) : <span className="gallery-item-spacer"></span>}
                                 <button type="button" onClick={() => handleDeleteImage(img.id)} className="action-delete" title="Удалить">🗑️</button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline btn-outline--silver" onClick={() => setIsModalOpen(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminCottages;
