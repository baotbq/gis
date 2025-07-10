import React, { useState, useEffect } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Select from 'react-select';

// Sample Pagoda data (you can replace this with API or database data)
import pagodasData from './pagodas.json';

const App = () => {
  const [pagodas, setPagodas] = useState([]);
  const [filteredPagodas, setFilteredPagodas] = useState([]);
  const [selectedPagoda, setSelectedPagoda] = useState(null);

  // Load pagodas data
  useEffect(() => {
    setPagodas(pagodasData);
    setFilteredPagodas(pagodasData); // Initially, display all pagodas
  }, []);

  // Handle search input change
  const handleSearchChange = (inputValue) => {
    // Filter pagodas by name (case-insensitive)
    const filtered = pagodas.filter((pagoda) =>
      pagoda.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredPagodas(filtered);
  };

  // Handle selection from the dropdown
  const handleSelect = (selectedOption) => {
    setSelectedPagoda(selectedOption);
    // Zoom and center the map on the selected pagoda
  };

  return (
    <div className="App">
      <h1>Pagodas in Vietnam</h1>
      
      {/* Search Box */}
      <div className="search-box">
        <Select
          value={selectedPagoda}
          onChange={handleSelect}
          options={filteredPagodas.map((pagoda) => ({
            label: pagoda.name,
            value: pagoda,
          }))}
          onInputChange={handleSearchChange}
          placeholder="Search Pagoda"
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value.name}
        />
      </div>

      {/* Map */}
      <MapContainer center={[14.0583, 108.2772]} zoom={6} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredPagodas.map((pagoda, index) => (
          <Marker
            key={index}
            position={[pagoda.latitude, pagoda.longitude]}
            icon={new L.Icon({
              iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Map_pin_icon.svg/120px-Map_pin_icon.svg.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })}
          >
            <Popup>
              <h3>{pagoda.name}</h3>
              <p>{pagoda.description}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default App;
