/**
 * Example: How to integrate PredictionHistory component into App.js
 * 
 * This file shows how to use the PredictionHistory component.
 * You can integrate it in your App.js like this:
 */

/*
import React, { useState } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import VisualPipeline from './components/VisualPipeline';
import Results from './components/Results';
import PredictionHistory from './components/PredictionHistory';

function App() {
  const [pipelineSteps, setPipelineSteps] = useState([...]);
  const [results, setResults] = useState(null);
  const [showPipeline, setShowPipeline] = useState(false);
  const [userId, setUserId] = useState(null); // Add userId state
  const [showHistory, setShowHistory] = useState(false); // Toggle history view

  // ... existing functions ...

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌱 Plant Disease AI Assistant</h1>
        <p>Upload a plant image to get instant AI-powered diagnosis and treatment advice</p>
        
        {/* Add a button to toggle history view *\/}
        {userId && (
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="history-toggle-btn"
          >
            {showHistory ? '📸 New Analysis' : '📜 View History'}
          </button>
        )}
      </header>

      {!showHistory ? (
        <>
          <ImageUpload 
            onAnalysisStart={() => setShowPipeline(true)}
            onAnalysisComplete={handleAnalysisComplete}
            updatePipelineStep={updatePipelineStep}
          />
          {showPipeline && <VisualPipeline steps={pipelineSteps} />}
          {results && <Results data={results} />}
        </>
      ) : (
        <PredictionHistory 
          userId={userId}
          onPredictionClick={(prediction) => {
            console.log('Clicked prediction:', prediction);
            // Optionally load the prediction details
            setShowHistory(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
*/

/**
 * Component Props:
 * 
 * @param {string} userId - The user's ID to fetch their prediction history
 * @param {function} onPredictionClick - Optional callback when a prediction is clicked
 * 
 * Example usage:
 * <PredictionHistory 
 *   userId="507f1f77bcf86cd799439011"
 *   onPredictionClick={(prediction) => console.log(prediction)}
 * />
 */
