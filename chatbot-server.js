/**
 * Chatbot Server - Connects ML Model with Local LLM (Ollama)
 * Provides streaming responses for farmer-friendly plant disease advice
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configuration
const CONFIG = {
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2:3b',
  mlApiUrl: process.env.ML_API_URL || 'http://localhost:5000',
  maxConversationHistory: 10,
  conversationTimeout: 30 * 60 * 1000, // 30 minutes
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve demo.html

// In-memory storage
const conversations = new Map();

// Fallback knowledge base
const FALLBACK_KNOWLEDGE = {
  'Tomato_Late_blight': {
    description: 'Late blight is a devastating fungal disease that affects tomatoes and potatoes. It spreads rapidly in cool, wet conditions and can destroy entire crops within days.',
    treatments: [
      'Remove and destroy all infected plants immediately to prevent spread',
      'Apply copper-based fungicides every 7-10 days',
      'Use organic options like Bacillus subtilis',
      'Improve air circulation by pruning lower leaves'
    ],
    prevention: [
      'Plant resistant varieties when available',
      'Space plants 2-3 feet apart for good airflow',
      'Water at soil level, avoid wetting leaves',
      'Remove plant debris at end of season',
      'Rotate crops - don\'t plant tomatoes in same spot for 3 years'
    ],
    timeline: 'Act immediately. Disease can spread to entire field in 7-14 days.'
  },
  'Tomato_Early_blight': {
    description: 'Early blight is a common fungal disease causing dark spots on older leaves. It weakens plants and reduces yield but is less aggressive than late blight.',
    treatments: [
      'Remove affected lower leaves',
      'Apply fungicides containing chlorothalonil or copper',
      'Use organic neem oil spray weekly',
      'Mulch around plants to prevent soil splash'
    ],
    prevention: [
      'Stake or cage plants to keep leaves off ground',
      'Water in morning so leaves dry quickly',
      'Apply mulch to prevent spores from splashing up',
      'Fertilize properly - stressed plants are more susceptible'
    ],
    timeline: 'Start treatment within 3-5 days. Monitor weekly.'
  },
  'Tomato_Bacterial_spot': {
    description: 'Bacterial spot causes small dark spots on leaves and fruit. It spreads through water and infected seeds, thriving in warm, humid conditions.',
    treatments: [
      'Remove severely infected plants',
      'Apply copper-based bactericides',
      'Avoid overhead watering',
      'Disinfect tools between plants'
    ],
    prevention: [
      'Use certified disease-free seeds',
      'Don\'t work with plants when wet',
      'Rotate crops for 2-3 years',
      'Space plants for good air flow'
    ],
    timeline: 'Begin treatment immediately. Check plants every 3-4 days.'
  },
  'Tomato_Septoria_leaf_spot': {
    description: 'Septoria leaf spot causes small circular spots with gray centers on leaves. It starts on lower leaves and moves upward, reducing plant vigor.',
    treatments: [
      'Remove infected lower leaves',
      'Apply fungicides with chlorothalonil',
      'Mulch to prevent soil splash',
      'Improve air circulation'
    ],
    prevention: [
      'Stake plants off the ground',
      'Water at base of plants',
      'Remove plant debris',
      'Rotate planting locations'
    ],
    timeline: 'Start treatment within a week. Monitor weekly.'
  },
  'Tomato_Leaf_Mold': {
    description: 'Leaf mold appears as yellow spots on top of leaves with fuzzy growth underneath. Common in greenhouses and humid conditions.',
    treatments: [
      'Increase ventilation',
      'Remove affected leaves',
      'Apply sulfur-based fungicides',
      'Reduce humidity below 85%'
    ],
    prevention: [
      'Ensure good air circulation',
      'Don\'t overcrowd plants',
      'Use drip irrigation',
      'Plant resistant varieties'
    ],
    timeline: 'Act within 5-7 days. Improve ventilation immediately.'
  },
  'Tomato__Target_Spot': {
    description: 'Target spot creates concentric ring patterns on leaves. It can affect leaves, stems, and fruit, reducing yield significantly.',
    treatments: [
      'Apply fungicides with azoxystrobin',
      'Remove infected plant parts',
      'Improve air circulation',
      'Avoid overhead irrigation'
    ],
    prevention: [
      'Use disease-free transplants',
      'Mulch around plants',
      'Rotate crops',
      'Space plants properly'
    ],
    timeline: 'Begin treatment within 3-5 days.'
  },
  'Tomato__Tomato_YellowLeaf__Curl_Virus': {
    description: 'Yellow Leaf Curl Virus is spread by whiteflies. It causes severe leaf curling, yellowing, and stunted growth. No cure exists.',
    treatments: [
      'Remove and destroy infected plants immediately',
      'Control whiteflies with insecticidal soap',
      'Use yellow sticky traps',
      'Apply neem oil to deter whiteflies'
    ],
    prevention: [
      'Plant resistant varieties (TYLCV-resistant)',
      'Use insect-proof netting',
      'Control whiteflies early',
      'Remove weeds that harbor whiteflies'
    ],
    timeline: 'Remove infected plants immediately to protect others.'
  },
  'Tomato__Tomato_mosaic_virus': {
    description: 'Mosaic virus causes mottled yellow and green patterns on leaves. Spreads through contact and infected tools.',
    treatments: [
      'No cure - remove infected plants',
      'Disinfect all tools with bleach solution',
      'Wash hands before handling plants',
      'Don\'t smoke near plants (tobacco can carry virus)'
    ],
    prevention: [
      'Use certified virus-free seeds',
      'Disinfect tools regularly',
      'Don\'t touch plants after handling tobacco',
      'Control aphids that spread virus'
    ],
    timeline: 'Remove infected plants immediately.'
  },
  'Tomato_Spider_mites_Two_spotted_spider_mite': {
    description: 'Spider mites are tiny pests that suck plant juices, causing yellow stippling and webbing. They thrive in hot, dry conditions.',
    treatments: [
      'Spray plants with strong water stream',
      'Apply insecticidal soap or neem oil',
      'Use predatory mites (biological control)',
      'Apply miticides if severe'
    ],
    prevention: [
      'Keep plants well-watered',
      'Increase humidity',
      'Remove dusty conditions',
      'Encourage beneficial insects'
    ],
    timeline: 'Act within 2-3 days. Mites multiply rapidly.'
  },
  'Tomato_healthy': {
    description: 'Your tomato plant appears healthy! Continue good care practices to keep it that way.',
    treatments: [
      'No treatment needed',
      'Continue regular watering',
      'Maintain fertilization schedule',
      'Monitor for any changes'
    ],
    prevention: [
      'Water consistently - 1-2 inches per week',
      'Fertilize every 2-3 weeks',
      'Prune suckers for better air flow',
      'Inspect plants weekly for early problem detection'
    ],
    timeline: 'Keep up the good work! Check plants weekly.'
  },
  'Potato___Early_blight': {
    description: 'Early blight causes dark concentric rings on potato leaves. It reduces yield and tuber quality.',
    treatments: [
      'Apply fungicides with chlorothalonil',
      'Remove infected leaves',
      'Hill soil around plants',
      'Ensure good drainage'
    ],
    prevention: [
      'Use certified disease-free seed potatoes',
      'Rotate crops for 3 years',
      'Space rows for air circulation',
      'Avoid overhead watering'
    ],
    timeline: 'Start treatment within 5-7 days.'
  },
  'Potato___Late_blight': {
    description: 'Late blight is the same disease that caused the Irish Potato Famine. It can destroy crops rapidly in cool, wet weather.',
    treatments: [
      'Apply copper or mancozeb fungicides immediately',
      'Remove and destroy infected plants',
      'Harvest early if disease is severe',
      'Don\'t save infected tubers'
    ],
    prevention: [
      'Plant resistant varieties',
      'Ensure excellent drainage',
      'Hill plants properly',
      'Monitor weather - disease spreads in cool, wet conditions'
    ],
    timeline: 'URGENT - Act immediately. Can destroy field in days.'
  },
  'Potato___healthy': {
    description: 'Your potato plants look healthy! Maintain good practices for a successful harvest.',
    treatments: [
      'No treatment needed',
      'Continue regular care',
      'Hill soil as plants grow',
      'Water consistently'
    ],
    prevention: [
      'Hill plants when 6-8 inches tall',
      'Water deeply once a week',
      'Watch for Colorado potato beetles',
      'Harvest when plants die back naturally'
    ],
    timeline: 'Continue monitoring. Harvest in 90-120 days from planting.'
  },
  'Pepper__bell___Bacterial_spot': {
    description: 'Bacterial spot causes dark spots on pepper leaves and fruit. It spreads through water and reduces fruit quality.',
    treatments: [
      'Apply copper-based bactericides',
      'Remove severely infected plants',
      'Avoid working with wet plants',
      'Improve air circulation'
    ],
    prevention: [
      'Use disease-free seeds and transplants',
      'Rotate crops for 2 years',
      'Mulch to prevent soil splash',
      'Water at base of plants'
    ],
    timeline: 'Begin treatment within 3-5 days.'
  },
  'Pepper__bell___healthy': {
    description: 'Your pepper plants are healthy! Keep up the good care for a bountiful harvest.',
    treatments: [
      'No treatment needed',
      'Continue regular watering',
      'Support plants as they grow',
      'Monitor for pests'
    ],
    prevention: [
      'Water consistently - peppers need even moisture',
      'Fertilize when flowers appear',
      'Stake tall varieties',
      'Harvest regularly to encourage more fruit'
    ],
    timeline: 'Peppers ready to harvest in 60-90 days from transplanting.'
  },
  'PlantVillage': {
    description: 'This appears to be a general plant image. Please upload a clearer image of a specific plant showing any disease symptoms.',
    treatments: [
      'Upload a clearer image',
      'Focus on leaves showing symptoms',
      'Ensure good lighting',
      'Take photo from multiple angles'
    ],
    prevention: [
      'Regular plant inspection',
      'Good cultural practices',
      'Proper spacing and watering',
      'Crop rotation'
    ],
    timeline: 'Take a new photo for accurate diagnosis.'
  }
};

// Ollama Client
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
      // Get full response first (some models don't stream well)
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
        {
          timeout: 60000
        }
      );

      // Stream the response word by word for better UX
      const fullText = response.data.response;
      const words = fullText.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        yield words[i] + (i < words.length - 1 ? ' ' : '');
        // Small delay for streaming effect
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
  
  return `You are an experienced agricultural expert helping a farmer treat plant diseases. Provide clear, practical advice in simple language.

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
  const questions = [
    "How do I apply this treatment?",
    "What are organic alternatives?",
    "How can I prevent this in future?",
    "Is this disease contagious to other plants?"
  ];
  
  if (diseaseName.includes('healthy')) {
    return [
      "How often should I water?",
      "When should I fertilize?",
      "How do I know when to harvest?",
      "What pests should I watch for?"
    ];
  }
  
  return questions;
}

function getFallbackAdvice(diseaseName) {
  const knowledge = FALLBACK_KNOWLEDGE[diseaseName] || FALLBACK_KNOWLEDGE['PlantVillage'];
  
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

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  const ollamaHealthy = await ollamaClient.checkHealth();
  res.json({
    status: 'ok',
    ollama: ollamaHealthy ? 'connected' : 'disconnected',
    model: CONFIG.ollamaModel
  });
});

// Analyze plant image
app.post('/api/analyze-plant', async (req, res) => {
  try {
    const { prediction, confidence, all_predictions } = req.body;
    
    if (!prediction) {
      return res.status(400).json({ error: 'Missing prediction data' });
    }

    // Extract crop type from disease name
    const cropType = prediction.split('_')[0] || 'Unknown';
    
    // Create disease context
    const diseaseContext = {
      diseaseName: prediction,
      confidence: (confidence * 100).toFixed(1),
      cropType: cropType,
      topPredictions: all_predictions || []
    };

    // Create conversation
    const conversationId = Date.now().toString();
    conversations.set(conversationId, {
      diseaseContext,
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date()
    });

    // Get suggested questions
    const suggestedQuestions = getSuggestedQuestions(prediction);

    res.json({
      conversationId,
      diseaseContext,
      suggestedQuestions
    });

  } catch (error) {
    console.error('Error in analyze-plant:', error);
    res.status(500).json({ error: 'Failed to process plant analysis' });
  }
});

// Chat endpoint (streaming)
app.get('/api/chat/stream/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const { question } = req.query;

  const conversation = conversations.get(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // Set up Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Check if Ollama is available
    const ollamaHealthy = await ollamaClient.checkHealth();
    
    let prompt;
    if (question) {
      // Follow-up question - build context from conversation history
      const { diseaseName, confidence, cropType } = conversation.diseaseContext;
      
      // Add conversation history for context
      let conversationContext = '';
      if (conversation.messages.length > 0) {
        conversationContext = '\n\nPrevious conversation:\n';
        conversation.messages.slice(-4).forEach(msg => {
          conversationContext += `${msg.role === 'user' ? 'Farmer' : 'Expert'}: ${msg.content}\n`;
        });
      }
      
      prompt = `You are an agricultural expert helping a farmer with ${diseaseName} (${confidence}% confidence) on their ${cropType} plants.${conversationContext}

Farmer's question: ${question}

Provide a clear, helpful answer in simple language. Be specific and actionable. If the question is about treatment, dosage, timing, or prevention, give detailed practical advice.`;
      
      // Save user message
      conversation.messages.push({
        role: 'user',
        content: question,
        timestamp: new Date()
      });
      
    } else {
      // Initial advice
      prompt = buildPrompt(conversation.diseaseContext);
    }

    let fullResponse = '';
    
    if (ollamaHealthy) {
      // Stream from Ollama
      try {
        for await (const chunk of ollamaClient.streamGenerate(prompt)) {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      } catch (streamError) {
        console.error('Streaming error:', streamError);
        // Send fallback
        const fallback = getFallbackAdvice(conversation.diseaseContext.diseaseName);
        fullResponse = fallback;
        res.write(`data: ${JSON.stringify({ chunk: fallback })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true, fallback: true })}\n\n`);
      }
    } else {
      // Use fallback knowledge
      const fallback = getFallbackAdvice(conversation.diseaseContext.diseaseName);
      fullResponse = fallback;
      res.write(`data: ${JSON.stringify({ chunk: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, fallback: true })}\n\n`);
    }

    // Save assistant's response to conversation history
    if (fullResponse) {
      conversation.messages.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      });
      conversation.lastActivity = new Date();
    }

    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
    res.end();
  }
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🌱 Farmer Chatbot Server Started');
  console.log('='.repeat(60));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Ollama URL: ${CONFIG.ollamaUrl}`);
  console.log(`LLM Model: ${CONFIG.ollamaModel}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Make sure Ollama is running: ollama serve');
  console.log('2. Make sure ML API is running: python api_service.py');
  console.log('3. Open demo.html in your browser');
  console.log('='.repeat(60));
});
