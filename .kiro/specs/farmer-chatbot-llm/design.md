# Design Document

## Overview

This design outlines a farmer-friendly AI chatbot system that provides detailed plant disease information and treatment recommendations using a locally-running LLM. The system integrates with the existing EfficientNet ML model and uses Ollama to run models like Llama 3.2 or Mistral locally without API costs. The UI features a visual pipeline that shows farmers exactly how their plant image is being analyzed, with streaming responses that appear in real-time.

**Key Design Principles:**
- Local-first: LLM runs on the same machine, no API costs or internet dependency
- Transparent: Visual pipeline shows each processing step
- Farmer-friendly: Simple language, actionable advice, mobile-optimized
- Real-time feedback: Streaming responses create conversational feel
- Resilient: Fallback knowledge base when LLM unavailable

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Image Upload Component                                   │  │
│  │  • Drag & drop or file picker                             │  │
│  │  • Image preview                                          │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       ↓                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Visual Pipeline Component                                │  │
│  │  Step 1: [📸 Analyzing Image...] ●──○──○                 │  │
│  │  Step 2: [🔍 Disease Detected] ●──●──○                   │  │
│  │  Step 3: [🤖 AI Expert Consulting...] ●──●──●            │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       ↓                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chatbot Interface Component                              │  │
│  │  • Disease card (name, confidence, image)                 │  │
│  │  • Streaming message display                              │  │
│  │  • Suggested questions (clickable)                        │  │
│  │  • Text input for follow-up questions                     │  │
│  │  • Download/Print buttons                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP/WebSocket
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│              Node.js Backend (Port 4000)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express Routes                                           │  │
│  │  • POST /api/analyze-plant                                │  │
│  │  • POST /api/chat                                         │  │
│  │  • GET  /api/chat/stream (SSE)                            │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       ↓                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chatbot Service                                          │  │
│  │  • Disease context builder                                │  │
│  │  • Prompt template engine                                 │  │
│  │  • Conversation history manager                           │  │
│  │  • Fallback knowledge base                                │  │
│  └──────────────┬───────────────────┬───────────────────────┘  │
└─────────────────┼───────────────────┼───────────────────────────┘
                  │                   │
                  ↓                   ↓
┌─────────────────────────────┐  ┌──────────────────────────────┐
│  Python ML API (Port 5000)  │  │  Ollama (Port 11434)         │
│  ┌───────────────────────┐  │  │  ┌────────────────────────┐  │
│  │  EfficientNet Model   │  │  │  │  Llama 3.2 (3B)        │  │
│  │  • Image prediction   │  │  │  │  or                    │  │
│  │  • 16 disease classes │  │  │  │  Mistral (7B)          │  │
│  │  • Confidence scores  │  │  │  │  or                    │  │
│  └───────────────────────┘  │  │  │  Phi-3 (3.8B)          │  │
└─────────────────────────────┘  │  └────────────────────────┘  │
                                 │  • Streaming generation     │
                                 │  • Local inference          │
                                 │  • No API costs             │
                                 └──────────────────────────────┘
```

## Components and Interfaces

### 1. Frontend Components

#### ImageUploadComponent
```typescript
interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isAnalyzing: boolean;
}

// Features:
// - Drag & drop zone
// - File picker button
// - Image preview with crop type detection
// - Loading state during upload
```

#### VisualPipelineComponent
```typescript
interface PipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  icon: string;
  message?: string;
}

interface VisualPipelineProps {
  steps: PipelineStep[];
  currentStep: number;
}

// Steps:
// 1. Analyzing Image (ML model processing)
// 2. Disease Detected (show result)
// 3. Consulting AI Expert (LLM generating advice)
```

#### ChatbotInterfaceComponent
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface DiseaseInfo {
  name: string;
  confidence: number;
  imageUrl: string;
  topPredictions: Array<{class: string; confidence: number}>;
}

interface ChatbotInterfaceProps {
  diseaseInfo: DiseaseInfo;
  messages: Message[];
  onSendMessage: (message: string) => void;
  suggestedQuestions: string[];
  isLoading: boolean;
}

// Features:
// - Disease card at top
// - Chat message list (scrollable)
// - Streaming text animation
// - Suggested question buttons
// - Text input with send button
// - Download/Print buttons
```

