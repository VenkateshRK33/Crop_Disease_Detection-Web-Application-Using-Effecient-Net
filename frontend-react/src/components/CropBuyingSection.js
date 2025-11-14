import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CropBuyingSection.css';

/**
 * Crop Buying Section Component
 * Allows farmers to browse and buy crops at minimum prices
 */
const CropBuyingSection = () => {
  const [availableCrops, setAvailableCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'seeds', 'fertilizers', 'pesticides', 'equipment'];

  useEffect(() => {
    fetchAvailableCrops();
  }, []);

  const fetchAvailableCrops = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/marketplace/crops-for-sale');
      if (response.data.success) {
        setAvailableCrops(response.data.crops);
      }
    } catch (error) {
      console.error('Error fetching crops for sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = availableCrops.filter(crop => {
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuyNow = (crop) => {
    // Implement buy functionality
    alert(`Initiating purchase for ${crop.name}. Contact: ${crop.sellerContact}`);
  };

  const handleContactSeller = (crop) => {
    // Implement contact functionality
    window.location.href = `tel:${crop.sellerContact}`;
  };

  if (loading) {
    return (
      <div className="crop-buying-section">
        <h2 className="section-title">🛒 Buy Agricultural Products</h2>
        <div className="loading-state">Loading available products...</div>
      </div>
    );
  }

  return (
    <div className="crop-buying-section">
      <div className="section-header">
        <h2 className="section-title">🛒 Buy Agricultural Products</h2>
        <p className="section-description">
          Browse and purchase quality seeds, fertilizers, and equipment at competitive prices
        </p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="crops-grid">
        {filteredCrops.length === 0 ? (
          <div className="empty-state">
            <p>No products found matching your criteria</p>
          </div>
        ) : (
          filteredCrops.map(crop => (
            <div key={crop.id} className="crop-card">
              <div className="crop-image">
                <img src={crop.image || '/placeholder-crop.jpg'} alt={crop.name} />
                {crop.discount && (
                  <span className="discount-badge">{crop.discount}% OFF</span>
                )}
              </div>
              
              <div className="crop-info">
                <h3 className="crop-name">{crop.name}</h3>
                <p className="crop-description">{crop.description}</p>
                
                <div className="crop-details">
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{crop.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">{crop.quantity} {crop.unit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{crop.location}</span>
                  </div>
                </div>

                <div className="price-section">
                  {crop.originalPrice && (
                    <span className="original-price">₹{crop.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                  <span className="current-price">₹{crop.price.toLocaleString('en-IN')}</span>
                  <span className="price-unit">/{crop.unit}</span>
                </div>

                <div className="seller-info">
                  <span className="seller-icon">👤</span>
                  <span className="seller-name">{crop.sellerName}</span>
                  <span className="seller-rating">⭐ {crop.rating || '4.5'}</span>
                </div>

                <div className="action-buttons">
                  <button 
                    className="btn-contact"
                    onClick={() => handleContactSeller(crop)}
                  >
                    📞 Contact
                  </button>
                  <button 
                    className="btn-buy"
                    onClick={() => handleBuyNow(crop)}
                  >
                    🛒 Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CropBuyingSection;
