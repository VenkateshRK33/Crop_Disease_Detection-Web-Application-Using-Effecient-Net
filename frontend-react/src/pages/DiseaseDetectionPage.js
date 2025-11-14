import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import ImageUpload from '../components/ImageUpload';
import Results from '../components/Results';
import VisualPipeline from '../components/VisualPipeline';
import './DiseaseDetectionPage.css';

/**
 * DiseaseDetectionPage Component
 * Main page for plant disease detection with ML analysis and AI chatbot
 * Integrates existing disease detection functionality into the multi-page platform
 */
const DiseaseDetectionPage = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState([
    { id: 1, label: 'Upload & Process', status: 'pending', icon: '📤', message: '' },
    { id: 2, label: 'Detect Disease', status: 'pending', icon: '🔬', message: '' },
    { id: 3, label: 'AI Consultation', status: 'pending', icon: '🤖', message: '' }
  ]);

  // Temporary user ID (in production, this would come from authentication)
  const userId = 'demo-user-123';

  // Handle analysis start
  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisData(null);
  };

  // Handle analysis completion
  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setIsAnalyzing(false);
  };

  // Update pipeline step status
  const updatePipelineStep = (stepId, status, message = '') => {
    setPipelineSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, status, message } : step
      )
    );
  };

  return (
    <PageLayout>
      <div className="disease-detection-page">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">🔬 Plant Disease Detection</h1>
          <p className="page-description">
            Upload a photo of your plant to get instant AI-powered disease diagnosis and treatment recommendations
          </p>
        </div>

        {/* Main Content */}
        <div className="detection-content">
          {/* Upload Section */}
          <ImageUpload
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            updatePipelineStep={updatePipelineStep}
          />

          {/* Visual Pipeline */}
          {isAnalyzing && (
            <VisualPipeline steps={pipelineSteps} />
          )}

          {/* Results Section */}
          {analysisData && (
            <Results data={analysisData} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DiseaseDetectionPage;
