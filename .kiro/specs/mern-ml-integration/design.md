# Design Document

## Overview

This design outlines the integration architecture for connecting a Python FastAPI ML microservice with a MERN stack application without Docker. The solution uses a proxy pattern where the Node.js backend acts as an intermediary between the React frontend and Python ML service, providing a unified API surface while maintaining separation of concerns.

**Key Design Principles:**
- No Docker required - services run as separate processes on the same machine
- Node.js backend acts as API gateway and handles all business logic
- Python service focuses solely on ML inference
- Simple process management using npm scripts or PM2
- Proper error handling and graceful degradation

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Frontend (Port 3000)                   │  │
│  │  • Image upload component                                 │  │
│  │  • Results display                                        │  │
│  │  • Loading states & error handling                        │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP (axios/fetch)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Node.js Backend (Port 4000)                     │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Express Routes                                     │  │  │
│  │  │  • POST /api/predict                                │  │  │
│  │  │  • GET  /api/history                                │  │  │
│  │  │  • GET  /api/health                                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Middleware                                         │  │  │
│  │  │  • Multer (file upload)                             │  │  │
│  │  │  • CORS                                             │  │  │
│  │  │  • Error handling                                   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Services                                           │  │  │
│  │  │  • ML Service Client (axios)                        │  │  │
│  │  │  • File cleanup service                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP POST (FormData)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ML Service Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Python FastAPI Service (Port 5000)               │  │
│  │  • POST /predict - Disease classification                │  │
│  │  • GET  /health  - Service health check                  │  │
│  │  • EfficientNetB3 model inference                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                MongoDB Database                          │  │
│  │  • Users collection                                      │  │
│  │  • Predictions collection                                │  │
│  │  • Conversations collection                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Image Upload Flow:**
   - User selects image in React → FormData created
   - POST to `/api/analyze` → Multer saves file temporarily
   - Backend forwards to ML service → Prediction returned
   - Backend saves to MongoDB → Returns combined response
   - React displays results → Temporary file deleted

2. **Chat Flow:**
   - User asks question → GET to `/api/chat/stream/:conversationId`
   - Backend retrieves conversation context from MongoDB
   - Backend calls Ollama LLM → Streams response
   - Backend saves messages to MongoDB
   - React displays streaming response

## Components and Interfaces

### Frontend Components (React)

#### App.js
Main application container managing state and orchestration.

**State:**
```javascript
{
  pipelineSteps: Array<{id, label, status, icon, message}>,
  results: Object | null,
  showPipeline: boolean
}
```

**Methods:**
- `updatePipelineStep(stepId, status, message)` - Updates visual pipeline
- `handleAnalysisComplete(data)` - Receives analysis results

#### ImageUpload Component
Handles file selection and upload to backend.

**Props:**
- `onAnalysisStart()` - Callback when analysis begins
- `onAnalysisComplete(data)` - Callback with results
- `updatePipelineStep(id, status, msg)` - Pipeline updates

**State:**
```javascript
{
  selectedFile: File | null,
  preview: string | null,
  isAnalyzing: boolean
}
```

**API Calls:**
- `POST /api/analyze` with FormData containing image

#### Results Component
Displays disease prediction and interactive chatbot.

**Props:**
- `data: {prediction, conversationId, suggestedQuestions, imageUrl}`

**State:**
```javascript
{
  messages: Array<{id, role, content, isStreaming}>,
  userInput: string,
  isLoading: boolean
}
```

**API Calls:**
- `GET /api/chat/stream/:conversationId?question=...` (Server-Sent Events)

#### VisualPipeline Component
Shows progress through analysis stages.

**Props:**
- `steps: Array<{id, label, status, icon, message}>`

**Rendering:**
- Displays each step with icon and status indicator
- Shows active/complete/pending states

### Backend API Endpoints (Express)

#### POST /api/analyze
Uploads image, gets ML prediction, saves to database.

**Request:**
```javascript
FormData {
  image: File,
  userId?: string (optional)
}
```

**Response:**
```javascript
{
  success: true,
  predictionId: ObjectId,
  conversationId: ObjectId,
  prediction: {
    disease: string,
    confidence: number,
    topPredictions: Array<{class, confidence}>
  },
  diseaseContext: {
    diseaseName: string,
    confidence: string,
    cropType: string,
    topPredictions: Array
  },
  suggestedQuestions: Array<string>
}
```

**Error Handling:**
- 400: No image provided
- 500: ML service unavailable or database error

#### GET /api/chat/stream/:conversationId
Streams AI advice using Server-Sent Events.

**Query Parameters:**
- `question` (optional) - User's follow-up question

**Response:** Server-Sent Events stream
```
data: {"chunk": "text fragment"}\n\n
data: {"done": true}\n\n
```

**Error Handling:**
- 404: Conversation not found
- 500: Ollama unavailable

#### GET /api/predictions/:userId
Retrieves user's prediction history.

**Query Parameters:**
- `limit` (optional, default: 20)

**Response:**
```javascript
{
  success: true,
  count: number,
  predictions: Array<Prediction>
}
```

#### GET /api/health
Health check for all services.

**Response:**
```javascript
{
  status: 'ok',
  ollama: 'connected' | 'disconnected',
  database: 'connected' | 'disconnected',
  model: string
}
```

#### POST /api/users
Creates or retrieves user account.

**Request:**
```javascript
{
  email: string,
  name: string,
  phone?: string,
  location?: string
}
```

**Response:**
```javascript
{
  success: true,
  user: User
}
```

