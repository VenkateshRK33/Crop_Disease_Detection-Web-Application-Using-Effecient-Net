import { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get initial AI advice on mount
  useEffect(() => {
    streamAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const streamAdvice = async (question = null) => {
    setIsLoading(true);

    const url = question
      ? `${API_URL}/api/chat/stream/${conversationId}?question=${encodeURIComponent(question)}`
      : `${API_URL}/api/chat/stream/${conversationId}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullText = '';
      const messageId = Date.now();

      // Add message placeholder
      setMessages(prev => [...prev, { id: messageId, role: 'assistant', content: '', isStreaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              if (jsonData.chunk) {
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
              // Ignore parse errors for incomplete JSON chunks
            }
          }
        }
      }
    } catch (error) {
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isStreaming: false
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

      {/* Chatbot Interface */}
      <div className="chatbot">
        <div className="messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
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
    </div>
  );
}

export default Results;
