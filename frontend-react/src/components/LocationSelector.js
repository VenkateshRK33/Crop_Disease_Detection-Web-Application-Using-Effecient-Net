import React, { useState } from 'react';
import './LocationSelector.css';

const LocationSelector = ({ onLocationSelect }) => {
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUseCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get location name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          const location = {
            lat: latitude,
            lon: longitude,
            name: data.address?.city || data.address?.town || data.address?.village || 'Current Location'
          };
          
          setSelectedLocation(location);
          onLocationSelect(location);
        } catch (err) {
          console.error('Error getting location name:', err);
          const location = {
            lat: latitude,
            lon: longitude,
            name: 'Current Location'
          };
          setSelectedLocation(location);
          onLocationSelect(location);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setError('Unable to retrieve your location. Please enter manually.');
        setLoading(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Geocode the location name to get coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInput)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data.length === 0) {
        setError('Location not found. Please try a different search.');
        setLoading(false);
        return;
      }

      const location = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: data[0].display_name.split(',')[0]
      };

      setSelectedLocation(location);
      onLocationSelect(location);
    } catch (err) {
      setError('Error finding location. Please try again.');
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-selector">
      <div className="location-selector-card">
        <h3 className="location-selector-title">Select Location</h3>
        
        <form onSubmit={handleManualLocationSubmit} className="location-form">
          <div className="location-input-group">
            <input
              type="text"
              className="location-input"
              placeholder="Enter city or location name..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !locationInput.trim()}
            >
              Search
            </button>
          </div>
        </form>

        <div className="location-divider">
          <span>OR</span>
        </div>

        <button
          className="btn btn-secondary use-gps-btn"
          onClick={handleUseCurrentLocation}
          disabled={loading}
        >
          <span className="gps-icon">📍</span>
          Use Current Location
        </button>

        {selectedLocation && (
          <div className="selected-location">
            <span className="location-icon">📍</span>
            <span className="location-name">{selectedLocation.name}</span>
            <span className="location-coords">
              ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)})
            </span>
          </div>
        )}

        {error && (
          <div className="location-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
