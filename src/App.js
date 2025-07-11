import React, { useState, useEffect } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Select from 'react-select';
import Modal from 'react-modal';

const App = () => {
  const [pagodas, setPagodas] = useState([]);
  const [selectedPagoda, setSelectedPagoda] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPagoda, setNewPagoda] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  // Fetch pagodas data from the backend
  useEffect(() => {
    const fetchPagodas = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pagodas');
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
    const filtered = pagodas.filter((pagoda) =>
      pagoda.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setPagodas(filtered);
  };

  // Handle selection from the dropdown
  const handleSelect = (selectedOption) => {
    setSelectedPagoda(selectedOption);
    setSearchQuery(selectedOption.label); // Update search query with selected name
  };

  // Handle manual input change for the search bar
  const handleInputSearchChange = (newValue) => {
    setSearchQuery(newValue);  // Keep the text typed by the user
  };

  // Handle adding a new pagoda
  const handleAddPagoda = async () => {
    const { name, latitude, longitude, description } = newPagoda;
    if (name && latitude && longitude && description) {
      try {
        const response = await fetch('http://localhost:5000/api/pagodas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newPagoda)
        });
        const addedPagoda = await response.json();
        setPagodas([...pagodas, addedPagoda]); // Add the new pagoda to the list
        setNewPagoda({ name: '', latitude: '', longitude: '', description: '' }); // Clear the form
        setIsModalOpen(false); // Close the modal
      } catch (error) {
        console.error('Error adding pagoda:', error);
      }
    }
  };

  // Handle removing a pagoda
  const handleRemovePagoda = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pagodas/${id}`, {
        method: 'DELETE'
      });
      const removedPagoda = await response.json();
      setPagodas(pagodas.filter(pagoda => pagoda.id !== removedPagoda.id)); // Remove the pagoda from the list
    } catch (error) {
      console.error('Error deleting pagoda:', error);
    }
  };

  // Filter pagodas based on search query
  const filteredPagodas = pagodas.filter((pagoda) =>
    pagoda.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to center the map on the selected pagoda
  const CenterMapOnPagoda = () => {
    const map = useMap();
    if (selectedPagoda) {
      const { latitude, longitude } = selectedPagoda.value;
      map.flyTo([latitude, longitude], 14); // Fly to the selected pagoda's location with zoom level 14
    }
    return null;
  };

  return (
    <div className="App">
      <h1>Pagodas in Vietnam</h1>

      {/* Button to Open Modal */}
      <button 
        className="open-modal-btn" 
        onClick={() => setIsModalOpen(true)}>
        Add New Pagoda
      </button>

      {/* Modal for Adding Pagoda */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)} // Close modal
        contentLabel="Add New Pagoda"
        className="modal"
        overlayClassName="overlay"
      >
        <h3>Add New Pagoda</h3>
        <input
          type="text"
          name="name"
          placeholder="Pagoda Name"
          value={newPagoda.name}
          onChange={(e) => setNewPagoda({ ...newPagoda, name: e.target.value })}
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
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newPagoda.description}
          onChange={(e) => setNewPagoda({ ...newPagoda, description: e.target.value })}
        />
        <button onClick={handleAddPagoda}>Add Pagoda</button>
        <button onClick={() => setIsModalOpen(false)}>Close</button>
      </Modal>

      {/* Search Box */}
      <div className="search-box">
        <Select
          value={selectedPagoda ? { label: selectedPagoda.label, value: selectedPagoda.value } : { label: searchQuery, value: searchQuery }}
          onChange={handleSelect}
          onInputChange={handleInputSearchChange}  // Dynamically update text while typing
          options={filteredPagodas.map((pagoda) => ({
            label: pagoda.name,
            value: pagoda,
          }))}
          placeholder="Search Pagoda"
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
              iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Map_pin_icon.svg/120px-Map_pin_icon.svg.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })}
          >
            <Popup>
              <h3>{pagoda.name}</h3>
              <p>{pagoda.description}</p>
              <button onClick={() => handleRemovePagoda(pagoda.id)}>Remove</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default App;
