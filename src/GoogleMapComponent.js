import React, { useEffect, useRef } from 'react';

const GoogleMapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Load the Google Maps script
    const existingScript = document.getElementById('googleMaps');

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
      script.id = 'googleMaps';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        initMap();
      };
    } else {
      initMap();
    }

    function initMap() {
      if (window.google && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 21.028511, lng: 105.804817 }, // Hanoi coordinates
          zoom: 12,
        });

        // Example: Add a marker
        new window.google.maps.Marker({
          position: { lat: 21.028511, lng: 105.804817 },
          map,
          title: 'Hanoi',
        });
      }
    }
  }, []);

  return (
    <div>
      <h2>Google Map Example</h2>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
};

export default GoogleMapComponent;
