import { useState } from 'react';
import axios from 'axios';
import './ImageUpload.css';

const API_URL = 'http://localhost:4000';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * ImageUpload Component
 * Handles plant image upload with drag-and-drop support, validation, and analysis
 * 
 * @param {Function} onAnalysisStart - Callback when analysis begins
 * @param {Function} onAnalysisComplete - Callback with analysis results
 * @param {Function} updatePipelineStep - Updates visual pipeline status
 */
function ImageUpload({ onAnalysisStart, onAnalysisComplete, updatePipelineStep }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validate file type and size
  const validateFile = (file) => {
    setError(null);

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB. Please upload a smaller image.');
      return false;
    }

    return true;
  };

  // Handle file selection from input
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  // Handle analysis with timeout and error handling
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    onAnalysisStart();

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      // Step 1: Upload and analyze
      updatePipelineStep(1, 'active', 'Processing image...');

      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      updatePipelineStep(1, 'complete', '✓ Image analyzed');

      // Step 2: Disease detected
      const { prediction } = response.data;
      updatePipelineStep(2, 'active', `Detected: ${prediction.disease}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatePipelineStep(2, 'complete', `✓ ${prediction.disease}`);

      // Step 3: AI consulting
      updatePipelineStep(3, 'active', 'Generating advice...');
      
      // Pass data to parent
      onAnalysisComplete({
        ...response.data,
        imageUrl: preview
      });

      updatePipelineStep(3, 'complete', '✓ Advice ready');

    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle different error types
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (error.response) {
        // Server responded with error
        setError(error.response.data.message || 'Error analyzing image. Please try again.');
      } else if (error.request) {
        // Network error
        setError('Network error. Please check your connection and ensure the backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      
      // Reset pipeline steps
      updatePipelineStep(1, 'pending', '');
      updatePipelineStep(2, 'pending', '');
      updatePipelineStep(3, 'pending', '');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Retry analysis
  const handleRetry = () => {
    setError(null);
    handleAnalyze();
  };

  return (
    <div className="upload-section">
      <div 
        className={`upload-box ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          id="imageInput"
        />
        <label htmlFor="imageInput">
          <div className="upload-icon">📸</div>
          <div className="upload-text">
            {preview ? 'Change Image' : 'Click or drag to upload plant image'}
          </div>
          <div className="upload-hint">
            Supported formats: JPG, PNG, WEBP (Max 10MB)
          </div>
        </label>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          {error.includes('Network') || error.includes('timed out') ? (
            <button className="btn-retry" onClick={handleRetry}>
              Retry
            </button>
          ) : null}
        </div>
      )}

      {preview && (
        <div className="preview-container">
          <img src={preview} alt="Preview" className="preview-image" />
          <div className="preview-actions">
            <button 
              className="btn-remove" 
              onClick={handleRemoveImage}
              disabled={isAnalyzing}
            >
              Remove Image
            </button>
            <button 
              className="btn-analyze" 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Plant'}
            </button>
          </div>
          {isAnalyzing && (
            <div className="analyzing-progress">
              <div className="analyzing-progress-bar"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
