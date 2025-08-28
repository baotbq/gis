
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditPagodaForm = ({ pagoda, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
  name: '',
  latitude: '',
  longitude: '',
  description: '',
  image_url: '',
  province: '',
  district: '',
  ward: '',
  address_detail: '',
  opening_hours: '',
  target_audience: '',
  sect: '',
  transportation: '',
  events: '',
  });

  useEffect(() => {
    if (pagoda) {
      setFormData({
        name: pagoda.name || '',
        latitude: pagoda.latitude || '',
        longitude: pagoda.longitude || '',
        description: pagoda.description || '',
        image_url: pagoda.image_url || '',
        province: pagoda.province || '',
        district: pagoda.district || '',
        ward: pagoda.ward || '',
        address_detail: pagoda.address_detail || '',
        opening_hours: pagoda.opening_hours || '',
        target_audience: pagoda.target_audience || '',
        sect: pagoda.sect || '',
        transportation: pagoda.transportation || '',
        events: pagoda.events || '',
      });
    }
  }, [pagoda]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên chùa không được để trống';
    if (!formData.latitude) newErrors.latitude = 'Vĩ độ không được để trống';
    if (!formData.longitude) newErrors.longitude = 'Kinh độ không được để trống';
    if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống';
    if (!formData.province.trim()) newErrors.province = 'Tỉnh/Thành phố không được để trống';
    if (!formData.district.trim()) newErrors.district = 'Quận/Huyện không được để trống';
    if (!formData.ward.trim()) newErrors.ward = 'Phường/Xã không được để trống';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
        opening_hours: '',
        target_audience: '',
        sect: '',
        transportation: '',
        events: ''
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG');
        return;
      }
  const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image_url: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch(`http://localhost:8000/api/pagodas/${pagoda.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Cập nhật thông tin chùa thành công!');
        onSuccess(data);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin chùa.');
      }
    } catch (error) {
      console.error('Error updating pagoda:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin chùa.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="edit-pagoda-form">
    {/* Đảm bảo toàn bộ JSX nằm trong một thẻ cha */}
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
      <h2 style={{ color: '#1976d2', fontWeight: '600' }}>Sửa Thông Tin Chùa</h2>
      <p style={{ color: '#666' }}>Vui lòng điền đầy đủ các thông tin bắt buộc</p>
    </div>
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">Tên chùa *</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên chùa" className={errors.name ? 'input-error' : ''} />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Mô tả *</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Nhập mô tả" className={errors.description ? 'input-error' : ''} style={{ minHeight: '100px', resize: 'vertical' }} />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Tỉnh/Thành phố *</label>
        <input type="text" name="province" value={formData.province} onChange={handleInputChange} placeholder="Nhập tỉnh/thành phố" className={errors.province ? 'input-error' : ''} />
        {errors.province && <span className="error-text">{errors.province}</span>}
      </div>
    </div>
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">Quận/Huyện *</label>
        <input type="text" name="district" value={formData.district} onChange={handleInputChange} className={errors.district ? 'input-error' : ''} />
        {errors.district && <span className="error-text">{errors.district}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Phường/Xã *</label>
        <input type="text" name="ward" value={formData.ward} onChange={handleInputChange} className={errors.ward ? 'input-error' : ''} />
        {errors.ward && <span className="error-text">{errors.ward}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Địa chỉ chi tiết</label>
        <input type="text" name="address_detail" value={formData.address_detail} onChange={handleInputChange} />
      </div>
    </div>
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">Vĩ độ *</label>
        <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} className={errors.latitude ? 'input-error' : ''} />
        {errors.latitude && <span className="error-text">{errors.latitude}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Kinh độ *</label>
        <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} className={errors.longitude ? 'input-error' : ''} />
        {errors.longitude && <span className="error-text">{errors.longitude}</span>}
      </div>
    </div>
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">Giờ mở cửa</label>
        <input type="text" name="opening_hours" value={formData.opening_hours} onChange={handleInputChange} placeholder="VD: 6:00 - 18:00" />
      </div>
      <div className="form-group">
        <label className="form-label">Đối tượng phục vụ</label>
        <input type="text" name="target_audience" value={formData.target_audience} onChange={handleInputChange} placeholder="Người thường, sư, nico..." />
      </div>
      <div className="form-group">
        <label className="form-label">Trường phái</label>
        <input type="text" name="sect" value={formData.sect} onChange={handleInputChange} placeholder="Tịnh Độ, Đại thừa..." />
      </div>
    </div>
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">Phương tiện di chuyển</label>
        <input type="text" name="transportation" value={formData.transportation} onChange={handleInputChange} placeholder="Xe máy, ô tô, xe đạp..." />
      </div>
      <div className="form-group">
        <label className="form-label">Sự kiện/lễ lớn</label>
        <textarea name="events" value={formData.events} onChange={handleInputChange} placeholder="Các lễ lớn, sự kiện sắp diễn ra..." />
      </div>
    </div>
    <div className="form-group" style={{ marginBottom: '30px' }}>
      <label className="form-label">Hình ảnh chùa</label>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <p className="image-hint">Định dạng hỗ trợ: PNG, JPEG, JPG (tối đa 5MB)</p>
    </div>
    {formData.image_url && (
      <div className="image-preview">
        <h4>Xem trước hình ảnh</h4>
        <img src={formData.image_url} alt="Preview" />
      </div>
    )}
    <div className="form-actions">
      <button onClick={handleSubmit} disabled={loading} className="save-btn">
        {loading ? (<><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Đang xử lý...</>) : ('Lưu thay đổi')}
      </button>
      <button onClick={onClose} disabled={loading} className="cancel-btn">Hủy bỏ</button>
    </div>
  </div>
  );
};

export default EditPagodaForm;
