import React, { useState } from 'react';
import './CropSelector.css';

/**
 * Crop Selection Component
 * Dropdown with search/filter functionality for selecting crops
 */
const CropSelector = ({ selectedCrop, onCropChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Common crops in India
  const crops = [
    { id: 'wheat', name: 'Wheat (गेहूं)', icon: '🌾' },
    { id: 'rice', name: 'Rice (चावल)', icon: '🌾' },
    { id: 'tomato', name: 'Tomato (टमाटर)', icon: '🍅' },
    { id: 'potato', name: 'Potato (आलू)', icon: '🥔' },
    { id: 'onion', name: 'Onion (प्याज)', icon: '🧅' },
    { id: 'cotton', name: 'Cotton (कपास)', icon: '🌱' },
    { id: 'sugarcane', name: 'Sugarcane (गन्ना)', icon: '🎋' },
    { id: 'maize', name: 'Maize (मक्का)', icon: '🌽' },
    { id: 'soybean', name: 'Soybean (सोयाबीन)', icon: '🫘' },
    { id: 'chickpea', name: 'Chickpea (चना)', icon: '🫘' },
    { id: 'mustard', name: 'Mustard (सरसों)', icon: '🌼' },
    { id: 'groundnut', name: 'Groundnut (मूंगफली)', icon: '🥜' }
  ];

  // Filter crops based on search term
  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCropSelect = (cropId) => {
    onCropChange(cropId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedCropData = crops.find(c => c.id === selectedCrop);

  return (
    <div className="crop-selector">
      <label className="crop-selector-label">Select Crop</label>
      <div className="crop-selector-dropdown">
        <button
          className="crop-selector-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <span className="crop-selector-value">
            {selectedCropData ? (
              <>
                <span className="crop-icon">{selectedCropData.icon}</span>
                {selectedCropData.name}
              </>
            ) : (
              'Select a crop...'
            )}
          </span>
          <span className={`crop-selector-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className="crop-selector-menu">
            <div className="crop-selector-search">
              <input
                type="text"
                placeholder="Search crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="crop-selector-search-input"
                autoFocus
              />
            </div>
            <ul className="crop-selector-list">
              {filteredCrops.length > 0 ? (
                filteredCrops.map(crop => (
                  <li
                    key={crop.id}
                    className={`crop-selector-item ${crop.id === selectedCrop ? 'selected' : ''}`}
                    onClick={() => handleCropSelect(crop.id)}
                  >
                    <span className="crop-icon">{crop.icon}</span>
                    {crop.name}
                  </li>
                ))
              ) : (
                <li className="crop-selector-item no-results">
                  No crops found
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropSelector;