### 2. Backend Services

#### ChatbotService (Node.js)
```javascript
class ChatbotService {
  constructor() {
    this.ollamaClient = new OllamaClient('http://localhost:11434');
    this.conversationHistory = new Map();
    this.fallbackKnowledge = new FallbackKnowledgeBase();
  }

  async generateAdvice(diseaseContext, conversationId) {
    // Build prompt with disease context
    const prompt = this.buildPrompt(diseaseContext);
    
    // Try Ollama LLM
    try {
      return await this.streamFromOllama(prompt, conversationId);
    } catch (error) {
      // Fallback to knowledge base
      return this.fallbackKnowledge.getAdvice(diseaseContext.diseaseName);
    }
  }

  buildPrompt(diseaseContext) {
    return `You are an agricultural expert helping farmers treat plant diseases.

Disease Detected: ${diseaseContext.diseaseName}
Confidence: ${diseaseContext.confidence}%
Crop Type: ${diseaseContext.cropType}

Provide clear, actionable advice in simple language. Include:
1. What is this disease (2-3 sentences)
2. Treatment options (organic and chemical)
3. Prevention methods
4. Timeline for treatment

Keep response under 300 words. Use simple farmer-friendly language.`;
  }

  async streamFromOllama(prompt, conversationId) {
    // Stream response from Ollama
    // Yield chunks as they arrive
  }

  getSuggestedQuestions(diseaseName) {
    return [
      "How do I apply this treatment?",
      "What are organic alternatives?",
      "How can I prevent this in future?",
      "Is this contagious to other plants?"
    ];
  }
}
```

#### API Routes (Express)
```javascript
// POST /api/analyze-plant
// 1. Forward image to Python ML API
// 2. Get disease prediction
// 3. Create disease context
// 4. Initialize conversation
// 5. Return disease info + conversation ID

// POST /api/chat
// Send follow-up question
// Maintain conversation history
// Return streaming response

// GET /api/chat/stream/:conversationId
// Server-Sent Events endpoint
// Stream LLM response in real-time
```

### 3. Ollama Integration

#### Model Selection
```bash
# Recommended models (in order of speed/quality):

# Option 1: Llama 3.2 3B (Fastest, good quality)
ollama pull llama3.2:3b

# Option 2: Phi-3 Mini (Balanced)
ollama pull phi3:mini

# Option 3: Mistral 7B (Best quality, slower)
ollama pull mistral:7b
```

#### Ollama Client
```javascript
class OllamaClient {
  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
    this.model = 'llama3.2:3b'; // Default model
  }

  async *streamGenerate(prompt, options = {}) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
          ...options
        }
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);
      
      for (const line of lines) {
        const data = JSON.parse(line);
        if (data.response) {
          yield data.response;
        }
      }
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

## Data Models

### Disease Context
```typescript
interface DiseaseContext {
  diseaseName: string;
  confidence: number;
  cropType: string;
  topPredictions: Array<{
    class: string;
    confidence: number;
  }>;
  imageUrl: string;
  timestamp: Date;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  diseaseContext: DiseaseContext;
  messages: Message[];
  createdAt: Date;
  lastActivity: Date;
}
```

### Fallback Knowledge Entry
```typescript
interface DiseaseKnowledge {
  diseaseName: string;
  description: string;
  symptoms: string[];
  causes: string[];
  organicTreatments: string[];
  chemicalTreatments: string[];
  prevention: string[];
  timeline: string;
}
```

## Data Flow

### Initial Analysis Flow
```
1. User uploads plant image
   ↓
2. Frontend shows "Analyzing Image" step
   ↓
3. POST /api/analyze-plant
   ↓
4. Node.js forwards to Python ML API
   ↓
5. ML model predicts disease
   ↓
6. Frontend shows "Disease Detected" step
   ↓
7. Node.js creates disease context
   ↓
8. Node.js calls Ollama with prompt
   ↓
9. Frontend shows "AI Expert Consulting" step
   ↓
10. Ollama streams response
    ↓
