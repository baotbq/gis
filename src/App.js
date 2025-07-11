import React, { useState, useEffect } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPagoda, setEditPagoda] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);


  const [pagodas, setPagodas] = useState([]);
  const [selectedPagoda, setSelectedPagoda] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPagoda, setNewPagoda] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: ''
  });

  // Fetch pagodas data from the backend API
  useEffect(() => {
    const fetchPagodas = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/pagodas/');
        const data = await response.json();
        setPagodas(data); // Set the pagodas data in state
      } catch (error) {
        console.error('Error fetching pagodas:', error);
      }
    };

    fetchPagodas();
  }, []);

  // Handle search input change
  const handleSearchChange = (inputValue) => {
    setSearchQuery(inputValue);
  };

  // Handle selection from the dropdown
  const handleSelect = (selectedOption) => {
    setSelectedPagoda(selectedOption);
    setSearchQuery(selectedOption.label); // Update search query with selected name
  };

  // Handle manual input change for the search bar
  const handleInputSearchChange = async (newValue) => {
    setSearchQuery(newValue);  // cập nhật query để hiển thị lại

    try {
      const response = await fetch(`http://localhost:8000/api/pagodas/?search=${newValue}`);
      const data = await response.json();
      setPagodas(data);
    } catch (error) {
      console.error('Error fetching pagodas:', error);
    }
  };


  // Function to center the map on the selected pagoda
  const CenterMapOnPagoda = () => {
    const map = useMap();

    useEffect(() => {
      if (selectedPagoda && selectedPagoda.latitude && selectedPagoda.longitude) {
        map.flyTo([selectedPagoda.latitude, selectedPagoda.longitude], 14);
      }
    }, [selectedPagoda, map]);

    return null;
  };

  // Function to handle adding a new pagoda
  const handleAddPagoda = async () => {
    const { name, latitude, longitude, description } = newPagoda;
    if (name && latitude && longitude && description) {
      try {
        const response = await fetch('http://localhost:8000/api/pagodas/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPagoda),
        });
        const addedPagoda = await response.json();
        setPagodas([...pagodas, addedPagoda]); // Add the new pagoda to the list
        setNewPagoda({ name: '', latitude: '', longitude: '', description: '' }); // Clear the form
        toast.success(`Đã thêm chùa "${addedPagoda.name}" thành công!`);
      } catch (error) {
        console.error('Error adding pagoda:', error);
      }
    }
  };

  // Function to handle removing a pagoda
  const handleRemovePagoda = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/pagodas/${id}/`, {
        method: 'DELETE',
      });
      window.location.reload();
      const removedPagoda = await response.json();
      setPagodas(pagodas.filter(pagoda => pagoda.id !== removedPagoda.id));
      toast.success(`Đã xoá chùa "${removedPagoda.name}" thành công!`);
      // Remove the pagoda from the list
    } catch (error) {
      console.error('Error deleting pagoda:', error);
    }
  };

  const handleUpdatePagoda = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/pagodas/${editPagoda.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPagoda),
      });

      const updated = await response.json();

      // Cập nhật pagoda trong danh sách
      setPagodas(pagodas.map(p => (p.id === updated.id ? updated : p)));
      setIsEditModalOpen(false);
      setEditPagoda(null);
      toast.success(`Đã cập nhật chùa "${updated.name}" thành công!`);
    } catch (error) {
      console.error('Lỗi khi cập nhật chùa:', error);
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    }
  };


  // Filter pagodas based on search query
  // const filteredPagodas = pagodas.filter((pagoda) => {
  //   if (!pagoda.name || !searchQuery) return false;
  //   return pagoda.name.toLowerCase().includes(searchQuery.toLowerCase());
  // });
  const filteredPagodas = pagodas;




  console.log("Pagodas:", pagodas);



  return (
    <div className="App">
      <h1>Pagodas in Vietnam</h1>
      {isModalOpen && (
        <div className="overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="add-pagoda-form">
            <h3>Add New Pagoda</h3>
            <input
              type="text"
              name="name"
              placeholder="Pagoda Name"
              value={newPagoda.name}
              onChange={(e) => setNewPagoda({ ...newPagoda, name: e.target.value })}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={newPagoda.description}
              onChange={(e) => setNewPagoda({ ...newPagoda, description: e.target.value })}
            />
            <input
              type="text"
              name="province"
              placeholder="Province"
              value={newPagoda.province}
              onChange={(e) => setNewPagoda({ ...newPagoda, province: e.target.value })}
            />
            <input
              type="text"
              name="district"
              placeholder="District"
              value={newPagoda.district}
              onChange={(e) => setNewPagoda({ ...newPagoda, district: e.target.value })}
            />
            <input
              type="text"
              name="ward"
              placeholder="Ward"
              value={newPagoda.ward}
              onChange={(e) => setNewPagoda({ ...newPagoda, ward: e.target.value })}
            />
            <input
              type="text"
              name="address_detail"
              placeholder="Address Detail"
              value={newPagoda.address_detail}
              onChange={(e) => setNewPagoda({ ...newPagoda, address_detail: e.target.value })}
            />
            <input
              type="number"
              name="latitude"
              placeholder="Latitude"
              value={newPagoda.latitude}
              onChange={(e) => setNewPagoda({ ...newPagoda, latitude: e.target.value })}
            />
            <input
              type="number"
              name="longitude"
              placeholder="Longitude"
              value={newPagoda.longitude}
              onChange={(e) => setNewPagoda({ ...newPagoda, longitude: e.target.value })}
            />
            <button onClick={handleAddPagoda}>Add Pagoda</button>
            <button style={{ marginLeft: '10px' }} onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {isEditModalOpen && editPagoda && (
        <div className="overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="add-pagoda-form">
            <h3>Sửa thông tin chùa</h3>
            <input
              type="text"
              name="name"
              placeholder="Pagoda Name"
              value={editPagoda.name}
              onChange={(e) => setEditPagoda({ ...editPagoda, name: e.target.value })}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={editPagoda.description}
              onChange={(e) => setEditPagoda({ ...editPagoda, description: e.target.value })}
            />
            <input
              type="text"
              name="province"
              placeholder="Province"
              value={editPagoda.province}
              onChange={(e) => setEditPagoda({ ...editPagoda, province: e.target.value })}
            />
            <input
              type="text"
              name="district"
              placeholder="District"
              value={editPagoda.district}
              onChange={(e) => setEditPagoda({ ...editPagoda, district: e.target.value })}
            />
            <input
              type="text"
              name="ward"
              placeholder="Ward"
              value={editPagoda.ward}
              onChange={(e) => setEditPagoda({ ...editPagoda, ward: e.target.value })}
            />
            <input
              type="text"
              name="address_detail"
              placeholder="Address Detail"
              value={editPagoda.address_detail}
              onChange={(e) => setEditPagoda({ ...editPagoda, address_detail: e.target.value })}
            />
            <input
              type="number"
              name="latitude"
              placeholder="Latitude"
              value={editPagoda.latitude}
              onChange={(e) => setEditPagoda({ ...editPagoda, latitude: e.target.value })}
            />
            <input
              type="number"
              name="longitude"
              placeholder="Longitude"
              value={editPagoda.longitude}
              onChange={(e) => setEditPagoda({ ...editPagoda, longitude: e.target.value })}
            />
            <button onClick={handleUpdatePagoda}>Lưu</button>
            <button style={{ marginLeft: '10px' }} onClick={() => setIsEditModalOpen(false)}>Hủy</button>
          </div>
        </div>
      )}



      <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
        Add Pagoda
      </button>

      {/* Search Box */}
      <div className="search-box">
        <Select
          value={selectedOption}
          onChange={(option) => {
            const pagoda = pagodas.find(p => p.id === option.value);
            setSelectedPagoda(pagoda);       // chọn pagoda để hiển thị
            setSelectedOption(null);         // ✅ reset Search Box
          }}
          options={pagodas.map((p) => ({
            label: p.name,         // phải là string
            value: p.id            // phải là string hoặc number
          }))}
          placeholder="Tìm kiếm chùa..."
          isClearable={true}
        />
      </div>

      {/* Map */}
      <MapContainer center={[14.0583, 108.2772]} zoom={6} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Center map based on selected pagoda */}
        <CenterMapOnPagoda />

        {filteredPagodas.map((pagoda) => (
          <Marker
            key={pagoda.id}
            position={[pagoda.latitude, pagoda.longitude]}
            icon={new L.Icon({
              iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            })}
          >
            <Popup>
              <h3>{pagoda.name}</h3>
              <p>{pagoda.description}</p>
              <button onClick={() => handleRemovePagoda(pagoda.id)}>Delete</button>
              <button onClick={() => {
                setEditPagoda(pagoda);
                setIsEditModalOpen(true);
              }} style={{ marginLeft: '10px' }}>Edit</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
    
  );
};

export default App;