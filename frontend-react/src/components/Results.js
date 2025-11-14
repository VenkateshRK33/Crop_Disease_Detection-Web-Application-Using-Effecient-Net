import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PriceComparisonChart from './PriceComparisonChart';
import PriceTrendChart from './PriceTrendChart';
import MarketDetailsTable from './MarketDetailsTable';
import './Results.css';

const API_URL = 'http://localhost:4000';

/**
 * Results Component
 * Displays disease prediction results and interactive chatbot interface
 * 
 * @param {Object} data - Analysis results containing prediction, conversationId, suggestedQuestions, imageUrl
 */
function Results({ data }) {
  const { prediction, conversationId, suggestedQuestions, imageUrl } = data;
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Market data states
  const [marketData, setMarketData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [cropType, setCropType] = useState('');
  const [showMarketInfo, setShowMarketInfo] = useState(false);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract crop type from disease name
  useEffect(() => {
    if (prediction && prediction.disease) {
      // Extract crop name from disease (e.g., "Tomato_Bacterial_Spot" -> "tomato")
      const detectedCrop = prediction.disease.split('_')[0].toLowerCase();
      setCropType(detectedCrop);
      
      // Fetch market data for detected crop
      fetchMarketData(detectedCrop);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction]);

  // Get initial AI advice when chat is opened for the first time
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      streamAdvice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen]);

  // Fetch market data for crop
  const fetchMarketData = async (crop) => {
    setLoadingMarket(true);
    try {
      const [pricesResponse, trendResponse] = await Promise.all([
        axios.get(`${API_URL}/api/market-prices/${crop}`),
        axios.get(`${API_URL}/api/market-prices/${crop}/history?days=30`)
      ]);
      
      if (pricesResponse.data.success) {
        setMarketData(pricesResponse.data.markets);
      }
      
      if (trendResponse.data.success) {
        setTrendData(trendResponse.data.trend);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoadingMarket(false);
    }
  };

  const streamAdvice = async (question = null) => {
    setIsLoading(true);

    const url = question
      ? `${API_URL}/api/chat/stream/${conversationId}?question=${encodeURIComponent(question)}`
      : `${API_URL}/api/chat/stream/${conversationId}`;

    const messageId = Date.now();
    let fullText = '';
    let hasReceivedData = false;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Add message placeholder only after confirming connection
      setMessages(prev => [...prev, { id: messageId, role: 'assistant', content: '', isStreaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              
              if (jsonData.error) {
                throw new Error(jsonData.error);
              }
              
              if (jsonData.chunk) {
                hasReceivedData = true;
                fullText += jsonData.chunk;
                // Update message content as it streams
                setMessages(prev => prev.map(msg =>
                  msg.id === messageId ? { ...msg, content: fullText } : msg
                ));
              }
              
              if (jsonData.done) {
                // Mark streaming as complete
                setMessages(prev => prev.map(msg =>
                  msg.id === messageId ? { ...msg, isStreaming: false } : msg
                ));
              }
            } catch (e) {
              // Only log parse errors, don't throw
              if (line.length > 6) {
                console.warn('Parse error:', e.message);
              }
            }
          }
        }
      }

      // If no data was received, show error
      if (!hasReceivedData) {
        throw new Error('No response received from server');
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove the placeholder message if it exists
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: `Sorry, I couldn't get a response. ${error.message}. Please make sure the chatbot server is running and try again.`,
        isStreaming: false,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const question = userInput;
    setUserInput('');
    setHasAskedQuestion(true);

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: question
    }]);

    // Get AI response
    await streamAdvice(question);
  };

  const handleSuggestedQuestion = async (question) => {
    if (isLoading) return;
    
    setHasAskedQuestion(true);

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: question
    }]);

    // Get AI response
    await streamAdvice(question);
  };

  // Format disease name (replace underscores with spaces and capitalize)
  const formatDiseaseName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Check if confidence is low
  const isLowConfidence = prediction.confidence < 0.5;

  return (
    <div className="results-section">
      {/* Disease Card */}
      <div className="disease-card">
        <div className="disease-image-container">
          <img src={imageUrl} alt="Uploaded plant" className="result-image" />
        </div>
        
        <div className="disease-info">
          <h2 className="disease-name">{formatDiseaseName(prediction.disease)}</h2>
          
          <div className="confidence-display">
            <div className="confidence-bar-container">
              <div 
                className={`confidence-bar ${isLowConfidence ? 'low' : 'high'}`}
                style={{ width: `${prediction.confidence * 100}%` }}
              ></div>
            </div>
            <p className="confidence-text">
              Confidence: <strong>{(prediction.confidence * 100).toFixed(1)}%</strong>
            </p>
          </div>

          {/* Low Confidence Warning */}
          {isLowConfidence && (
            <div className="low-confidence-warning">
              <svg className="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div className="warning-content">
                <strong>Low Confidence Detection</strong>
                <p>Consider retaking the image with better lighting and focus for more accurate results.</p>
              </div>
            </div>
          )}

          {/* Top 3 Alternative Predictions */}
          {prediction.topPredictions && prediction.topPredictions.length > 1 && (
            <div className="alternative-predictions">
              <h3>Alternative Possibilities:</h3>
              <ul className="predictions-list">
                {prediction.topPredictions.slice(1, 4).map((pred, index) => (
                  <li key={index} className="prediction-item">
                    <span className="prediction-name">{formatDiseaseName(pred.class)}</span>
                    <span className="prediction-confidence">{(pred.confidence * 100).toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Market Information Section */}
      <div className="market-info-section">
        <div className="market-info-header">
          <h2 className="market-info-title">
            📊 Market Information for {formatDiseaseName(cropType)}
          </h2>
          <button 
            className="toggle-market-btn"
            onClick={() => setShowMarketInfo(!showMarketInfo)}
          >
            {showMarketInfo ? 'Hide Market Info' : 'Show Market Info'}
          </button>
        </div>

        {showMarketInfo && (
          <div className="market-info-content">
            {loadingMarket ? (
              <div className="market-loading">Loading market data...</div>
            ) : (
              <>
                <div className="market-charts">
                  <PriceComparisonChart 
                    data={marketData}
                    loading={loadingMarket}
                  />
                  <PriceTrendChart 
                    data={trendData}
                    loading={loadingMarket}
                  />
                </div>
                <MarketDetailsTable 
                  data={marketData}
                  loading={loadingMarket}
                />
                <div className="market-actions">
                  <a 
                    href={`/market-prices?crop=${cropType}`}
                    className="view-full-market-btn"
                  >
                    View Full Market Analysis →
                  </a>
                  <a 
                    href={`/harvest-calculator?crop=${cropType}&pest=${prediction.pest_infestation || 10}&maturity=${prediction.maturity || 50}`}
                    className="view-harvest-btn"
                  >
                    🌾 Smart Harvest Calculator (Auto-filled) →
                  </a>
                </div>
                
                {prediction.pest_infestation && prediction.maturity && (
                  <div className="auto-analysis-info">
                    <div className="info-icon">🤖</div>
                    <div className="info-content">
                      <strong>AI Analysis Complete:</strong>
                      <p>Based on the leaf image, we estimated <strong>{prediction.pest_infestation}% pest infestation</strong> and <strong>{prediction.maturity}% crop maturity</strong>. Click the harvest calculator above to see optimal harvest timing!</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Chatbot Button */}
      <button 
        className="chatbot-toggle-btn"
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label="Toggle AI Assistant"
      >
        {isChatOpen ? '✕' : '💬'}
        {!isChatOpen && <span className="chatbot-badge">AI Assistant</span>}
      </button>

      {/* Chatbot Interface */}
      {isChatOpen && (
        <div className="chatbot">
        <div className="messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
              <div className="message-content">
                {msg.content}
                {msg.isStreaming && <span className="cursor">|</span>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions - Show only before first user question */}
        {!hasAskedQuestion && suggestedQuestions && suggestedQuestions.length > 0 && (
          <div className="suggested-questions">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                className="suggested-btn"
                onClick={() => handleSuggestedQuestion(q)}
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="input-area">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a follow-up question..."
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        </div>
      )}
    </div>
  );
}

export default Results;
