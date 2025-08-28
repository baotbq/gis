import React, { useState } from 'react';
import { toast } from 'react-toastify';

const AddPagodaForm = ({ onClose, onSuccess }) => {
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
    events: ''
  });

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
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
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

      const response = await fetch('http://localhost:8000/api/pagodas/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Thêm chùa mới thành công!');
        onSuccess(data);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Có lỗi xảy ra khi thêm chùa mới.');
      }
    } catch (error) {
      console.error('Error adding pagoda:', error);
      toast.error('Có lỗi xảy ra khi thêm chùa mới.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-pagoda-form" style={{
      background: 'white',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 4px 25px rgba(0, 0, 0, 0.15)',
      width: '95%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{
          color: '#1976d2',
          fontSize: '1.8rem',
          fontWeight: '600',
          marginBottom: '10px'
        }}>Thêm Chùa Mới</h2>
        <p style={{
          color: '#666',
          fontSize: '0.9rem'
        }}>Vui lòng điền đầy đủ các thông tin bắt buộc</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
          {/* Opening Hours */}
          <div className="form-group">
            <label className="form-label">Giờ mở cửa</label>
            <input type="text" name="opening_hours" value={formData.opening_hours} onChange={handleInputChange} placeholder="VD: 6:00 - 18:00" style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px'}} />
          </div>
          {/* Target Audience */}
          <div className="form-group">
            <label className="form-label">Đối tượng phục vụ</label>
            <input type="text" name="target_audience" value={formData.target_audience} onChange={handleInputChange} placeholder="Người thường, sư, nico..." style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px'}} />
          </div>
          {/* Sect */}
          <div className="form-group">
            <label className="form-label">Trường phái</label>
            <input type="text" name="sect" value={formData.sect} onChange={handleInputChange} placeholder="Tịnh Độ, Đại thừa..." style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px'}} />
          </div>
          {/* Transportation */}
          <div className="form-group">
            <label className="form-label">Phương tiện di chuyển</label>
            <input type="text" name="transportation" value={formData.transportation} onChange={handleInputChange} placeholder="Xe máy, ô tô, xe đạp..." style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px'}} />
          </div>
          {/* Events */}
          <div className="form-group">
            <label className="form-label">Sự kiện/lễ lớn</label>
            <textarea name="events" value={formData.events} onChange={handleInputChange} placeholder="Các lễ lớn, sự kiện sắp diễn ra..." style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', minHeight: '60px', resize: 'vertical'}} />
          </div>
        {/* Name Input */}
        <div className="form-group">
          <label className="form-label">Tên chùa *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên chùa"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.name ? '1px solid #f44336' : '1px solid #ddd',
              fontSize: '15px'
            }}
          />
          {errors.name && <span style={{ color: '#f44336', fontSize: '0.8rem' }}>{errors.name}</span>}
        </div>

        {/* Description Input */}
        <div className="form-group">
          <label className="form-label">Mô tả *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.description ? '1px solid #f44336' : '1px solid #ddd',
              fontSize: '15px',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
          {errors.description && <span style={{ color: '#f44336', fontSize: '0.8rem' }}>{errors.description}</span>}
        </div>

        {/* Province Input */}
        <div className="form-group">
          <label className="form-label">Tỉnh/Thành phố *</label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleInputChange}
            placeholder="Nhập tỉnh/thành phố"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.province ? '1px solid #f44336' : '1px solid #ddd',
              fontSize: '15px'
            }}
          />
          {errors.province && <span style={{ color: '#f44336', fontSize: '0.8rem' }}>{errors.province}</span>}
        </div>

        {/* District Input */}
        <div className="form-group">
          <label className="form-label">Quận/Huyện *</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            placeholder="Nhập quận/huyện"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.district ? '1px solid #f44336' : '1px solid #ddd',
              fontSize: '15px'
            }}
          />
          {errors.district && <span style={{ color: '#f44336', fontSize: '0.8rem' }}>{errors.district}</span>}
        </div>

        {/* Ward Input */}
        <div className="form-group">
          <label className="form-label">Phường/Xã *</label>
          <input
            type="text"
            name="ward"
            value={formData.ward}
            onChange={handleInputChange}
            placeholder="Nhập phường/xã"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.ward ? '1px solid #f44336' : '1px solid #ddd',
              fontSize: '15px'
            }}
          />
          {errors.ward && <span style={{ color: '#f44336', fontSize: '0.8rem' }}>{errors.ward}</span>}
        </div>

        {/* Address Detail Input */}
        <div className="form-group">
          <label className="form-label">Địa chỉ chi tiết</label>
          <input
            type="text"
            name="address_detail"
            value={formData.address_detail}
            onChange={handleInputChange}
            placeholder="Nhập địa chỉ chi tiết"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '15px'
            }}
          />
        </div>

        {/* Latitude Input */}
        <div className="form-group">
          <label className="form-label">Vĩ độ *</label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            placeholder="Nhập vĩ độ"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.latitude ? '1px solid #f44336' : '1px solid #ddd',
              fontSize: '15px'
            }}
          />
          {errors.latitude && <span style={{ color: '#f44336', fontSize: '0.8rem' }}>{errors.latitude}</span>}
        </div>

        {/* Longitude Input */}
        <div className="form-group">
          <label className="form-label">Kinh độ *</label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            placeholder="Nhập kinh độ"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: errors.longitude ? '1px solid #f44336' : '1px solid #ddd',
              fontSize: '15px'
            }}
          />
          {errors.longitude && <span style={{ color: '#f44336', fontSize: '0.8rem' }}>{errors.longitude}</span>}
        </div>
      </div>

      {/* Image Upload */}
      <div style={{ marginBottom: '30px' }}>
        <label className="form-label" style={{
          display: 'block',
          marginBottom: '10px',
          color: '#333',
          fontSize: '0.95rem',
          fontWeight: '500'
        }}>
          Hình ảnh chùa
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}
        />
        <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '8px' }}>
          Định dạng hỗ trợ: PNG, JPEG, JPG (tối đa 5MB)
        </p>
      </div>

      {/* Image Preview */}
      {formData.image_url && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h4 style={{ color: '#333', marginBottom: '10px' }}>Xem trước hình ảnh</h4>
          <img
            src={formData.image_url}
            alt="Preview"
            style={{
              maxWidth: '300px',
              maxHeight: '300px',
              objectFit: 'contain',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '5px'
            }}
          />
        </div>
      )}

      {/* Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px'
      }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '12px 30px',
            background: loading ? '#cccccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s',
            minWidth: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Đang xử lý...
            </>
          ) : (
            'Thêm chùa'
          )}
        </button>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            padding: '12px 30px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.3s',
            minWidth: '140px'
          }}
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  );
};

export default AddPagodaForm;
