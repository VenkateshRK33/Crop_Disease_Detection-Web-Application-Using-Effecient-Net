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
const MarketPrice = require('./models/MarketPrice');
const HarvestCalculation = require('./models/HarvestCalculation');
const CropEvent = require('./models/CropEvent');

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

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

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

// Health Check Endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };
  
  res.status(200).json(health);
});

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
  
  return `You are an experienced agricultural expert helping a farmer treat plant diseases. Provide direct answers without repeating information already given.

Disease Detected: ${diseaseName}
Confidence: ${confidence}%
Crop: ${cropType}
Other possibilities: ${topPredictions.slice(1, 3).map(p => p.class).join(', ')}

Provide helpful advice with these sections:
1. **What is this disease?** (2-3 sentences explaining the disease)
2. **How to treat it** (3-4 specific treatment steps - include both organic and chemical options)
3. **How to prevent it** (3-4 prevention methods for future)
4. **Timeline** (When to act and how often to check)

Keep your response under 300 words. Use simple language a farmer can understand. Be specific and actionable. Start your response directly with the information.`;
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

// Fallback knowledge base for when Ollama is unavailable
const FALLBACK_KNOWLEDGE = {
  'Tomato_Late_blight': {
    description: 'Late blight is a devastating fungal disease that affects tomatoes and potatoes.',
    treatments: ['Remove infected plants immediately', 'Apply copper-based fungicides every 7-10 days', 'Improve air circulation'],
    prevention: ['Plant resistant varieties', 'Space plants 2-3 feet apart', 'Water at soil level', 'Rotate crops'],
    timeline: 'Act immediately. Disease can spread to entire field in 7-14 days.'
  },
  'Tomato_healthy': {
    description: 'Your tomato plant appears healthy!',
    treatments: ['No treatment needed', 'Continue regular watering', 'Maintain fertilization schedule'],
    prevention: ['Water consistently - 1-2 inches per week', 'Fertilize every 2-3 weeks', 'Inspect plants weekly'],
    timeline: 'Keep up the good work! Check plants weekly.'
  }
};

