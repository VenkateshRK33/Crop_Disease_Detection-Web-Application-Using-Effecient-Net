import React, { useState } from 'react';
import './HarvestCalculatorForm.css';

const HarvestCalculatorForm = ({ onCalculate, loading, initialCrop, initialPest, initialMaturity }) => {
  const [formData, setFormData] = useState({
    cropType: initialCrop ? initialCrop.charAt(0).toUpperCase() + initialCrop.slice(1) : '',
    currentMaturity: initialMaturity ? parseInt(initialMaturity) : 50,
    pestInfestation: initialPest ? parseInt(initialPest) : 10,
    currentMarketPrice: '',
    expectedYield: ''
  });

  const [errors, setErrors] = useState({});

  const cropOptions = [
    'Wheat', 'Rice', 'Tomato', 'Potato', 'Onion', 
    'Cotton', 'Sugarcane', 'Maize', 'Soybean', 
    'Chickpea', 'Mustard', 'Groundnut'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cropType) {
      newErrors.cropType = 'Please select a crop type';
    }

    if (!formData.currentMarketPrice || parseFloat(formData.currentMarketPrice) <= 0) {
      newErrors.currentMarketPrice = 'Please enter a valid market price';
    }

    if (!formData.expectedYield || parseFloat(formData.expectedYield) <= 0) {
      newErrors.expectedYield = 'Please enter a valid expected yield';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCalculate({
        cropType: formData.cropType,
        currentMaturity: parseFloat(formData.currentMaturity),
        pestInfestation: parseFloat(formData.pestInfestation),
        currentMarketPrice: parseFloat(formData.currentMarketPrice),
        expectedYield: parseFloat(formData.expectedYield)
      });
    }
  };

  return (
    <form className="harvest-calculator-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Crop Information</h3>
        
        <div className="form-group">
          <label htmlFor="cropType">
            Crop Type <span className="required">*</span>
          </label>
          <select
            id="cropType"
            name="cropType"
            value={formData.cropType}
            onChange={handleChange}
            className={errors.cropType ? 'error' : ''}
          >
            <option value="">Select a crop</option>
            {cropOptions.map(crop => (
              <option key={crop} value={crop.toLowerCase()}>
                {crop}
              </option>
            ))}
          </select>
          {errors.cropType && <span className="error-message">{errors.cropType}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="currentMaturity">
            Current Maturity: {formData.currentMaturity}%
          </label>
          <input
            type="range"
            id="currentMaturity"
            name="currentMaturity"
            min="0"
            max="100"
            value={formData.currentMaturity}
            onChange={handleChange}
            className="slider"
          />
          <div className="slider-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pestInfestation">
            Pest Infestation: {formData.pestInfestation}%
          </label>
          <input
            type="range"
            id="pestInfestation"
            name="pestInfestation"
            min="0"
            max="100"
            value={formData.pestInfestation}
            onChange={handleChange}
            className="slider pest-slider"
          />
          <div className="slider-labels">
            <span>None</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Market & Yield Information</h3>
        
        <div className="form-group">
          <label htmlFor="currentMarketPrice">
            Current Market Price (₹/quintal) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="currentMarketPrice"
            name="currentMarketPrice"
            value={formData.currentMarketPrice}
            onChange={handleChange}
            placeholder="e.g., 2500"
            min="0"
            step="10"
            className={errors.currentMarketPrice ? 'error' : ''}
          />
          {errors.currentMarketPrice && (
            <span className="error-message">{errors.currentMarketPrice}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="expectedYield">
            Expected Yield (quintals) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="expectedYield"
            name="expectedYield"
            value={formData.expectedYield}
            onChange={handleChange}
            placeholder="e.g., 50"
            min="0"
            step="0.1"
            className={errors.expectedYield ? 'error' : ''}
          />
          {errors.expectedYield && (
            <span className="error-message">{errors.expectedYield}</span>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        className="calculate-button"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Calculating...
          </>
        ) : (
          <>
            <span className="icon">📊</span>
            Calculate Optimal Time
          </>
        )}
      </button>
    </form>
  );
};

export default HarvestCalculatorForm;