11. Node.js forwards stream to frontend (SSE)
    ↓
12. Frontend displays streaming text
    ↓
13. Complete! Show suggested questions
```

### Follow-up Question Flow
```
1. User types question or clicks suggested question
   ↓
2. POST /api/chat with conversationId
   ↓
3. Node.js adds to conversation history
   ↓
4. Node.js builds prompt with context
   ↓
5. Ollama generates response (streaming)
   ↓
6. Frontend displays streaming response
```

## Error Handling

### LLM Unavailable
```javascript
async function handleLLMError(diseaseContext) {
  // Check if Ollama is running
  const isOllamaRunning = await ollamaClient.checkHealth();
  
  if (!isOllamaRunning) {
    return {
      error: 'OLLAMA_NOT_RUNNING',
      message: 'AI assistant is offline. Please start Ollama.',
      fallbackAdvice: fallbackKnowledge.getAdvice(diseaseContext.diseaseName)
    };
  }
  
  // Timeout or other error
  return {
    error: 'LLM_TIMEOUT',
    message: 'AI assistant is taking too long. Here\'s basic information:',
    fallbackAdvice: fallbackKnowledge.getAdvice(diseaseContext.diseaseName)
  };
}
```

### Fallback Knowledge Base
```javascript
const FALLBACK_KNOWLEDGE = {
  'Tomato_Late_blight': {
    description: 'Late blight is a serious fungal disease affecting tomatoes...',
    treatments: [
      'Remove and destroy infected plants immediately',
      'Apply copper-based fungicides',
      'Improve air circulation',
      'Avoid overhead watering'
    ],
    prevention: [
      'Plant resistant varieties',
      'Space plants properly',
      'Water at soil level',
      'Remove plant debris'
    ]
  },
  // ... other diseases
};
```

## UI/UX Design

### Visual Pipeline States
```css
/* Step indicator styling */
.pipeline-step {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.pipeline-step.pending {
  opacity: 0.5;
  background: #f5f5f5;
}

.pipeline-step.active {
  opacity: 1;
  background: #e3f2fd;
  animation: pulse 2s infinite;
}

.pipeline-step.complete {
  opacity: 1;
  background: #e8f5e9;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```

### Streaming Text Animation
```javascript
function StreamingText({ content, isComplete }) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    // Simulate typing effect
    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent(content.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setShowCursor(false);
      }
    }, 20); // 20ms per character

    return () => clearInterval(interval);
  }, [content]);

  return (
    <div className="streaming-text">
      {displayedContent}
      {showCursor && <span className="cursor">|</span>}
    </div>
  );
}
```

### Mobile-Responsive Layout
```css
/* Mobile-first design */
.chatbot-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 100%;
}

.disease-card {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.input-container {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

/* Tablet and desktop */
@media (min-width: 768px) {
  .chatbot-container {
    max-width: 800px;
    margin: 0 auto;
  }
}
```

## Testing Strategy

### Unit Tests
- Prompt template generation
- Disease context builder
- Fallback knowledge retrieval
- Conversation history management

### Integration Tests
- ML API → Chatbot service flow
- Ollama streaming response handling
- Error fallback scenarios
- SSE connection stability

### E2E Tests
- Complete user flow: upload → prediction → chat
- Follow-up questions
- Suggested questions
- Download/print functionality
- Mobile responsiveness

### Performance Tests
- LLM response time (target: <30s)
- Streaming latency
- Concurrent conversations
- Memory usage with conversation history

## Deployment Considerations

### Ollama Setup
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull recommended model
ollama pull llama3.2:3b

# Run Ollama (starts on port 11434)
ollama serve

# Test
curl http://localhost:11434/api/tags
```

### Environment Variables
```env
# .env file
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
ML_API_URL=http://localhost:5000
FALLBACK_MODE=true
MAX_CONVERSATION_HISTORY=10
STREAM_TIMEOUT_MS=45000
```

### System Requirements
- **RAM**: 8GB minimum (16GB recommended for 7B models)
- **CPU**: Modern multi-core processor
- **Storage**: 5-10GB for model files
- **OS**: Windows, macOS, or Linux

## Security Considerations

- Sanitize user input before sending to LLM
- Rate limit chat requests (max 10/minute per user)
- Validate image uploads (size, type, content)
- Don't log sensitive farmer data
- Implement conversation timeout (30 minutes)
- Clear conversation history on session end

## Future Enhancements

1. **Voice Input**: Allow farmers to ask questions via voice
2. **Multi-language**: Support local languages (Hindi, Spanish, etc.)
3. **Image Comparison**: Show before/after treatment examples
4. **Weather Integration**: Factor in local weather for treatment timing
5. **Cost Calculator**: Estimate treatment costs based on farm size
6. **Community Forum**: Connect farmers with similar disease issues
7. **Offline Mode**: Cache common advice for offline access
8. **SMS Notifications**: Send treatment reminders via SMS


## Temporary Demo Page

### Purpose
A standalone HTML page to test the ML model + chatbot integration without needing the full MERN stack. This allows quick testing and demonstration.

### Demo Page Features
```html
<!-- demo.html - Single page application -->
<!DOCTYPE html>
<html>
<head>
  <title>Plant Disease AI Assistant - Demo</title>
  <style>
    /* Simple, clean styling */
    /* Mobile-responsive */
    /* Visual pipeline animations */
  </style>
</head>
<body>
  <div class="demo-container">
    <!-- Header -->
    <header>
      <h1>🌱 Plant Disease AI Assistant</h1>
      <p>Upload a plant image to get instant diagnosis and treatment advice</p>
    </header>

    <!-- Image Upload Section -->
    <section class="upload-section">
      <input type="file" id="imageInput" accept="image/*">
      <button onclick="analyzeImage()">Analyze Plant</button>
      <div id="imagePreview"></div>
    </section>

    <!-- Visual Pipeline -->
    <section class="pipeline-section" id="pipeline" style="display:none">
      <div class="step" id="step1">
        <span class="icon">📸</span>
        <span class="label">Analyzing Image...</span>
        <span class="status"></span>
      </div>
      <div class="step" id="step2">
        <span class="icon">🔍</span>
        <span class="label">Disease Detection</span>
        <span class="status"></span>
      </div>
      <div class="step" id="step3">
        <span class="icon">🤖</span>
        <span class="label">AI Expert Consulting</span>
        <span class="status"></span>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results-section" id="results" style="display:none">
      <!-- Disease Card -->
      <div class="disease-card">
        <img id="resultImage" src="" alt="Plant">
        <div class="disease-info">
          <h2 id="diseaseName"></h2>
          <p class="confidence">Confidence: <span id="confidence"></span></p>
          <div id="topPredictions"></div>
        </div>
      </div>

      <!-- Chatbot Interface -->
      <div class="chatbot">
        <div class="messages" id="messages">
          <!-- Messages appear here -->
        </div>
        
        <!-- Suggested Questions -->
        <div class="suggested-questions" id="suggestedQuestions">
          <!-- Buttons appear here -->
        </div>

        <!-- Input -->
        <div class="input-area">
          <input type="text" id="userInput" placeholder="Ask a follow-up question...">
          <button onclick="sendMessage()">Send</button>
        </div>
      </div>
    </section>
  </div>

  <script>
    // JavaScript for:
    // - Image upload and preview
    // - Call ML API (localhost:5000)
    // - Update visual pipeline
    // - Call Ollama via Node.js proxy
    // - Stream chatbot responses
    // - Handle suggested questions
  </script>
</body>
</html>
```

### Demo Page Architecture
```
demo.html (Frontend)
    ↓
    ├─→ POST http://localhost:5000/predict (ML Model)
    │   Returns: {prediction, confidence, all_predictions}
    │
    └─→ POST http://localhost:4000/api/chat (Node.js Chatbot Service)
        ├─→ Calls Ollama (localhost:11434)
        └─→ Streams response back to demo page
```

### Implementation Approach
1. Create `demo.html` with inline CSS and JavaScript
2. Create `chatbot-server.js` (simple Express server for Ollama proxy)
3. Use existing ML API on port 5000
4. No database needed - everything in memory
5. Can run with: `node chatbot-server.js` + open `demo.html` in browser