### ML Service API (FastAPI)

#### POST /predict
Classifies plant disease from image.

**Request:** multipart/form-data with `file` field

**Response:**
```javascript
{
  prediction: string,
  confidence: number,
  all_predictions: Array<{
    class: string,
    confidence: number
  }>
}
```

#### GET /health
Simple health check.

**Response:** `{"status": "healthy"}`

## Data Models

### User Model (MongoDB)
```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  name: String (required),
  phone: String,
  location: String,
  createdAt: Date,
  lastActive: Date
}
```

**Indexes:**
- email (unique)

### Prediction Model (MongoDB)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, optional),
  imagePath: String (required),
  disease: String (required),
  confidence: Number (required),
  topPredictions: [{
    class: String,
    confidence: Number
  }],
  cropType: String,
  imageMetadata: {
    size: Number,
    format: String,
    filename: String
  },
  createdAt: Date
}
```

**Indexes:**
- userId
- createdAt (descending)

**Methods:**
- `getUserHistory(userId, limit)` - Static method to fetch user predictions

### Conversation Model (MongoDB)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, optional),
  predictionId: ObjectId (ref: Prediction, required),
  diseaseContext: {
    diseaseName: String,
    confidence: String,
    cropType: String,
    topPredictions: Array
  },
  messages: [{
    role: 'user' | 'assistant' | 'system',
    content: String,
    timestamp: Date
  }],
  isActive: Boolean (default: true),
  feedback: String,
  createdAt: Date
}
```

**Indexes:**
- userId
- predictionId
- isActive

**Methods:**
- `addMessage(role, content)` - Instance method to add message
- `getRecentMessages(limit)` - Instance method to get recent messages
- `getActiveConversations(userId)` - Static method to fetch active conversations

## Error Handling

### Frontend Error Handling

**Network Errors:**
- Display user-friendly error message
- Provide retry button
- Log error to console

**Validation Errors:**
- Check file type before upload (jpg, jpeg, png, webp)
- Check file size (max 10MB)
- Display inline validation messages

**Timeout Handling:**
- 30-second timeout for prediction requests
- Display timeout message with retry option

**Low Confidence Warnings:**
- If confidence < 50%, show warning message
- Suggest retaking image with better lighting

### Backend Error Handling

**ML Service Unavailable:**
- Return 503 status code
- Log error with timestamp
- Return helpful error message

**Database Errors:**
- Still return prediction to user
- Log database error
- Continue operation gracefully

**File Upload Errors:**
- Validate file type and size
- Return 400 with specific error message
- Clean up any partial uploads

**Cleanup Failures:**
- Log error but don't fail request
- Implement periodic cleanup job

## Testing Strategy

### Frontend Testing

**Component Tests:**
- ImageUpload: File selection, preview, upload flow
- Results: Message display, streaming, suggested questions
- VisualPipeline: Status updates, visual states

**Integration Tests:**
- Full upload → prediction → chat flow
- Error handling scenarios
- Loading states

**Manual Testing:**
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Responsive design on mobile devices
- Image upload with various file types

### Backend Testing

**Unit Tests:**
- Route handlers with mocked dependencies
- Database model methods
- File upload validation
- Error handling logic

**Integration Tests:**
- Full API flow with test database
- ML service integration (with mock)
- File cleanup operations

**API Tests:**
- All endpoints with valid/invalid inputs
- CORS configuration
- Error responses

### ML Service Testing

**Model Tests:**
- Prediction accuracy on test dataset
- Response time benchmarks
- Error handling for invalid images

**API Tests:**
- /predict endpoint with various images
- /health endpoint availability
- Error responses

### End-to-End Testing

**Happy Path:**
1. Upload valid plant image
2. Receive prediction with high confidence
3. Get initial AI advice
4. Ask follow-up question
5. Receive streaming response

**Error Scenarios:**
1. ML service down → Graceful error
2. Database unavailable → Prediction still works
3. Invalid file type → Validation error
4. Network timeout → Retry option

## Deployment Considerations

### Development Environment

**Prerequisites:**
- Node.js 16+ installed
- Python 3.8+ installed
- MongoDB running locally or connection string
- Ollama installed with model downloaded

**Startup Sequence:**
1. Start MongoDB (if local)
2. Start ML service: `python api_service.py`
3. Start backend: `npm start`
4. Start React dev server: `cd frontend-react && npm start`

**Environment Variables (.env):**
```
PORT=4000
ML_API_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/plant-disease
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=minimax-m2:cloud
```

### Production Deployment

**Process Management:**
- Use PM2 for Node.js backend
- Use systemd or PM2 for Python ML service
- Configure auto-restart on failure

**File Storage:**
- Implement cleanup job for old uploads
- Consider cloud storage (S3) for production
- Set up proper file permissions

**Database:**
- Use MongoDB Atlas or managed MongoDB
- Configure connection pooling
- Set up backups

**Monitoring:**
- Health check endpoints for all services
- Log aggregation (Winston + CloudWatch)
- Error tracking (Sentry)

**Security:**
- HTTPS in production
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload handling

## Performance Optimization

### Frontend
- Lazy load Results component
- Optimize image preview size
- Debounce user input
- Cache API responses where appropriate

### Backend
- Connection pooling for MongoDB
- Reuse axios instances
- Implement request timeout
- Clean up temp files immediately

### ML Service
- Model loaded once at startup
- Batch prediction support (future)
- GPU acceleration if available
- Response caching for identical images (future)
