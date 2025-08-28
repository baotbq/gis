import React, { useState, useEffect } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddPagodaForm from './components/AddPagodaForm';


const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setError('');
      try {
        const response = await fetch('http://localhost:8000/api/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
          onLogin(data); // truyền thông tin user về App
        } else {
          setError(data.error || 'Đăng nhập thất bại!');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ!');
      }
    } else {
      setError('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  return (
    <div style={{height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e3eafc', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', marginBottom: 24, background: 'rgba(255,255,255,0.95)', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', padding: '18px 32px', minWidth: 320}}>
        <img src="https://www.gstatic.com/images/branding/product/1x/maps_48dp.png" alt="logo" style={{width: 32, height: 32, marginRight: 12, objectFit: 'contain'}} />
        <span style={{fontSize: 22, fontWeight: 700, color: '#1976d2'}}>Pagodas in Vietnam</span>
      </div>
      <form onSubmit={handleSubmit} style={{background: 'white', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.12)', minWidth: 320}}>
        <h2 style={{textAlign: 'center', color: '#1976d2'}}>Đăng nhập</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{width: '100%', padding: 10, margin: '12px 0', borderRadius: 8, border: '1px solid #b0b0b0', fontSize: 16}}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{width: '100%', padding: 10, margin: '12px 0', borderRadius: 8, border: '1px solid #b0b0b0', fontSize: 16}}
        />
        {error && <div style={{color: 'red', marginBottom: 8, textAlign: 'center'}}>{error}</div>}
        <button type="submit" style={{width: '100%', padding: 12, background: '#1976d2', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, marginTop: 8, cursor: 'pointer'}}>Đăng nhập</button>
      </form>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPagoda, setEditPagoda] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [pagodas, setPagodas] = useState([]);
  // Removed unused newPagoda and setNewPagoda
  const [savedPagodas, setSavedPagodas] = useState([]); // pagoda objects saved by user

  useEffect(() => {
    console.log('Saved pagodas:', savedPagodas);
  }, [savedPagodas]);
  const [selectedPagoda, setSelectedPagoda] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [shortestPath, setShortestPath] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showPath, setShowPath] = useState(false);
  const [selectedPagodaForPath, setSelectedPagodaForPath] = useState(null);
  // Removed unused searchQuery state

    // Helper to format distance and duration
    // Moved inside functions where used to avoid unused warning
  // Fetch pagodas data from the backend API
  useEffect(() => {
    const fetchPagodas = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/pagodas/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch pagodas');
        }
        const data = await response.json();
        setPagodas(data);
      } catch (error) {
        console.error('Error fetching pagodas:', error);
        toast.error('Không thể tải danh sách chùa. Vui lòng thử lại sau.');
      }
    };
    fetchPagodas();
    // Lấy vị trí hiện tại
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  // Fetch saved pagodas for user after login
  useEffect(() => {
    const fetchSavedPagodas = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:8000/api/saved_locations/?user_id=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            // data is a list of SavedLocation objects, get pagoda objects
            setSavedPagodas(data.map(item => item.pagoda));
          } else {
            setSavedPagodas([]);
          }
        } catch (error) {
          setSavedPagodas([]);
        }
      } else {
        setSavedPagodas([]);
      }
    };
    fetchSavedPagodas();
  }, [user]);
  // Hàm tìm ngôi chùa gần nhất và vẽ đường đi khi bấm nút
  const handleFindNearestPagoda = async () => {
    if (!currentLocation) {
      toast.error('Không thể xác định vị trí của bạn. Vui lòng cho phép truy cập vị trí');
      return;
    }

    if (pagodas.length === 0) {
      toast.error('Không có dữ liệu về các chùa');
      return;
    }

    try {
      let nearestPagoda = pagodas.reduce((nearest, pagoda) => {
        if (!pagoda.latitude || !pagoda.longitude) return nearest;
        
        const dist = Math.sqrt(
          Math.pow(currentLocation.lat - pagoda.latitude, 2) +
          Math.pow(currentLocation.lng - pagoda.longitude, 2)
        );
        return !nearest || dist < nearest.distance ? { pagoda, distance: dist } : nearest;
      }, null);

      if (!nearestPagoda) {
        toast.error('Không tìm thấy chùa nào gần đây');
        return;
      }

      setSelectedPagoda(nearestPagoda.pagoda);
      
      // Gọi OSRM để lấy đường đi thực tế
      const url = `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${nearestPagoda.pagoda.longitude},${nearestPagoda.pagoda.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setShortestPath(coords);
        setShowPath(true);
        
        // ...existing code...
        const distanceInKm = (data.routes[0].distance / 1000).toFixed(2);
        const totalMinutes = Math.round(data.routes[0].duration / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        let formattedDuration = hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
        setRouteInfo({
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
          formattedDistance: `${distanceInKm} km`,
          formattedDuration
        });
        
        toast.success(`Đã tìm thấy chùa gần nhất: ${nearestPagoda.pagoda.name} (${distanceInKm} km)`);
      } else {
        throw new Error('Không tìm được đường đi');
      }
    } catch (error) {
      console.error('Error finding nearest pagoda:', error);
      setRouteInfo(null);
      setShowPath(false);
      toast.error(error.message || 'Không thể tìm đường đi. Vui lòng thử lại sau.');
    }
  };

  // Handle search input change
  // Removed unused handleSearchChange

  // Handle selection from the dropdown
  // Removed unused handleSelect
  // Hàm tìm đường đến chùa được chọn trong danh sách
  const handleFindPathToSelectedPagoda = async () => {
    if (!currentLocation) {
      toast.error('Không thể xác định vị trí của bạn. Vui lòng cho phép truy cập vị trí');
      return;
    }

    if (!selectedPagodaForPath) {
      toast.error('Vui lòng chọn một chùa để tìm đường');
      return;
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${selectedPagodaForPath.longitude},${selectedPagodaForPath.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setShortestPath(coords);
        setShowPath(true);
        
        // Tính toán và hiển thị thông tin đường đi
        const distanceInKm = (data.routes[0].distance / 1000).toFixed(2);
  // Removed unused durationInMinutes
        const hours = Math.floor(data.routes[0].duration / 60);
        const minutes = data.routes[0].duration % 60;
        let formattedDuration = hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
        setRouteInfo({
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
          formattedDistance: `${distanceInKm} km`,
          formattedDuration: `${formattedDuration} phút`
        });

        toast.success(`Đã tìm đường đến chùa: ${selectedPagodaForPath.name}`);
      } else {
        throw new Error('Không tìm được đường đi');
      }
    } catch (error) {
      console.error('Error finding route:', error);
      setRouteInfo(null);
      setShowPath(false);
      toast.error(error.message || 'Không thể tìm đường đi. Vui lòng thử lại sau.');
    }
  };

  // Handle manual input change for the search bar
  // Removed unused handleInputSearchChange


  // Function to center the map on the selected pagoda
  const CenterMapOnPagoda = () => {
    const map = useMap();

    useEffect(() => {
      // Only depend on map, not selectedPagoda
      if (selectedPagoda && selectedPagoda.latitude && selectedPagoda.longitude) {
        map.flyTo([selectedPagoda.latitude, selectedPagoda.longitude], 14);
      }
    }, [map]);

    return null;
  };

  // Function to handle adding a new pagoda
  // Removed unused handleAddPagoda

  // Function to handle removing a pagoda
  const handleRemovePagoda = async (id) => {
    // Confirm before deleting
    if (!window.confirm('Bạn có chắc chắn muốn xóa chùa này không?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/pagodas/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể xóa chùa');
      }

      // Remove pagoda from all states
      setPagodas(prevPagodas => prevPagodas.filter(pagoda => pagoda.id !== id));
      setSavedPagodas(prevSaved => prevSaved.filter(pagoda => pagoda.id !== id));
      
      if (selectedPagoda?.id === id) {
        setSelectedPagoda(null);
        setSelectedPagodaForPath(null);
        setShowPath(false);
      }

      toast.success('Đã xóa chùa thành công!');
    } catch (error) {
      console.error('Error deleting pagoda:', error);
      toast.error('Không thể xóa chùa. Vui lòng thử lại sau.');
    }
  };

  const handleUpdatePagoda = async () => {
    try {
      // Validate required fields
      const requiredFields = ['name', 'description', 'province', 'district', 'ward', 'latitude', 'longitude'];
      const missingFields = requiredFields.filter(field => !editPagoda[field]);
      
      if (missingFields.length > 0) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
      }

      // Validate coordinates
      if (isNaN(Number(editPagoda.latitude)) || isNaN(Number(editPagoda.longitude))) {
        toast.error('Vĩ độ và kinh độ phải là số hợp lệ!');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/pagodas/${editPagoda.id}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          ...editPagoda,
          latitude: Number(editPagoda.latitude),
          longitude: Number(editPagoda.longitude)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cập nhật thất bại');
      }

      const updated = await response.json();

      // Cập nhật pagoda trong danh sách và state
      setPagodas(pagodas.map(p => (p.id === updated.id ? updated : p)));
      if (selectedPagoda?.id === updated.id) {
        setSelectedPagoda(updated);
      }
      setIsEditModalOpen(false);
      setEditPagoda(null);
      toast.success(`Đã cập nhật thông tin chùa "${updated.name}" thành công!`);
    } catch (error) {
      console.error('Lỗi khi cập nhật chùa:', error);
      toast.error(error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    }
  };



  // Function to handle saving a pagoda location for regular users
  const handleSaveLocation = async (pagoda) => {
    if (!user || !user.id) {
      toast.error('Vui lòng đăng nhập để lưu vị trí');
      return;
    }

    // Kiểm tra xem chùa đã được lưu chưa
    if (savedPagodas.some(p => p.id === pagoda.id)) {
      toast.info('Bạn đã lưu vị trí chùa này rồi');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/saved_locations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: user.id,
          pagoda_id: pagoda.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể lưu vị trí chùa');
      }

      // Thêm chùa vào danh sách đã lưu
      setSavedPagodas(prev => [...prev, pagoda]);
      toast.success(`Đã lưu vị trí chùa "${pagoda.name}" thành công!`);
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi lưu vị trí');
    }
  };

  // Filter pagodas based on search query
  // const filteredPagodas = pagodas.filter((pagoda) => {
  //   if (!pagoda.name || !searchQuery) return false;
  //   return pagoda.name.toLowerCase().includes(searchQuery.toLowerCase());
  // });
  // Removed unused filteredPagodas

  console.log("Pagodas:", pagodas);

  if (!isLoggedIn) {
    return <LoginPage onLogin={(userData) => { setIsLoggedIn(true); setUser(userData); }} />;
  }

  return (
    <div className="App responsive-app">
      {/* Control buttons */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1201 }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {user && (user.is_superuser || user.is_staff) && (
            <>
              <button className="menu-btn admin" onClick={() => setIsModalOpen(true)}>
                Add Pagoda
              </button>
              <button
                className="menu-btn admin"
                onClick={() => {
                  if (selectedPagoda) {
                    setEditPagoda(selectedPagoda);
                    setIsEditModalOpen(true);
                  } else {
                    toast.info('Hãy chọn chùa để sửa!');
                  }
                }}
              >
                Edit Pagoda
              </button>
              <button
                className="menu-btn admin"
                onClick={() => {
                  if (selectedPagoda) {
                    handleRemovePagoda(selectedPagoda.id);
                  } else {
                    toast.info('Hãy chọn chùa để xoá!');
                  }
                }}
              >
                Delete Pagoda
              </button>
            </>
          )}
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setUser(null);
              setSelectedOption(null);
              setSelectedPagoda(null);
              setSavedPagodas([]);
            }}
            className="menu-btn"
          >
            Đăng xuất
          </button>
        </div>
        {/* User thường: các nút tìm đường vẫn ở bên trái như cũ */}
      </div>
      {/* User thường: các nút tìm đường ở góc trái trên cùng */}
      {user && !(user.is_superuser || user.is_staff) && (
        <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1201 }}>
          <div className="vertical-menu">
            <button className="menu-btn green" onClick={handleFindNearestPagoda}>
              Tìm đường đến chùa gần nhất
            </button>
            <button
              className="menu-btn blue"
              onClick={handleFindPathToSelectedPagoda}
              disabled={!(selectedPagodaForPath && currentLocation)}
            >
              Tìm đường đến chùa đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Thanh tìm kiếm căn giữa top, ẩn khi hiển thị popup thêm mới */}
      {!isModalOpen && (
        <div className="top-center-panel">
          <div className="search-box">
            <Select
              value={selectedOption}
              onChange={(option) => {
                if (option) {
                  const pagoda = pagodas.find(p => p.id === option.value);
                  setSelectedPagoda(pagoda);
                  setSelectedOption(option);
                  setSelectedPagodaForPath(pagoda);
                  setShowPath(false);
                } else {
                  setSelectedPagoda(null);
                  setSelectedOption(null);
                  setSelectedPagodaForPath(null);
                  setShowPath(false);
                }
              }}
              options={pagodas.map((p) => ({
                label: p.name,
                value: p.id
              }))}
              placeholder="Tìm kiếm chùa..."
              isClearable={true}
              isDisabled={false}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Add Pagoda Modal */}
      {isModalOpen && (
        <div className="overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div style={{
            width: '95%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <AddPagodaForm
              onClose={() => setIsModalOpen(false)}
              onSuccess={(newPagoda) => {
                setPagodas(prev => [...prev, newPagoda]);
                setIsModalOpen(false);
                toast.success('Thêm chùa mới thành công!');
              }}
            />
          </div>
        </div>
      )}

      {isEditModalOpen && editPagoda && (
        <div className="overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            width: '95%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              color: '#1976d2',
              fontSize: '1.8rem',
              fontWeight: '600',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Chỉnh sửa thông tin chùa
            </h2>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div className="form-group">
                <label className="form-label">Tên chùa *</label>
                <input
                  type="text"
                  value={editPagoda.name}
                  onChange={(e) => setEditPagoda({ ...editPagoda, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả *</label>
                <textarea
                  value={editPagoda.description}
                  onChange={(e) => setEditPagoda({ ...editPagoda, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tỉnh/Thành phố *</label>
                <input
                  type="text"
                  value={editPagoda.province}
                  onChange={(e) => setEditPagoda({ ...editPagoda, province: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quận/Huyện *</label>
                <input
                  type="text"
                  value={editPagoda.district}
                  onChange={(e) => setEditPagoda({ ...editPagoda, district: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phường/Xã *</label>
                <input
                  type="text"
                  value={editPagoda.ward}
                  onChange={(e) => setEditPagoda({ ...editPagoda, ward: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={editPagoda.address_detail}
                  onChange={(e) => setEditPagoda({ ...editPagoda, address_detail: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vĩ độ *</label>
                <input
                  type="number"
                  step="any"
                  value={editPagoda.latitude}
                  onChange={(e) => setEditPagoda({ ...editPagoda, latitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kinh độ *</label>
                <input
                  type="number"
                  step="any"
                  value={editPagoda.longitude}
                  onChange={(e) => setEditPagoda({ ...editPagoda, longitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label className="form-label">Hình ảnh chùa</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
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
                      setEditPagoda(prev => ({
                        ...prev,
                        image_url: e.target.result
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
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

            {editPagoda.image_url && (
              <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h4 style={{ color: '#333', marginBottom: '10px' }}>Xem trước hình ảnh</h4>
                <img
                  src={editPagoda.image_url}
                  alt="Preview"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '5px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    toast.error('Không thể tải hình ảnh');
                  }}
                />
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginTop: '20px'
            }}>
              <button
                onClick={handleUpdatePagoda}
                style={{
                  padding: '12px 30px',
                  background: '#4CAF50',
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
                Lưu thay đổi
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditPagoda(null);
                }}
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
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}






      {/* Ẩn các nút tìm đường nếu là admin/staff */}

      {/* Map */}
      <div className="map-container">
        <MapContainer center={[14.0583, 108.2772]} zoom={6} style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Center map based on selected pagoda */}
          <CenterMapOnPagoda />

          {/* Current location marker */}
          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={new L.Icon({
                iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              })}
            >
              <Popup>Vị trí của bạn</Popup>
            </Marker>
          )}

          {/* Pagoda markers */}
          {user && (user.is_superuser || user.is_staff) ? (
            pagodas.map((pagoda) => (
              pagoda &&
              pagoda.latitude !== undefined && pagoda.longitude !== undefined &&
              !isNaN(Number(pagoda.latitude)) && !isNaN(Number(pagoda.longitude)) && (
                <Marker
                  key={pagoda.id}
                  position={[Number(pagoda.latitude), Number(pagoda.longitude)]}
                  icon={new L.Icon({
                    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                  })}
                >
                  <Popup>
                    <h3>{pagoda.name}</h3>
                    {pagoda.image_url && (
                      <img src={pagoda.image_url} alt={pagoda.name} style={{width: '100%', maxWidth: 220, borderRadius: 8, marginBottom: 8}} />
                    )}
                    <p>{pagoda.description}</p>
                  </Popup>
                </Marker>
              )
            ))
          ) : (
            <>
              {savedPagodas.length === 0 && (
                <div style={{position: 'absolute', top: 120, left: 20, background: 'rgba(255,255,255,0.95)', padding: '8px 16px', borderRadius: 8, zIndex: 1200, color: '#888', fontWeight: 500}}>
                  Không có chùa nào đã lưu vị trí.
                </div>
              )}
              {savedPagodas.map((pagoda) => (
                pagoda &&
                pagoda.latitude !== undefined && pagoda.longitude !== undefined &&
                !isNaN(Number(pagoda.latitude)) && !isNaN(Number(pagoda.longitude)) && (
                  <Marker
                    key={pagoda.id}
                    position={[Number(pagoda.latitude), Number(pagoda.longitude)]}
                    icon={new L.Icon({
                      iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      iconSize: [32, 32],
                      iconAnchor: [16, 32],
                      popupAnchor: [0, -32],
                    })}
                  >
                    <Popup>
                      <h3>{pagoda.name}</h3>
                      {pagoda.image_url && (
                        <img src={pagoda.image_url} alt={pagoda.name} style={{width: '100%', maxWidth: 220, borderRadius: 8, marginBottom: 8}} />
                      )}
                      <p>{pagoda.description}</p>
                    </Popup>
                  </Marker>
                )
              ))}
            </>
          )}

          {/* Selected pagoda marker */}
          {selectedPagoda &&
            !savedPagodas.some(p => p.id === selectedPagoda.id) &&
            selectedPagoda.latitude !== undefined && selectedPagoda.longitude !== undefined &&
            !isNaN(Number(selectedPagoda.latitude)) && !isNaN(Number(selectedPagoda.longitude)) && (
              <Marker
                key={selectedPagoda.id}
                position={[Number(selectedPagoda.latitude), Number(selectedPagoda.longitude)]}
                icon={new L.Icon({
                  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                  popupAnchor: [0, -32],
                })}
              >
                <Popup>
                  <h3>{selectedPagoda.name}</h3>
                  {selectedPagoda.image_url && (
                    <img src={selectedPagoda.image_url} alt={selectedPagoda.name} style={{width: '100%', maxWidth: 220, borderRadius: 8, marginBottom: 8}} />
                  )}
                  <p>{selectedPagoda.description}</p>
                  {user && !(user.is_superuser || user.is_staff) && (
                    <button onClick={() => handleSaveLocation(selectedPagoda)} style={{marginTop: 8, background: '#1976d2', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer'}}>Lưu vị trí này</button>
                  )}
                  {user && (user.is_superuser || user.is_staff) && (
                    <>
                      <button onClick={() => handleRemovePagoda(selectedPagoda.id)}>Delete</button>
                      <button onClick={() => {
                        setEditPagoda(selectedPagoda);
                        setIsEditModalOpen(true);
                      }} style={{ marginLeft: '10px' }}>Edit</button>
                    </>
                  )}
                </Popup>
              </Marker>
            )}

          {/* Route display */}
          {showPath && shortestPath.length > 1 && (
            <>
              <Polyline positions={shortestPath} color="green" />
              {routeInfo && (
                <div style={{position: 'absolute', top: 200, left: 20, background: 'rgba(255,255,255,0.98)', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', zIndex: 1200, fontSize: 16, fontWeight: 500}}>
                  <b>Thông tin đường đi</b><br/>
                  <span style={{color:'#1976d2'}}>Quãng đường:</span> {(routeInfo.distance/1000).toFixed(2)} km<br/>
                  <span style={{color:'#1976d2'}}>Thời gian:</span> {(routeInfo.duration/60).toFixed(0)} phút
                </div>
              )}
            </>
          )}
        </MapContainer>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default App;