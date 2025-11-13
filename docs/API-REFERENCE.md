# API Reference

Complete API documentation for the Plant Disease AI Assistant backend services.

## Table of Contents

- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Backend API Endpoints](#backend-api-endpoints)
- [ML Service API Endpoints](#ml-service-api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Base URLs

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | `http://localhost:4000` | Main application backend |
| ML Service | `http://localhost:5000` | Machine learning inference service |
| Frontend | `http://localhost:3000` | React web application |

## Authentication

Currently, the API does not require authentication. User identification is optional and handled through the `userId` parameter.

**Future Enhancement**: JWT-based authentication will be added for user management.

## Backend API Endpoints

### Health Check

Check the health status of all services.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "ollama": "connected",
  "model": "minimax-m2:cloud",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes**:
- `200 OK`: All services healthy
- `503 Service Unavailable`: One or more services degraded

---

### Analyze Plant Image

Upload a plant image for disease detection and get AI-powered treatment advice.

**Endpoint**: `POST /api/analyze`

**Content-Type**: `multipart/form-data`

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | File | Yes | Plant image file (JPG, JPEG, PNG, WEBP) |
| `userId` | String | No | User identifier (ObjectId format) |

**Request Example**:
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('userId', '507f1f77bcf86cd799439011');

const response = await fetch('http://localhost:4000/api/analyze', {
  method: 'POST',
  body: formData
});
```

**Response**:
```json
{
  "success": true,
  "predictionId": "507f1f77bcf86cd799439011",
  "conversationId": "507f1f77bcf86cd799439012",
  "prediction": {
    "disease": "Tomato___Late_blight",
    "confidence": 0.9523,
    "topPredictions": [
      {
        "class": "Tomato___Late_blight",
        "confidence": 0.9523
      },
      {
        "class": "Tomato___Early_blight",
        "confidence": 0.0312
      },
      {
        "class": "Tomato___Septoria_leaf_spot",
        "confidence": 0.0089
      }
    ]
  },
  "diseaseContext": {
    "diseaseName": "Tomato Late Blight",
    "confidence": "95.23%",
    "cropType": "Tomato",
    "topPredictions": [...]
  },
  "suggestedQuestions": [
    "What are the symptoms?",
    "How do I treat this?",
    "How can I prevent it?"
  ]
}
```

**Status Codes**:
- `200 OK`: Analysis successful
- `400 Bad Request`: No image provided or invalid file
- `503 Service Unavailable`: ML service not available
- `500 Internal Server Error`: Server error

**File Constraints**:
- Maximum file size: 10MB
- Allowed formats: JPG, JPEG, PNG, WEBP
- Recommended: Clear, well-lit images of affected plant parts

---

### Stream Chat Response

Get streaming AI advice about the detected disease. Uses Server-Sent Events (SSE) for real-time streaming.

**Endpoint**: `GET /api/chat/stream/:conversationId`

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversationId` | String | Yes | Conversation ID from analyze response |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | String | No | Follow-up question from user |

**Request Example**:
```javascript
// Initial advice (no question)
const response = await fetch(
  `http://localhost:4000/api/chat/stream/${conversationId}`,
  { responseType: 'stream' }
);

// Follow-up question
const response = await fetch(
  `http://localhost:4000/api/chat/stream/${conversationId}?question=${encodeURIComponent('How do I treat this?')}`,
  { responseType: 'stream' }
);
```

**Response Format** (Server-Sent Events):
```
data: {"chunk": "Here's what you need to know about "}\n\n
data: {"chunk": "Tomato Late Blight:\n\n"}\n\n
data: {"chunk": "**Symptoms:**\n"}\n\n
data: {"chunk": "- Dark, water-soaked spots on leaves\n"}\n\n
...
data: {"done": true}\n\n
```

**JavaScript Client Example**:
```javascript
const response = await fetch(url);
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.chunk) {
        // Append chunk to display
        console.log(data.chunk);
      }
      if (data.done) {
        // Streaming complete
        break;
      }
    }
  }
}
```

**Status Codes**:
- `200 OK`: Streaming started
- `404 Not Found`: Conversation not found
- `500 Internal Server Error`: Ollama service unavailable

---

### Get Prediction History

Retrieve a user's prediction history.

**Endpoint**: `GET /api/predictions/:userId`

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | String | Yes | User identifier (ObjectId or 'test-user' for testing) |

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | Number | No | 20 | Maximum number of predictions to return |

**Request Example**:
```javascript
const response = await fetch(
  'http://localhost:4000/api/predictions/507f1f77bcf86cd799439011?limit=10'
);
```

**Response**:
```json
{
  "success": true,
  "count": 10,
  "predictions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439010",
      "disease": "Tomato___Late_blight",
      "confidence": 0.9523,
      "topPredictions": [...],
      "cropType": "Tomato",
      "imagePath": "uploads/1234567890.jpg",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

**Status Codes**:
- `200 OK`: History retrieved successfully
- `500 Internal Server Error`: Database error

---

### Get Active Conversations

Retrieve a user's active conversations.

**Endpoint**: `GET /api/conversations/:userId`

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | String | Yes | User identifier (ObjectId) |

**Response**:
```json
{
  "success": true,
  "count": 5,
  "conversations": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439010",
      "predictionId": "507f1f77bcf86cd799439011",
      "diseaseContext": {
        "diseaseName": "Tomato Late Blight",
        "confidence": "95.23%",
        "cropType": "Tomato"
      },
      "messages": [
        {
          "role": "system",
          "content": "Disease context...",
          "timestamp": "2024-01-15T10:30:00.000Z"
        },
        {
          "role": "assistant",
          "content": "Here's what you need to know...",
          "timestamp": "2024-01-15T10:30:05.000Z"
        }
      ],
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

**Status Codes**:
- `200 OK`: Conversations retrieved successfully
- `500 Internal Server Error`: Database error

---

### Create or Get User

Create a new user or retrieve an existing user by email.

**Endpoint**: `POST /api/users`

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "email": "farmer@example.com",
  "name": "John Farmer",
  "phone": "+1234567890",
  "location": "California, USA"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439010",
    "email": "farmer@example.com",
    "name": "John Farmer",
    "phone": "+1234567890",
    "location": "California, USA",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "lastActive": "2024-01-15T10:30:00.000Z"
  },
  "isNew": true
}
```

**Status Codes**:
- `200 OK`: User created or retrieved
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Database error

---

## ML Service API Endpoints

### Health Check

Check if the ML service is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy"
}
```

**Status Codes**:
- `200 OK`: Service is healthy

---

### Predict Disease

Classify plant disease from an uploaded image.

**Endpoint**: `POST /predict`

**Content-Type**: `multipart/form-data`

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Plant image file |

**Request Example**:
```python
import requests