function getFallbackAdvice(diseaseName) {
  const knowledge = FALLBACK_KNOWLEDGE[diseaseName] || {
    description: 'Unable to identify specific disease information.',
    treatments: ['Consult with a local agricultural expert', 'Take clear photos of affected plants', 'Monitor plant health daily'],
    prevention: ['Maintain good plant hygiene', 'Ensure proper spacing', 'Water appropriately'],
    timeline: 'Seek expert advice as soon as possible.'
  };
  
  return `**What is this disease?**
${knowledge.description}

**How to treat it:**
${knowledge.treatments.map((t, i) => `${i + 1}. ${t}`).join('\n')}

**How to prevent it:**
${knowledge.prevention.map((p, i) => `${i + 1}. ${p}`).join('\n')}

**Timeline:**
${knowledge.timeline}

*Note: This is basic information. For best results, consult with a local agricultural extension office.*`;
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
      
      // Check if it's a validation error (400) from ML service
      if (mlError.response && mlError.response.status === 400) {
        const errorDetail = mlError.response.data?.detail || 'Invalid image. Please upload a clear photo of a plant leaf.';
        return res.status(400).json({ 
          error: 'Validation error',
          message: errorDetail,
          timestamp: new Date().toISOString()
        });
      }
      
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

  let fullResponse = '';
  let responseSent = false;

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
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

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

Provide a clear, helpful answer in simple language. Be specific and actionable. Do not repeat the question in your response - answer directly.`;
    } else {
      // Initial advice
      prompt = buildPrompt(conversation.diseaseContext);
    }

    // Check Ollama availability
    const ollamaHealthy = await ollamaClient.checkHealth();
    console.log(`[${new Date().toISOString()}] Ollama health: ${ollamaHealthy ? 'healthy' : 'unhealthy'}`);

    if (ollamaHealthy) {
      try {
        console.log(`[${new Date().toISOString()}] Streaming from Ollama...`);
        for await (const chunk of ollamaClient.streamGenerate(prompt)) {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          responseSent = true;
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        console.log(`[${new Date().toISOString()}] Ollama streaming complete`);
      } catch (streamError) {
        console.error(`[${new Date().toISOString()}] Ollama streaming error:`, streamError.message);
        
        // Send fallback if we haven't sent anything yet
        if (!responseSent) {
          const fallback = getFallbackAdvice(conversation.diseaseContext.diseaseName);
          fullResponse = fallback;
          
          // Stream fallback word by word
          const words = fallback.split(' ');
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            res.write(`data: ${JSON.stringify({ chunk: word })}\n\n`);
            responseSent = true;
            await new Promise(resolve => setTimeout(resolve, 30));
          }
        }
        res.write(`data: ${JSON.stringify({ done: true, fallback: true })}\n\n`);
      }
    } else {
      // Use fallback knowledge when Ollama is not available
      console.log(`[${new Date().toISOString()}] Using fallback knowledge (Ollama unavailable)`);
      const fallback = getFallbackAdvice(conversation.diseaseContext.diseaseName);
      fullResponse = fallback;
      
      // Stream fallback word by word for better UX
      const words = fallback.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        res.write(`data: ${JSON.stringify({ chunk: word })}\n\n`);
        responseSent = true;
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      res.write(`data: ${JSON.stringify({ done: true, fallback: true })}\n\n`);
    }

    // Save assistant response
    if (fullResponse) {
      await conversation.addMessage('assistant', fullResponse);
    }

    res.end();

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Chat error:`, error);
    
    // Always try to send something to the client
    if (!responseSent) {
      const errorMessage = 'I apologize, but I encountered an error. Please try asking your question again.';
      res.write(`data: ${JSON.stringify({ chunk: errorMessage })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true, error: true })}\n\n`);
    res.end();
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

// ============================================
// MARKET PRICE ROUTES
// ============================================

// Helper function to fetch real-time market prices from external API
async function fetchRealTimeMarketPrices(crop) {
  try {
    // Try to fetch from data.gov.in API (Indian agricultural market data)
    // Note: This is a placeholder - you'll need to register for an API key
    const API_KEY = process.env.DATA_GOV_IN_API_KEY;
    
    if (API_KEY) {
      const response = await axios.get(
        `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`,
        {
          params: {
            'api-key': API_KEY,
            format: 'json',
            filters: { commodity: crop },
            limit: 20
          },
          timeout: 10000
        }
      );
      
      if (response.data && response.data.records) {
        return response.data.records.map(record => ({
          market: record.market,
          location: {
            city: record.district,
            state: record.state,
            coordinates: { lat: 0, lon: 0 }
          },
          price: parseFloat(record.modal_price) || parseFloat(record.max_price),
          unit: 'quintal',
          distance: Math.round(Math.random() * 50 + 10),
          lastUpdated: record.arrival_date || new Date().toISOString()
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching real-time market data:', error.message);
  }
  
  return null;
}

// Get market prices for a specific crop
app.get('/api/market-prices/:crop', async (req, res) => {
  try {
    const { crop } = req.params;
    
    // Try to fetch real-time data first
    const realTimeData = await fetchRealTimeMarketPrices(crop);
    
    if (realTimeData && realTimeData.length > 0) {
      // Save to database for historical tracking
      try {
        for (const priceData of realTimeData) {
          await MarketPrice.create({
            crop: crop,
            market: priceData.market,
            location: priceData.location,
            price: priceData.price,
            unit: priceData.unit,
            date: new Date(priceData.lastUpdated)
          });
        }
      } catch (dbError) {
        console.error('Error saving market prices to database:', dbError.message);
      }
      
      return res.json({
        success: true,
        crop,
        markets: realTimeData,
        source: 'real-time-api',
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Fallback to database
    const latestPrices = await MarketPrice.getLatestPrices(crop, 20);
    
    // Group by market and get the most recent price for each
    const marketMap = new Map();
    latestPrices.forEach(price => {
      if (!marketMap.has(price.market)) {
        marketMap.set(price.market, price);
      }
    });
    
    const uniqueMarkets = Array.from(marketMap.values());
    
    // If no data exists, generate realistic mock data with current timestamp
    if (uniqueMarkets.length === 0) {
      const mockData = generateMockMarketData(crop);
      
      // Save mock data to database for consistency
      try {
        for (const priceData of mockData) {
          await MarketPrice.create({
            crop: crop,
            market: priceData.market,
            location: priceData.location,
            price: priceData.price,
            unit: priceData.unit,
            date: new Date()
          });
        }
      } catch (dbError) {
        console.error('Error saving mock prices to database:', dbError.message);
      }
      
      res.json({
        success: true,
        crop,
        markets: mockData,
        source: 'simulated',
        lastUpdated: new Date().toISOString()
      });
      return;
    }
    
    res.json({
      success: true,
      crop,
      markets: uniqueMarkets,
      source: 'database',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market prices',
      message: error.message
    });
  }
});

// Get price history/trend for a crop
app.get('/api/market-prices/:crop/history', async (req, res) => {
  try {
    const { crop } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    const priceTrend = await MarketPrice.getPriceTrend(crop, days);
    
    // If no data exists, generate and save realistic trend data
    if (priceTrend.length === 0) {
      const mockTrend = generateMockTrendData(crop, days);
      
      // Save trend data to database for future queries
      try {
        const basePrices = {
          wheat: 2500, rice: 3000, tomato: 1500, potato: 1200,
          onion: 1800, cotton: 6000, sugarcane: 3500, maize: 2000,
          soybean: 4500, chickpea: 5000, mustard: 5500, groundnut: 5800
        };
        const basePrice = basePrices[crop.toLowerCase()] || 2000;
        
        for (const trendPoint of mockTrend) {
          await MarketPrice.create({
            crop: crop,
            market: 'Average Market',
            location: { city: 'Multiple', state: 'India', coordinates: { lat: 0, lon: 0 } },
            price: trendPoint.avgPrice,
            unit: 'quintal',
            date: new Date(trendPoint.date)
          });
        }
      } catch (dbError) {
        console.error('Error saving trend data to database:', dbError.message);
      }
      
      res.json({
        success: true,
        crop,
        trend: mockTrend,
        source: 'simulated',
        lastUpdated: new Date().toISOString()
      });
      return;
    }
    
    res.json({
      success: true,
      crop,
      trend: priceTrend,
      source: 'database',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price history',
      message: error.message
    });
  }
});

// Helper function to generate mock market data for development
function generateMockMarketData(crop) {
  const markets = [
    { name: 'Delhi Azadpur Mandi', city: 'Delhi', state: 'Delhi', distance: 15 },
    { name: 'Ghazipur Mandi', city: 'Ghazipur', state: 'Uttar Pradesh', distance: 25 },
    { name: 'Narela Mandi', city: 'Delhi', state: 'Delhi', distance: 30 },
    { name: 'Faridabad Mandi', city: 'Faridabad', state: 'Haryana', distance: 35 },
    { name: 'Gurgaon Mandi', city: 'Gurgaon', state: 'Haryana', distance: 40 },
    { name: 'Rohtak Mandi', city: 'Rohtak', state: 'Haryana', distance: 45 },
    { name: 'Meerut Mandi', city: 'Meerut', state: 'Uttar Pradesh', distance: 50 }
  ];
  
  // Base prices for different crops (₹/quintal) - Updated to current market rates
  const basePrices = {
    wheat: 2500,
    rice: 3000,
    tomato: 1500,
    potato: 1200,
    onion: 1800,
    cotton: 6000,
    sugarcane: 3500,
    maize: 2000,
    soybean: 4500,
    chickpea: 5000,
    mustard: 5500,
    groundnut: 5800
  };
  
  const basePrice = basePrices[crop.toLowerCase()] || 2000;
  const currentTime = Date.now();
  
  return markets.map((market, index) => {
    // Add realistic price variation (±10%)
    const priceVariation = (Math.random() * 0.2 - 0.1) * basePrice;
    const finalPrice = Math.round(basePrice + priceVariation);
    
    // Vary update times (within last 6 hours)
    const hoursAgo = Math.random() * 6;
    const lastUpdated = new Date(currentTime - hoursAgo * 3600000);
    
    return {
      market: market.name,
      location: {
        city: market.city,
        state: market.state,
        coordinates: { lat: 28.7041, lon: 77.1025 }
      },
      price: finalPrice,
      unit: 'quintal',
      distance: market.distance,
      lastUpdated: lastUpdated.toISOString()
    };
  });
}

// Helper function to generate mock trend data for development
function generateMockTrendData(crop, days) {
  const basePrices = {
    wheat: 2500,
    rice: 3000,
    tomato: 1500,
    potato: 1200,
    onion: 1800,
    cotton: 6000,
    sugarcane: 3500,
    maize: 2000,
    soybean: 4500,
    chickpea: 5000,
    mustard: 5500,
    groundnut: 5800
  };
  
  const basePrice = basePrices[crop.toLowerCase()] || 2000;
  const trend = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some realistic variation
    const variation = Math.sin(i / 5) * 100 + (Math.random() * 100 - 50);
    const price = Math.round(basePrice + variation);
    
    trend.push({
      date: date.toISOString().split('T')[0],
      avgPrice: price,
      minPrice: Math.round(price * 0.95),
      maxPrice: Math.round(price * 1.05)
    });
  }
  
  return trend;
}

// ============================================
// TRANSLATION ROUTES
// ============================================

// Translation helper function (simplified - in production use proper translation API)
function translateText(text, targetLang) {
  // This is a placeholder - in production, integrate with Google Translate API or similar
  // For now, return original text with language indicator
  return text; // TODO: Implement actual translation
}

// Translate disease name
app.post('/api/translate/disease', async (req, res) => {
  try {
    const { diseaseName, targetLanguage } = req.body;
    
    // Simple disease name translations
    const translations = {
      'hi': {
        'healthy': 'स्वस्थ',
        'leaf': 'पत्ती',
        'spot': 'धब्बा',
        'blight': 'झुलसा',
        'rust': 'रतुआ',
        'mold': 'फफूंदी',
        'bacterial': 'जीवाणु',
        'viral': 'विषाणु',
        'fungal': 'कवक'
      },
      'kn': {
        'healthy': 'ಆರೋಗ್ಯಕರ',
        'leaf': 'ಎಲೆ',
        'spot': 'ಚುಕ್ಕೆ',
        'blight': 'ರೋಗ',
        'rust': 'ತುಕ್ಕು',
        'mold': 'ಅಚ್ಚು',
        'bacterial': 'ಬ್ಯಾಕ್ಟೀರಿಯಾ',
        'viral': 'ವೈರಲ್',
        'fungal': 'ಶಿಲೀಂಧ್ರ'
      }
    };
    
    if (targetLanguage === 'en') {
      return res.json({ success: true, translatedText: diseaseName });
    }
    
    let translatedName = diseaseName;
    const langTranslations = translations[targetLanguage];
    
    if (langTranslations) {
      Object.keys(langTranslations).forEach(key => {
        const regex = new RegExp(key, 'gi');
        translatedName = translatedName.replace(regex, langTranslations[key]);
      });
    }
    
    res.json({
      success: true,
      translatedText: translatedName,
      originalText: diseaseName
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation failed',
      message: error.message
    });
  }
});

// ============================================
// MARKETPLACE - CROP BUYING ROUTES
// ============================================

// Get crops available for purchase
app.get('/api/marketplace/crops-for-sale', async (req, res) => {
  try {
    // Generate mock data for crops available for purchase
    const cropsForSale = [
      {
        id: 1,
        name: 'Hybrid Wheat Seeds (HD-2967)',
        description: 'High-yield disease-resistant wheat seeds suitable for all soil types',
        category: 'seeds',
        price: 45,
        originalPrice: 60,
        discount: 25,
        quantity: 50,
        unit: 'kg',
        location: 'Delhi, India',
        sellerName: 'Agri Seeds Co.',
        sellerContact: '+91-9876543210',
        rating: 4.8,
        image: '/images/wheat-seeds.jpg'
      },
      {
        id: 2,
        name: 'Organic NPK Fertilizer',
        description: 'Complete nutrient solution for healthy crop growth',
        category: 'fertilizers',
        price: 850,
        originalPrice: 1000,
        discount: 15,
        quantity: 100,
        unit: 'kg',
        location: 'Punjab, India',
        sellerName: 'Green Earth Fertilizers',
        sellerContact: '+91-9876543211',
        rating: 4.6,
        image: '/images/fertilizer.jpg'
      },
      {
        id: 3,
        name: 'Bio-Pesticide (Neem Based)',
        description: 'Eco-friendly pest control solution for all crops',
        category: 'pesticides',
        price: 320,
        originalPrice: 400,
        discount: 20,
        quantity: 20,
        unit: 'liter',
        location: 'Maharashtra, India',
        sellerName: 'BioProtect Solutions',
        sellerContact: '+91-9876543212',
        rating: 4.7,
        image: '/images/pesticide.jpg'
      },
      {
        id: 4,
        name: 'Hybrid Tomato Seeds (Pusa Ruby)',
        description: 'High-yielding tomato variety with excellent taste',
        category: 'seeds',
        price: 180,
        originalPrice: 220,
        discount: 18,
        quantity: 10,
        unit: 'kg',
        location: 'Haryana, India',
        sellerName: 'Premium Seeds Ltd.',
        sellerContact: '+91-9876543213',
        rating: 4.9,
        image: '/images/tomato-seeds.jpg'
      },
      {
        id: 5,
        name: 'Drip Irrigation Kit',
        description: 'Complete drip irrigation system for 1 acre',
        category: 'equipment',
        price: 15000,
        originalPrice: 18000,
        discount: 17,
        quantity: 5,
        unit: 'set',
        location: 'Gujarat, India',
        sellerName: 'Irrigation Tech',
        sellerContact: '+91-9876543214',
        rating: 4.5,
        image: '/images/irrigation.jpg'
      },
      {
        id: 6,
        name: 'Vermicompost Organic Manure',
        description: 'Premium quality vermicompost for soil enrichment',
        category: 'fertilizers',
        price: 12,
        originalPrice: 15,
        discount: 20,
        quantity: 500,
        unit: 'kg',
        location: 'Uttar Pradesh, India',
        sellerName: 'Organic Farms',
        sellerContact: '+91-9876543215',
        rating: 4.8,
        image: '/images/vermicompost.jpg'
      },
      {
        id: 7,
        name: 'Paddy Rice Seeds (Basmati)',
        description: 'Premium basmati rice seeds with high aroma',
        category: 'seeds',
        price: 95,
        originalPrice: 120,
        discount: 21,
        quantity: 100,
        unit: 'kg',
        location: 'Punjab, India',
        sellerName: 'Basmati Growers',
        sellerContact: '+91-9876543216',
        rating: 4.9,
        image: '/images/rice-seeds.jpg'
      },
      {
        id: 8,
        name: 'Solar Water Pump',
        description: '1 HP solar-powered water pump for irrigation',
        category: 'equipment',
        price: 25000,
        originalPrice: 30000,
        discount: 17,
        quantity: 3,
        unit: 'unit',
        location: 'Rajasthan, India',
        sellerName: 'Solar Agri Tech',
        sellerContact: '+91-9876543217',
        rating: 4.6,
        image: '/images/solar-pump.jpg'
      }
    ];

    res.json({
      success: true,
      crops: cropsForSale,
      total: cropsForSale.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching crops for sale:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crops for sale',
      message: error.message
    });
  }
});

// ============================================
// ENVIRONMENTAL MONITORING ROUTES
// ============================================

// Cache for weather data (30 minutes)
const weatherCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Helper function to check cache
function getCachedData(key) {
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Helper function to set cache
function setCachedData(key, data) {
  weatherCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Helper function to fetch Open-Meteo Air Quality data
async function fetchOpenMeteoAirQuality(lat, lon) {
  try {
    const response = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&current=pm10,pm2_5`,
      { timeout: 10000 }
    );
    
    const current = response.data.current || {};
    
    // Calculate AQI from PM2.5 (simplified US EPA formula)
    const pm25 = current.pm2_5 || 0;
    let aqi = 0;
    if (pm25 <= 12) aqi = (50 / 12) * pm25;
    else if (pm25 <= 35.4) aqi = 50 + ((100 - 50) / (35.4 - 12)) * (pm25 - 12);
    else if (pm25 <= 55.4) aqi = 100 + ((150 - 100) / (55.4 - 35.4)) * (pm25 - 35.4);
    else if (pm25 <= 150.4) aqi = 150 + ((200 - 150) / (150.4 - 55.4)) * (pm25 - 55.4);
    else if (pm25 <= 250.4) aqi = 200 + ((300 - 200) / (250.4 - 150.4)) * (pm25 - 150.4);
    else aqi = 300 + ((500 - 300) / (500 - 250.4)) * (pm25 - 250.4);
    
    return {
      aqi: Math.round(aqi),
      pm25: current.pm2_5,
      pm10: current.pm10,
      hourly: response.data.hourly
    };
  } catch (error) {
    console.error('Open-Meteo Air Quality API error:', error.message);
    return null;
  }
}

// Helper function to fetch soil data from Agromonitoring
async function fetchSoilData(lat, lon) {
  try {
    const AGRO_API_KEY = process.env.AGRO_API_KEY;
    if (!AGRO_API_KEY) return null;
    
    const response = await axios.get(
      `http://api.agromonitoring.com/agro/1.0/soil?lat=${lat}&lon=${lon}&appid=${AGRO_API_KEY}`,
      { timeout: 10000 }
    );
    
    return {
      temperature: response.data.t10 || response.data.t0,
      moisture: response.data.moisture,
      timestamp: response.data.dt
    };
  } catch (error) {
    console.error('Agromonitoring Soil API error:', error.message);
    return null;
  }
}

// Get current environmental data (Enhanced with multiple APIs)
app.get('/api/environment/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const cacheKey = `current_${lat}_${lon}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Fetch data from multiple sources in parallel
    const [weatherData, airQualityData, soilData] = await Promise.allSettled([
      // Open-Meteo Weather API (free, no key required)
      axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`,
        { timeout: 10000 }
      ),
      // Open-Meteo Air Quality API
      fetchOpenMeteoAirQuality(lat, lon),
      // Agromonitoring Soil API
      fetchSoilData(lat, lon)
    ]);

    // Process weather data
    let currentWeather = null;
    let locationName = 'Unknown Location';
    
    if (weatherData.status === 'fulfilled') {
      const data = weatherData.value.data;
      const current = data.current || {};
      
      // Map weather code to condition
      const weatherCode = current.weather_code || 0;
      let condition = 'Clear';
      if (weatherCode >= 61 && weatherCode <= 67) condition = 'Rain';
      else if (weatherCode >= 71 && weatherCode <= 77) condition = 'Snow';
      else if (weatherCode >= 80 && weatherCode <= 82) condition = 'Rain';
      else if (weatherCode >= 51 && weatherCode <= 57) condition = 'Drizzle';
      else if (weatherCode >= 1 && weatherCode <= 3) condition = 'Clouds';
      else if (weatherCode >= 45 && weatherCode <= 48) condition = 'Fog';
      else if (weatherCode >= 95) condition = 'Thunderstorm';
      
      currentWeather = {
        weather: condition,
        temperature: Math.round(current.temperature_2m || 25),
        humidity: Math.round(current.relative_humidity_2m || 60),
        windSpeed: Math.round(current.wind_speed_10m || 5)
      };
    }

    // Process air quality data
    let aqi = null;
    if (airQualityData.status === 'fulfilled' && airQualityData.value) {
      aqi = airQualityData.value.aqi;
    }

    // Process soil data
    let soil = null;
    if (soilData.status === 'fulfilled' && soilData.value) {
      soil = {
        temperature: soilData.value.temperature,
        moisture: soilData.value.moisture
      };
    }

    // Fallback to mock data if all APIs failed
    if (!currentWeather) {
      const mockData = generateMockEnvironmentalData(lat, lon);
      setCachedData(cacheKey, mockData);
      return res.json(mockData);
    }

    // Get location name using reverse geocoding
    try {
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { timeout: 5000 }
      );
      locationName = geoResponse.data.address?.city || 
                     geoResponse.data.address?.town || 
                     geoResponse.data.address?.village || 
                     'Location';
    } catch (geoError) {
      console.error('Geocoding error:', geoError.message);
    }

    // Generate trends from historical data
    const trends = await generateHistoricalTrends(lat, lon);

    // Transform data to frontend format
    const responseData = {
      success: true,
      location: {
        name: locationName,
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      current: {
        ...currentWeather,
        aqi: aqi,
        soil: soil
      },
      trends: trends,
      source: 'open-meteo'
    };

    setCachedData(cacheKey, responseData);
    res.json(responseData);

  } catch (error) {
    console.error('Error fetching environmental data:', error);
    
    // Fallback to mock data on error
    const mockData = generateMockEnvironmentalData(req.query.lat, req.query.lon);
    res.json(mockData);
  }
});

// Get weather forecast (Enhanced with Open-Meteo)
app.get('/api/environment/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const cacheKey = `forecast_${lat}_${lon}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    try {
      // Fetch 7-day forecast from Open-Meteo (free, no key required)
      const forecastResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_mean&timezone=auto&forecast_days=7`,
        { timeout: 10000 }
      );

      const daily = forecastResponse.data.daily || {};
      const dailyForecasts = [];

      for (let i = 0; i < 7 && i < (daily.time || []).length; i++) {
        const weatherCode = daily.weather_code[i] || 0;
        let condition = 'Clear';
        if (weatherCode >= 61 && weatherCode <= 67) condition = 'Rain';
        else if (weatherCode >= 71 && weatherCode <= 77) condition = 'Snow';
        else if (weatherCode >= 80 && weatherCode <= 82) condition = 'Rain';
        else if (weatherCode >= 51 && weatherCode <= 57) condition = 'Drizzle';
        else if (weatherCode >= 1 && weatherCode <= 3) condition = 'Clouds';
        else if (weatherCode >= 45 && weatherCode <= 48) condition = 'Fog';
        else if (weatherCode >= 95) condition = 'Thunderstorm';

        dailyForecasts.push({
          date: daily.time[i],
          temp: Math.round(daily.temperature_2m_max[i] || 25),
          tempMin: Math.round(daily.temperature_2m_min[i] || 15),
          weather: condition,
          humidity: Math.round(daily.relative_humidity_2m_mean[i] || 60)
        });
      }

      const responseData = {
        success: true,
        forecast: dailyForecasts,
        source: 'open-meteo'
      };

      setCachedData(cacheKey, responseData);
      res.json(responseData);

    } catch (apiError) {
      console.error('Forecast API error:', apiError.message);
      
      // Fallback to mock data
      const mockForecast = generateMockForecast();
      setCachedData(cacheKey, mockForecast);
      res.json(mockForecast);
    }

  } catch (error) {
    console.error('Error fetching forecast:', error);
    
    // Fallback to mock data
    const mockForecast = generateMockForecast();
    res.json(mockForecast);
  }
});

// Get seasonal forecast (Open-Meteo Seasonal API)
app.get('/api/environment/seasonal', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const cacheKey = `seasonal_${lat}_${lon}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    try {
      // Fetch seasonal forecast from Open-Meteo
      const seasonalResponse = await axios.get(
        `https://seasonal-api.open-meteo.com/v1/seasonal?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=90`,
        { timeout: 15000 }
      );

      const daily = seasonalResponse.data.daily || {};
      const seasonalData = [];

      // Group by weeks (7-day intervals)
      for (let i = 0; i < Math.min(12, Math.floor((daily.time || []).length / 7)); i++) {
        const weekIndex = i * 7;
        const weekData = {
          week: i + 1,
          startDate: daily.time[weekIndex],
          avgTempMax: 0,
          avgTempMin: 0,
          totalPrecipitation: 0
        };

        for (let j = 0; j < 7 && (weekIndex + j) < daily.time.length; j++) {
          weekData.avgTempMax += daily.temperature_2m_max[weekIndex + j] || 0;
          weekData.avgTempMin += daily.temperature_2m_min[weekIndex + j] || 0;
          weekData.totalPrecipitation += daily.precipitation_sum[weekIndex + j] || 0;
        }

        weekData.avgTempMax = Math.round(weekData.avgTempMax / 7);
        weekData.avgTempMin = Math.round(weekData.avgTempMin / 7);
        weekData.totalPrecipitation = Math.round(weekData.totalPrecipitation * 10) / 10;

        seasonalData.push(weekData);
      }

      const responseData = {
        success: true,
        seasonal: seasonalData,
        source: 'open-meteo-seasonal'
      };

      setCachedData(cacheKey, responseData);
      res.json(responseData);

    } catch (apiError) {
      console.error('Seasonal API error:', apiError.message);
      res.status(503).json({
        success: false,
        error: 'Seasonal forecast unavailable',
        message: apiError.message
      });
    }

  } catch (error) {
    console.error('Error fetching seasonal data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seasonal data',
      message: error.message
    });
  }
});

// Helper function to generate historical trends from Open-Meteo
async function generateHistoricalTrends(lat, lon) {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await axios.get(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,relative_humidity_2m_mean&timezone=auto`,
      { timeout: 10000 }
    );

    const daily = response.data.daily || {};
    const trends = {
      temperature: [],
      humidity: []
    };

    for (let i = 0; i < (daily.time || []).length; i++) {
      trends.temperature.push({
        date: daily.time[i],
        value: Math.round(daily.temperature_2m_max[i] || 25)
      });
      
      trends.humidity.push({
        date: daily.time[i],
        value: Math.round(daily.relative_humidity_2m_mean[i] || 60)
      });
    }

    return trends;
  } catch (error) {
    console.error('Historical trends error:', error.message);
    return generateMockTrends();
  }
}

// Helper function to generate mock environmental data
function generateMockEnvironmentalData(lat, lon) {
  const weatherConditions = ['Clear', 'Clouds', 'Rain', 'Sunny'];
  const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  
  return {
    success: true,
    location: {
      name: 'Sample Location',
      lat: parseFloat(lat),
      lon: parseFloat(lon)
    },
    current: {
      weather: randomWeather,
      temperature: Math.round(20 + Math.random() * 15),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 10),
      aqi: Math.round(30 + Math.random() * 70),
      soil: {
        temperature: Math.round(18 + Math.random() * 10),
        moisture: Math.round(30 + Math.random() * 40)
      }
    },
    trends: generateMockTrends(),
    source: 'mock'
  };
}

// Helper function to generate mock trends
function generateMockTrends() {
  const trends = {
    temperature: [],
    humidity: []
  };
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    trends.temperature.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(20 + Math.random() * 15)
    });
    
    trends.humidity.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(40 + Math.random() * 40)
    });
  }
  
  return trends;
}

// Helper function to generate mock forecast
function generateMockForecast() {
  const weatherConditions = ['Clear', 'Clouds', 'Rain', 'Sunny'];
  const forecast = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      temp: Math.round(20 + Math.random() * 15),
      tempMin: Math.round(15 + Math.random() * 10),
      weather: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
      humidity: Math.round(40 + Math.random() * 40)
    });
  }
  
  return {
    success: true,
    forecast,
    source: 'mock'
  };
}

// ============================================
// HARVEST CALCULATOR ROUTES
// ============================================

// Calculate optimal harvest time
app.post('/api/harvest/calculate', async (req, res) => {
  try {
    const {
      userId,
      cropType,
      currentMaturity,
      pestInfestation,
      currentMarketPrice,
      expectedYield,
      growthRate = 2.0,
      pestDamageRate = 1.5
    } = req.body;

    // Validate inputs
    if (!cropType || currentMaturity === undefined || pestInfestation === undefined || 
        !currentMarketPrice || !expectedYield) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide all required inputs: cropType, currentMaturity, pestInfestation, currentMarketPrice, expectedYield'
      });
    }

    // Validate ranges
    if (currentMaturity < 0 || currentMaturity > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid maturity value',
        message: 'Current maturity must be between 0 and 100'
      });
    }

    if (pestInfestation < 0 || pestInfestation > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pest infestation value',
        message: 'Pest infestation must be between 0 and 100'
      });
    }

    // Calculate scenarios for 0-30 days
    const scenarios = [];
    let optimalScenario = null;
    let maxProfit = -Infinity;

    for (let days = 0; days <= 30; days++) {
      // Calculate maturity (capped at 100%)
      const maturity = Math.min(100, currentMaturity + (growthRate * days));
      
      // Calculate pest damage (capped at 100%)
      const pestDamage = Math.min(100, pestInfestation + (pestDamageRate * days));
      
      // Calculate effective yield
      const maturityFactor = maturity / 100;
      const damageFactor = (100 - pestDamage) / 100;
      const effectiveYield = expectedYield * maturityFactor * damageFactor;
      
      // Calculate revenue
      const revenue = effectiveYield * currentMarketPrice;
      
      // Calculate costs (storage, labor, etc.)
      // Simple model: ₹100 per day + 2% of expected revenue per day
      const dailyCosts = 100 + (expectedYield * currentMarketPrice * 0.02);
      const totalCosts = dailyCosts * days;
      
      // Calculate profit
      const profit = revenue - totalCosts;
      
      // Calculate date
      const date = new Date();
      date.setDate(date.getDate() + days);
      
      const scenario = {
        days,
        date: date.toISOString(),
        maturity: Math.round(maturity * 10) / 10,
        pestDamage: Math.round(pestDamage * 10) / 10,
        effectiveYield: Math.round(effectiveYield * 10) / 10,
        profit: Math.round(profit)
      };
      
      scenarios.push(scenario);
      
      // Track optimal scenario
      if (profit > maxProfit) {
        maxProfit = profit;
        optimalScenario = scenario;
      }
    }

    // Calculate confidence score
    const confidence = calculateConfidence(
      optimalScenario.maturity,
      optimalScenario.pestDamage,
      optimalScenario.days
    );

    // Generate recommendation text
    const recommendation = generateRecommendation(
      optimalScenario,
      scenarios[0],
      currentMaturity,
      pestInfestation
    );

    // Prepare result
    const result = {
      optimalDate: optimalScenario.date,
      optimalDays: optimalScenario.days,
      expectedProfit: optimalScenario.profit,
      confidence,
      scenarios,
      recommendation,
      analysis: {
        currentValue: scenarios[0].profit,
        potentialGrowth: optimalScenario.profit - scenarios[0].profit,
        pestDamageRisk: optimalScenario.pestDamage,
        maturityLevel: optimalScenario.maturity
      }
    };

    // Save to database (with graceful degradation)
    try {
      if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
        await HarvestCalculation.create({
          userId,
          cropType,
          inputs: {
            currentMaturity,
            pestInfestation,
            currentMarketPrice,
            expectedYield,
            growthRate,
            pestDamageRate
          },
          result: {
            optimalDate: optimalScenario.date,
            optimalDays: optimalScenario.days,
            expectedProfit: optimalScenario.profit,
            confidence,
            scenarios
          }
        });
      }
    } catch (dbError) {
      console.error('Database save error:', dbError.message);
      // Continue without saving
    }

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Harvest calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate optimal harvest time',
      message: error.message
    });
  }
});

// Get user's harvest calculation history
app.get('/api/harvest/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const history = await HarvestCalculation.getUserHistory(userId, limit);

    res.json({
      success: true,
      count: history.length,
      history: history.map(calc => calc.toFrontend())
    });

  } catch (error) {
    console.error('Error fetching harvest history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch harvest history',
      message: error.message
    });
  }
});

// Helper function to calculate confidence score
function calculateConfidence(maturity, pestDamage, days) {
  let confidence = 100;
  
  // Reduce confidence if maturity is too low or too high
  if (maturity < 70) {
    confidence -= (70 - maturity) * 0.5;
  } else if (maturity > 95) {
    confidence -= (maturity - 95) * 2;
  }
  
  // Reduce confidence based on pest damage
  if (pestDamage > 30) {
    confidence -= (pestDamage - 30) * 0.8;
  }
  
  // Reduce confidence for very short or very long wait times
  if (days < 3) {
    confidence -= (3 - days) * 5;
  } else if (days > 21) {
    confidence -= (days - 21) * 2;
  }
  
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

// Helper function to generate recommendation text
function generateRecommendation(optimal, current, currentMaturity, pestInfestation) {
  const profitDiff = optimal.profit - current.profit;
  const days = optimal.days;
  
  if (days === 0) {
    return `Your crop is ready to harvest now. Current conditions suggest immediate harvest will maximize your profit at ₹${optimal.profit.toLocaleString()}.`;
  }
  
  if (days <= 7) {
    return `Wait ${days} day${days > 1 ? 's' : ''} for optimal harvest. Your crop will reach ${optimal.maturity}% maturity, increasing profit by ₹${profitDiff.toLocaleString()} to ₹${optimal.profit.toLocaleString()}. Monitor pest levels closely.`;
  }
  
  if (days <= 14) {
    return `Optimal harvest in ${days} days. Waiting allows crop to mature to ${optimal.maturity}%, increasing profit by ₹${profitDiff.toLocaleString()}. However, pest damage may reach ${optimal.pestDamage}%, so implement pest control measures now.`;
  }
  
  if (pestInfestation > 50) {
    return `High pest infestation detected. While waiting ${days} days could increase maturity to ${optimal.maturity}%, pest damage will reach ${optimal.pestDamage}%. Consider harvesting earlier or implementing aggressive pest control immediately.`;
  }
  
  return `Wait ${days} days for optimal harvest at ${optimal.maturity}% maturity. Expected profit: ₹${optimal.profit.toLocaleString()}. Implement pest control to minimize damage risk (projected ${optimal.pestDamage}%).`;
}

// ============================================
// CROP CALENDAR ROUTES
// ============================================

// Get all calendar events for a user
app.get('/api/calendar/events', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }
    
    const events = await CropEvent.find(query)
      .sort({ date: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch calendar events',
      message: error.message
    });
  }
});

// Get upcoming events
app.get('/api/calendar/events/upcoming', async (req, res) => {
  try {
    const { userId, days = 30 } = req.query;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));
    
    let query = {
      date: { $gte: startDate, $lte: endDate },
      completed: false
    };
    
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }
    
    const events = await CropEvent.find(query)
      .sort({ date: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming events',
      message: error.message
    });
  }
});

// Create a new calendar event
app.post('/api/calendar/events', async (req, res) => {
  try {
    const {
      userId,
      cropType,
      eventType,
      date,
      notes,
      reminder = true
    } = req.body;
    
    // Validate required fields
    if (!cropType || !eventType || !date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide cropType, eventType, and date'
      });
    }
    
    // Validate event type
    const validEventTypes = ['planting', 'irrigation', 'fertilizer', 'pesticide', 'harvest', 'other'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event type',
        message: `Event type must be one of: ${validEventTypes.join(', ')}`
      });
    }
    
    // Create event
    const eventData = {
      cropType,
      eventType,
      date: new Date(date),
      notes,
      reminder
    };
    
    // Add userId if valid
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      eventData.userId = userId;
    }
    
    const event = await CropEvent.create(eventData);
    
    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create calendar event',
      message: error.message
    });
  }
});

// Update a calendar event
app.put('/api/calendar/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID'
      });
    }
    
    const {
      cropType,
      eventType,
      date,
      notes,
      completed,
      reminder
    } = req.body;
    
    // Build update object
    const updateData = {};
    if (cropType !== undefined) updateData.cropType = cropType;
    if (eventType !== undefined) updateData.eventType = eventType;
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;
    if (completed !== undefined) updateData.completed = completed;
    if (reminder !== undefined) updateData.reminder = reminder;
    
    const event = await CropEvent.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update calendar event',
      message: error.message
    });
  }
});

// Delete a calendar event
app.delete('/api/calendar/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID'
      });
    }
    
    const event = await CropEvent.findByIdAndDelete(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully',
      event
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete calendar event',
      message: error.message
    });
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
