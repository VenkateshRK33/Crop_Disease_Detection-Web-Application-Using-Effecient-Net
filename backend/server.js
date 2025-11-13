/**
 * Main Backend Server with MongoDB Integration
 * Integrates ML Model + Chatbot + Database
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const mongoose = require('mongoose');
require('dotenv').config();

// Database connection
const connectDB = require('./config/database');

// Models
const User = require('./models/User');
const Prediction = require('./models/Prediction');
const Conversation = require('./models/Conversation');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Configuration
const CONFIG = {
  mlApiUrl: process.env.ML_API_URL || 'http://localhost:5000',
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'minimax-m2:cloud'
};

// Ollama Client (same as before)
class OllamaClient {
  constructor(baseUrl, model) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Ollama health check failed:', error.message);
      return false;
    }
  }

  async *streamGenerate(prompt) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 500,
          }
        },
        { timeout: 30000 } // 30 second timeout
      );

      const words = response.data.response.split(' ');
      for (let i = 0; i < words.length; i++) {
        yield words[i] + (i < words.length - 1 ? ' ' : '');
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Ollama generation error:', error.message);
      throw error;
    }
  }
}

const ollamaClient = new OllamaClient(CONFIG.ollamaUrl, CONFIG.ollamaModel);

// Helper Functions
function buildPrompt(diseaseContext) {
  const { diseaseName, confidence, cropType, topPredictions } = diseaseContext;
  
  return `You are an experienced agricultural expert helping a farmer treat plant diseases.

Disease Detected: ${diseaseName}
Confidence: ${confidence}%
Crop: ${cropType}
Other possibilities: ${topPredictions.slice(1, 3).map(p => p.class).join(', ')}

Provide helpful advice with these sections:
1. **What is this disease?** (2-3 sentences explaining the disease)
2. **How to treat it** (3-4 specific treatment steps - include both organic and chemical options)
3. **How to prevent it** (3-4 prevention methods for future)
4. **Timeline** (When to act and how often to check)

Keep your response under 300 words. Use simple language a farmer can understand. Be specific and actionable.`;
}

function getSuggestedQuestions(diseaseName) {
  if (diseaseName.includes('healthy')) {
    return [
      "How often should I water?",
      "When should I fertilize?",
      "How do I know when to harvest?",
      "What pests should I watch for?"
    ];
  }
  
  return [
    "How do I apply this treatment?",
    "What are organic alternatives?",
    "How can I prevent this in future?",
    "Is this disease contagious to other plants?"
  ];
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', async (req, res) => {
  const checks = {
    ollama: 'disconnected',
    database: 'disconnected',
    mlService: 'disconnected'
  };

  // Check Ollama
  try {
    const ollamaHealthy = await ollamaClient.checkHealth();
    checks.ollama = ollamaHealthy ? 'connected' : 'disconnected';
  } catch (error) {
    console.error('Ollama health check error:', error.message);
  }

  // Check Database
  checks.database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  // Check ML Service
  try {
    const mlResponse = await axios.get(`${CONFIG.mlApiUrl}/health`, { timeout: 5000 });
    checks.mlService = mlResponse.status === 200 ? 'connected' : 'disconnected';
  } catch (error) {
    console.error('ML service health check error:', error.message);
  }

  const allHealthy = Object.values(checks).every(status => status === 'connected');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    ...checks,
    model: CONFIG.ollamaModel,
    timestamp: new Date().toISOString()
  });
});

// Upload and analyze plant image
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get userId - must be valid ObjectId or null
    let userId = null;
    if (req.body.userId && mongoose.Types.ObjectId.isValid(req.body.userId)) {
      userId = req.body.userId;
    }

    // Step 1: Send image to ML API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    let mlResponse;
    try {
      mlResponse = await axios.post(`${CONFIG.mlApiUrl}/predict`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000 // 30 second timeout
      });
    } catch (mlError) {
      // Clean up file on ML service error
      try {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError.message);
      }

      // Log error with timestamp
      console.error(`[${new Date().toISOString()}] ML Service Error:`, mlError.message);
      
      // Check if it's a connection error
      if (mlError.code === 'ECONNREFUSED' || mlError.code === 'ENOTFOUND') {
        return res.status(503).json({ 
          error: 'ML service unavailable',
          message: 'The plant disease detection service is currently unavailable. Please try again in a few moments.',
          timestamp: new Date().toISOString()
        });
      }
      
      // Check if it's a timeout
      if (mlError.code === 'ECONNABORTED' || mlError.message.includes('timeout')) {
        return res.status(503).json({ 
          error: 'ML service timeout',
          message: 'The analysis is taking longer than expected. Please try again with a smaller image.',
          timestamp: new Date().toISOString()
        });
      }
      
      // Generic ML service error
      return res.status(503).json({ 
        error: 'ML service error',
        message: 'Unable to analyze the image at this time. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }

    const { prediction, confidence, all_predictions } = mlResponse.data;

    // Step 2: Save prediction to database (with graceful degradation)
    const cropType = prediction.split('_')[0] || 'Unknown';
    
    let predictionDoc = null;
    let conversationDoc = null;
    let dbError = false;

    try {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database not connected');
      }

      predictionDoc = await Prediction.create({
        userId: userId,
        imagePath: req.file.path,
        disease: prediction,
        confidence: confidence,
        topPredictions: all_predictions.map(p => ({
          class: p.class,
          confidence: p.confidence
        })),
        cropType: cropType,
        imageMetadata: {
          size: req.file.size,
          format: path.extname(req.file.originalname),
          filename: req.file.filename
        }
      });

      // Step 3: Create conversation
      const diseaseContext = {
        diseaseName: prediction,
        confidence: (confidence * 100).toFixed(1),
        cropType: cropType,
        topPredictions: all_predictions
      };

      conversationDoc = await Conversation.create({
        userId: userId,
        predictionId: predictionDoc._id,
        diseaseContext: diseaseContext,
        messages: []
      });
    } catch (dbSaveError) {
      // Log database error but continue with prediction
      console.error(`[${new Date().toISOString()}] Database Error:`, dbSaveError.message);
      dbError = true;
      
      // Create temporary conversation context for response
      if (!conversationDoc) {
        conversationDoc = {
          _id: 'temp-' + Date.now(),
          diseaseContext: {
            diseaseName: prediction,
            confidence: (confidence * 100).toFixed(1),
            cropType: cropType,
            topPredictions: all_predictions
          }
        };
      }
    }

    // Step 4: Get suggested questions
    const suggestedQuestions = getSuggestedQuestions(prediction);

    // Step 5: Clean up temporary file
    try {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log(`Cleaned up temporary file: ${req.file.path}`);
      }
    } catch (cleanupError) {
      // Log error but don't fail the request
      console.error('File cleanup error:', cleanupError.message);
    }

    res.json({
      success: true,
      predictionId: predictionDoc ? predictionDoc._id : null,
      conversationId: conversationDoc._id,
      prediction: {
        disease: prediction,
        confidence: confidence,
        topPredictions: all_predictions
      },
      diseaseContext: conversationDoc.diseaseContext,
      suggestedQuestions,
      warning: dbError ? 'Prediction successful but history not saved' : undefined
    });

  } catch (error) {
    console.error('Error in analyze:', error);
    
    // Clean up file on error too
    try {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log(`Cleaned up temporary file after error: ${req.file.path}`);
      }
    } catch (cleanupError) {
      console.error('File cleanup error:', cleanupError.message);
    }
    
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Get AI advice (streaming)
app.get('/api/chat/stream/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const { question } = req.query;

  try {
    // Get conversation from database
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let prompt;
    if (question) {
      // Save user question
      await conversation.addMessage('user', question);

      // Build prompt with conversation history
      const recentMessages = conversation.getRecentMessages(4);
      let conversationContext = '';
      if (recentMessages.length > 0) {
        conversationContext = '\n\nPrevious conversation:\n';
        recentMessages.forEach(msg => {
          conversationContext += `${msg.role === 'user' ? 'Farmer' : 'Expert'}: ${msg.content}\n`;
        });
      }

      const { diseaseName, confidence, cropType } = conversation.diseaseContext;
      prompt = `You are an agricultural expert helping a farmer with ${diseaseName} (${confidence}% confidence) on their ${cropType} plants.${conversationContext}

Farmer's question: ${question}

Provide a clear, helpful answer in simple language. Be specific and actionable.`;
    } else {
      // Initial advice
      prompt = buildPrompt(conversation.diseaseContext);
    }

    // Check Ollama availability
    const ollamaHealthy = await ollamaClient.checkHealth();
    let fullResponse = '';

    if (ollamaHealthy) {
      try {
        for await (const chunk of ollamaClient.streamGenerate(prompt)) {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      } catch (streamError) {
        console.error(`[${new Date().toISOString()}] Streaming error:`, streamError.message);
        
        // Check if it's a timeout
        if (streamError.code === 'ECONNABORTED' || streamError.message.includes('timeout')) {
          res.write(`data: ${JSON.stringify({ error: 'Request timed out. Please try asking a simpler question.' })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ error: 'Failed to generate response. Please try again.' })}\n\n`);
        }
      }
    } else {
      res.write(`data: ${JSON.stringify({ error: 'AI service unavailable. Please try again later.' })}\n\n`);
    }

    // Save assistant response
    if (fullResponse) {
      await conversation.addMessage('assistant', fullResponse);
    }

    res.end();

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

// Get user's prediction history
app.get('/api/predictions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    // If userId is not a valid ObjectId, return all predictions (for testing)
    let predictions;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      predictions = await Prediction.getUserHistory(userId, limit);
    } else {
      // For non-ObjectId userIds (like 'test-user'), return recent predictions
      predictions = await Prediction.find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('-__v');
    }

    res.json({
      success: true,
      count: predictions.length,
      predictions
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Get conversation history
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.getActiveConversations(userId);

    res.json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create or get user
app.post('/api/users', async (req, res) => {
  try {
    const { email, name, phone, location } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        email,
        name,
        phone,
        location
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error with user:', error);
    res.status(500).json({ error: 'Failed to process user' });
  }
});

// Start server only if not in test mode
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🌱 Plant Disease AI Backend Started');
    console.log('='.repeat(60));
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`ML API: ${CONFIG.mlApiUrl}`);
    console.log(`Ollama: ${CONFIG.ollamaUrl}`);
    console.log(`Model: ${CONFIG.ollamaModel}`);
    console.log('='.repeat(60));
  });
}

// Export app for testing
module.exports = app;