with open('plant_image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5000/predict', files=files)
```

**Response**:
```json
{
  "prediction": "Tomato___Late_blight",
  "confidence": 0.9523,
  "all_predictions": [
    {
      "class": "Tomato___Late_blight",
      "confidence": 0.9523
    },
    {
      "class": "Tomato___Early_blight",
      "confidence": 0.0312
    },
    {
      "class": "Tomato___Septoria_leaf_spot",
      "confidence": 0.0089
    },
    {
      "class": "Tomato___Bacterial_spot",
      "confidence": 0.0045
    },
    {
      "class": "Tomato___healthy",
      "confidence": 0.0031
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Prediction successful
- `400 Bad Request`: No file provided or invalid file
- `500 Internal Server Error`: Model inference error

**Performance**:
- Average response time: 50-100ms
- Supports batch processing (future enhancement)

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `NO_FILE` | No file provided in upload |
| `INVALID_FILE` | Invalid file type or size |
| `ML_SERVICE_UNAVAILABLE` | ML service is not responding |
| `OLLAMA_UNAVAILABLE` | Ollama service is not responding |
| `DATABASE_ERROR` | MongoDB connection or query error |
| `CONVERSATION_NOT_FOUND` | Conversation ID does not exist |
| `INVALID_USER_ID` | User ID format is invalid |

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `400` | Bad Request - Invalid input |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error |
| `503` | Service Unavailable - Dependency service down |

---

## Rate Limiting

**Current Status**: No rate limiting implemented

**Future Enhancement**: Rate limiting will be added with the following limits:
- `/api/analyze`: 10 requests per minute per IP
- `/api/chat/stream`: 20 requests per minute per IP
- Other endpoints: 60 requests per minute per IP

---

## CORS Configuration

The backend API allows cross-origin requests from:
- `http://localhost:3000` (React frontend)
- Production domain (configured via `FRONTEND_URL` environment variable)

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers**: Content-Type, Authorization

---

## WebSocket Support

**Current Status**: Not implemented

**Future Enhancement**: WebSocket support for real-time updates:
- Live prediction status updates
- Real-time chat without SSE
- Multi-user collaboration features

---

## API Versioning

**Current Version**: v1 (implicit)

**Future Enhancement**: Explicit versioning will be added:
- `/api/v1/analyze`
- `/api/v2/analyze`

---

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:4000/api/health

# Analyze image
curl -X POST -F "image=@plant.jpg" http://localhost:4000/api/analyze

# Get prediction history
curl http://localhost:4000/api/predictions/test-user

# Stream chat (note: SSE not fully supported in curl)
curl -N http://localhost:4000/api/chat/stream/507f1f77bcf86cd799439012
```

### Using Postman

1. Import the API collection (coming soon)
2. Set base URL to `http://localhost:4000`
3. Test each endpoint with sample data

### Using Test Scripts

```bash
# Backend integration test
node test-backend-complete.js

# Chatbot integration test
node test-chatbot-integration.js

# Interactive chat test
node test-interactive-chat.js
```

---

## API Best Practices

### For Clients

1. **Always check health endpoint** before making requests
2. **Handle timeouts** - Set 30-second timeout for `/api/analyze`
3. **Validate files** client-side before uploading
4. **Handle SSE properly** - Use appropriate libraries for streaming
5. **Retry failed requests** with exponential backoff
6. **Cache responses** where appropriate (e.g., prediction history)

### For Developers

1. **Use environment variables** for configuration
2. **Log all errors** with timestamps and context
3. **Validate input** on both client and server
4. **Clean up resources** (files, connections) properly
5. **Monitor performance** and set up alerts
6. **Document changes** to API in this file

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Basic CRUD operations
- ML integration
- Ollama streaming chat
- MongoDB persistence

### Future Versions
- v1.1.0: Rate limiting and authentication
- v1.2.0: WebSocket support
- v2.0.0: API versioning and breaking changes

---

## Support

For API issues or questions:
1. Check the [Troubleshooting Guide](../README.md#troubleshooting)
2. Review [Backend Documentation](../backend/README.md)
3. Run test scripts to isolate issues
4. Check service health endpoints

---

**Last Updated**: January 2024
**API Version**: 1.0.0
