# System Architecture

Complete architecture documentation for the Plant Disease AI Assistant.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Deployment Architecture](#deployment-architecture)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)

## Overview

The Plant Disease AI Assistant is a full-stack MERN application integrated with Python-based ML services and a local LLM for conversational AI. The system follows a microservices-inspired architecture where each component has a specific responsibility.

### Key Design Principles

1. **Separation of Concerns**: ML, business logic, and UI are separate
2. **Loose Coupling**: Services communicate via HTTP APIs
3. **Fail-Safe**: Graceful degradation when services are unavailable
4. **Stateless**: Backend is stateless for easy scaling
5. **Real-time**: Streaming responses for better UX

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Layer                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  React Frontend (Port 3000)                   │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Components                                            │  │  │
│  │  │  • ImageUpload - File handling & validation           │  │  │
│  │  │  • VisualPipeline - Progress tracking                 │  │  │
│  │  │  • Results - Disease display & chat interface         │  │  │
│  │  │  • ErrorBoundary - Error handling                     │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  State Management                                      │  │  │
│  │  │  • React Hooks (useState, useEffect)                  │  │  │
│  │  │  • Local component state                              │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    │ (axios/fetch)
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        Application Layer                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Node.js Backend (Port 4000)                     │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  API Routes                                            │  │  │
│  │  │  • POST /api/analyze - Image analysis                 │  │  │
│  │  │  • GET  /api/chat/stream/:id - AI streaming          │  │  │
│  │  │  • GET  /api/predictions/:userId - History           │  │  │
│  │  │  • GET  /api/health - Health check                   │  │  │
│  │  │  • POST /api/users - User management                 │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Middleware                                            │  │  │
│  │  │  • CORS - Cross-origin handling                       │  │  │
│  │  │  • Multer - File upload processing                    │  │  │
│  │  │  • Express.json - JSON parsing                        │  │  │
│  │  │  • Error Handler - Global error handling             │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Business Logic                                        │  │  │
│  │  │  • File validation & cleanup                          │  │  │
│  │  │  • Request orchestration                              │  │  │
│  │  │  • Response formatting                                │  │  │
│  │  │  • Conversation management                            │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │ HTTP                         │ HTTP
                    │ (axios)                      │ (fetch)
                    ↓                              ↓
┌──────────────────────────────┐    ┌──────────────────────────────┐
│      ML Service Layer        │    │     LLM Service Layer        │
│  ┌────────────────────────┐  │    │  ┌────────────────────────┐  │
│  │  Python FastAPI        │  │    │  │  Ollama Service        │  │
│  │  (Port 5000)           │  │    │  │  (Port 11434)          │  │
│  │                        │  │    │  │                        │  │
│  │  • POST /predict       │  │    │  │  • POST /api/generate  │  │
│  │  • GET  /health        │  │    │  │  • GET  /api/tags      │  │
│  │                        │  │    │  │                        │  │
│  │  ┌──────────────────┐  │  │    │  │  ┌──────────────────┐  │  │
│  │  │ EfficientNetB3   │  │  │    │  │  │ minimax-m2:cloud │  │  │
│  │  │ Model            │  │  │    │  │  │ LLM Model        │  │  │
│  │  │ (.pth file)      │  │  │    │  │  │                  │  │  │
│  │  └──────────────────┘  │  │    │  │  └──────────────────┘  │  │
│  └────────────────────────┘  │    │  └────────────────────────┘  │
└──────────────────────────────┘    └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          Data Layer                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Database                          │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Collections                                           │  │  │
│  │  │  • users - User accounts                              │  │  │
│  │  │  • predictions - Disease detection results            │  │  │
│  │  │  • conversations - Chat history & context             │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Indexes                                               │  │  │
│  │  │  • userId + timestamp (predictions)                   │  │  │
│  │  │  • email (users, unique)                              │  │  │
│  │  │  • predictionId (conversations)                       │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        File Storage Layer                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Local File System                         │  │
│  │  • uploads/ - Temporary image storage                       │  │
│  │  • efficientnet_plant_disease.pth - ML model weights        │  │
│  │  • class_names.json - Disease class mappings                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (React)

```
frontend-react/
├── src/
│   ├── App.js                    # Main application container
│   ├── App.css                   # Global styles
│   │
│   ├── components/
│   │   ├── ImageUpload.js        # File upload & validation
│   │   ├── ImageUpload.css
│   │   │   • Drag & drop support
│   │   │   • Client-side validation
│   │   │   • Preview generation
│   │   │   • Error handling
│   │   │
│   │   ├── VisualPipeline.js     # Progress indicator
│   │   ├── VisualPipeline.css
│   │   │   • Step status tracking
│   │   │   • Animated transitions
│   │   │   • Real-time updates
│   │   │
│   │   ├── Results.js            # Disease display & chat
│   │   ├── Results.css
│   │   │   • Disease information card
│   │   │   • Confidence visualization
│   │   │   • Interactive chatbot
│   │   │   • SSE streaming support
│   │   │
│   │   ├── ErrorBoundary.js      # Error handling
│   │   ├── ErrorBoundary.css
│   │   │   • Catch React errors
│   │   │   • Fallback UI
│   │   │
│   │   ├── SkeletonLoader.js     # Loading states
│   │   └── SkeletonLoader.css
│   │       • Animated placeholders
│   │       • Multiple variants
│   │
│   └── index.js                  # React entry point
│
└── public/
    ├── index.html                # HTML template
    └── manifest.json             # PWA manifest
```

### Backend (Node.js/Express)

```
backend/
├── server.js                     # Main server file
│   ├── Express app setup
│   ├── Middleware configuration
│   ├── API route handlers
│   ├── Error handling
│   └── Server startup
│
├── config/
│   └── database.js               # MongoDB connection
│       ├── Connection pooling
│       ├── Retry logic
│       └── Event handlers
│
└── models/
    ├── User.js                   # User schema
    │   ├── Fields: email, name, phone, location
    │   ├── Indexes: email (unique)
    │   └── Methods: findOrCreate
    │
    ├── Prediction.js             # Prediction schema
    │   ├── Fields: userId, disease, confidence, etc.
    │   ├── Indexes: userId+timestamp, disease
    │   └── Methods: getUserHistory, getDiseaseStats
    │
    └── Conversation.js           # Conversation schema
        ├── Fields: userId, predictionId, messages
        ├── Indexes: userId, predictionId
        └── Methods: addMessage, getRecentMessages
```

### ML Service (Python/FastAPI)

```
api_service.py
├── FastAPI app setup
├── Model loading
│   ├── EfficientNetB3 architecture
│   ├── Load pretrained weights
│   └── Set to evaluation mode
│
├── Image preprocessing
│   ├── Resize to 224x224
│   ├── Normalize with ImageNet stats
│   └── Convert to tensor
│
├── Prediction endpoint
│   ├── Receive image file
│   ├── Preprocess image
│   ├── Run inference
│   ├── Get top predictions
│   └── Return JSON response
│
└── Health check endpoint
```

## Data Flow

### Image Analysis Flow

```
1. User uploads image
   ↓
2. Frontend validates file
   • Check file type (jpg, jpeg, png, webp)
   • Check file size (max 10MB)
   • Generate preview
   ↓
3. Frontend sends to backend
   • POST /api/analyze
   • FormData with image file
   • Optional userId
   ↓
4. Backend receives request
   • Multer saves file temporarily
   • Validates file
   ↓
5. Backend forwards to ML service
   • POST /predict
   • FormData with file
   • 30-second timeout
   ↓
6. ML service processes
   • Load image
   • Preprocess (resize, normalize)
   • Run model inference
   • Get top 5 predictions
   ↓
7. ML service returns results
   • Disease name
   • Confidence score
   • Top predictions array
   ↓
8. Backend processes ML response
   • Parse disease name
   • Extract crop type
   • Format confidence
   ↓
9. Backend saves to MongoDB
   • Create Prediction document
   • Create Conversation document
   • Link prediction to conversation
   ↓
10. Backend prepares context
    • Format disease information
    • Generate suggested questions
    • Create system message for LLM
    ↓
11. Backend returns to frontend
    • Prediction results
    • Conversation ID
    • Suggested questions
    ↓
12. Backend cleans up
    • Delete temporary file
    • Log cleanup status
    ↓
13. Frontend displays results
    • Show disease card
    • Display confidence
    • Render chat interface
    ↓
14. Frontend requests AI advice
    • GET /api/chat/stream/:conversationId
    • SSE streaming
```

### Chat Streaming Flow

```
1. User asks question (or initial advice)
   ↓
2. Frontend sends request
   • GET /api/chat/stream/:conversationId
   • Optional query param: question
   • Accept: text/event-stream
   ↓
3. Backend retrieves conversation
   • Find by conversationId
   • Get disease context
   • Get message history
   ↓
4. Backend prepares prompt
   • System message with disease context
   • Previous messages (last 10)
   • User question (if provided)
   ↓
5. Backend calls Ollama
   • POST /api/generate
   • Stream: true
   • Model: minimax-m2:cloud
   ↓
6. Ollama generates response
   • Processes prompt
   • Generates tokens
   • Streams chunks
   ↓
7. Backend streams to frontend
   • SSE format: data: {"chunk": "..."}\n\n
   • Real-time token streaming
   ↓
8. Frontend receives chunks
   • Parse SSE data
   • Append to message
   • Update UI in real-time
   ↓
9. Ollama completes response
   • Sends done signal
   ↓
10. Backend saves to database
    • Add user message (if question)
    • Add assistant message
    • Update conversation
    ↓
11. Backend sends completion
    • data: {"done": true}\n\n
    ↓
12. Frontend marks complete
    • Stop streaming animation
    • Enable input
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **HTTP Client**: Axios
- **Styling**: CSS3 with animations
- **Build Tool**: Create React App
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer
- **HTTP Client**: Axios
- **Environment**: dotenv

### ML Service
- **Language**: Python 3.8+
- **Framework**: FastAPI
- **ML Library**: PyTorch
- **Model**: EfficientNetB3
- **Image Processing**: Pillow
- **Server**: Uvicorn (ASGI)

### LLM Service
- **Platform**: Ollama
- **Model**: minimax-m2:cloud
- **API**: REST with streaming

### Database
- **Database**: MongoDB 4.4+
- **ODM**: Mongoose
- **Hosting**: Local or MongoDB Atlas

### Development Tools
- **Process Manager**: Concurrently
- **Testing**: Jest, Supertest
- **Version Control**: Git

## Deployment Architecture

### Development Environment

```
Developer Machine
├── MongoDB (localhost:27017)
├── Ollama (localhost:11434)
├── ML Service (localhost:5000)
├── Backend (localhost:4000)
└── Frontend Dev Server (localhost:3000)
```

### Production Environment (Single Server)

```
Production Server
├── Nginx (Port 80/443)
│   ├── Reverse proxy to backend
│   ├── Serve static frontend
│   └── SSL termination
│
├── PM2 Process Manager
│   ├── ML Service (Port 5000)
│   │   └── Python process
│   │
│   └── Backend (Port 4000)
│       └── Node.js cluster (2-4 instances)
│
├── MongoDB (Port 27017)
│   └── Local or Atlas connection
│
└── Ollama (Port 11434)
    └── System service
```

### Production Environment (Distributed)

```
Load Balancer
    ↓
┌─────────────────────────────────────┐
│         Application Servers         │
│  ┌──────────────┐  ┌──────────────┐ │
│  │   Server 1   │  │   Server 2   │ │
│  │  Backend     │  │  Backend     │ │
│  │  ML Service  │  │  ML Service  │ │
│  │  Ollama      │  │  Ollama      │ │
│  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
              ↓
    ┌──────────────────┐
    │  MongoDB Atlas   │
    │  (Cloud)         │
    └──────────────────┘
```

## Security Architecture

### Current Security Measures

1. **Input Validation**
   - File type validation (whitelist)
   - File size limits (10MB)
   - MongoDB ObjectId validation

2. **CORS Configuration**
   - Whitelist specific origins
   - Credentials support
   - Proper headers

3. **File Handling**
   - Temporary storage
   - Automatic cleanup
   - Unique filenames

4. **Error Handling**
   - No sensitive data in errors
   - Proper status codes
   - Logging without PII

### Future Security Enhancements

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Session management

2. **Rate Limiting**
   - Per-IP rate limits
   - Per-user rate limits
   - DDoS protection

3. **Data Encryption**
   - HTTPS/TLS in production
   - Encrypted database connections
   - Encrypted file storage

4. **Input Sanitization**
   - SQL injection prevention (N/A with MongoDB)
   - XSS prevention
   - Path traversal prevention

5. **Monitoring & Auditing**
   - Access logs
   - Error tracking
   - Security event monitoring

## Scalability Considerations

### Current Limitations

- Single-server deployment
- No load balancing
- No caching layer
- Synchronous ML inference

### Horizontal Scaling Strategy

1. **Backend Scaling**
   - Stateless design enables easy scaling
   - Use PM2 cluster mode or Kubernetes
   - Load balancer distributes requests

2. **ML Service Scaling**
   - Deploy multiple ML service instances
   - Load balancer with health checks
   - Consider GPU instances for performance

3. **Database Scaling**
   - MongoDB replica sets for HA
   - Sharding for large datasets
   - Read replicas for queries

4. **Caching Strategy**
   - Redis for session storage
   - CDN for static assets
   - Cache prediction results (optional)

### Vertical Scaling Strategy

1. **Increase Resources**
   - More CPU cores for Node.js cluster
   - More RAM for model loading
   - GPU for ML inference

2. **Optimize Code**
   - Connection pooling
   - Async operations
   - Efficient queries

### Performance Optimization

1. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Service worker caching

2. **Backend**
   - Connection pooling
   - Request batching
   - Response compression
   - Database indexing

3. **ML Service**
   - Model quantization
   - Batch inference
   - GPU acceleration
   - Model caching

4. **Database**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Aggregation pipelines

## Monitoring & Observability

### Metrics to Track

1. **Application Metrics**
   - Request rate
   - Response time
   - Error rate
   - Active connections

2. **ML Metrics**
   - Inference time
   - Model accuracy
   - Prediction distribution
   - GPU utilization

3. **Database Metrics**
   - Query time
   - Connection pool usage
   - Document count
   - Index usage

4. **System Metrics**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network I/O

### Logging Strategy

1. **Application Logs**
   - Request/response logs
   - Error logs with stack traces
   - Performance logs

2. **Access Logs**
   - User actions
   - API calls
   - File uploads

3. **Security Logs**
   - Failed authentication
   - Suspicious activity
   - Rate limit violations

### Health Checks

1. **Service Health**
   - `/api/health` endpoint
   - Check all dependencies
   - Return detailed status

2. **Automated Monitoring**
   - Ping health endpoints
   - Alert on failures
   - Auto-restart services

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - Off-site storage

2. **Model Backups**
   - Version control for models
   - S3 or similar storage
   - Rollback capability

3. **Configuration Backups**
   - Environment variables
   - Service configurations
   - Infrastructure as code

### Recovery Procedures

1. **Service Failure**
   - Auto-restart with PM2
   - Failover to backup instance
   - Alert administrators

2. **Data Loss**
   - Restore from backup
   - Verify data integrity
   - Resume operations

3. **Complete System Failure**
   - Restore from infrastructure code
   - Deploy from backups
   - Verify all services

---

**Last Updated**: January 2024
**Architecture Version**: 1.0.0
