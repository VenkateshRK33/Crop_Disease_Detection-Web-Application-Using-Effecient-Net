import { useState } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import VisualPipeline from './components/VisualPipeline';
import Results from './components/Results';

/**
 * Main App Component
 * Orchestrates the plant disease detection workflow
 */
function App() {
  const [pipelineSteps, setPipelineSteps] = useState([
    { id: 1, label: 'Analyzing Image', status: 'pending', icon: '📸' },
    { id: 2, label: 'Disease Detection', status: 'pending', icon: '🔍' },
    { id: 3, label: 'AI Expert Consulting', status: 'pending', icon: '🤖' }
  ]);

  const [results, setResults] = useState(null);
  const [showPipeline, setShowPipeline] = useState(false);

  const updatePipelineStep = (stepId, status, message) => {
    setPipelineSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  const handleAnalysisComplete = (data) => {
    setResults(data);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌱 Plant Disease AI Assistant</h1>
        <p>Upload a plant image to get instant AI-powered diagnosis and treatment advice</p>
      </header>

      <ImageUpload 
        onAnalysisStart={() => setShowPipeline(true)}
        onAnalysisComplete={handleAnalysisComplete}
        updatePipelineStep={updatePipelineStep}
      />

      {showPipeline && <VisualPipeline steps={pipelineSteps} />}

      {results && <Results data={results} />}
    </div>
  );
}

export default App;
