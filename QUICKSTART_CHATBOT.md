# 🚀 Quick Start Guide - Farmer Chatbot

## What You'll Get
A complete AI-powered chatbot that:
- Analyzes plant images using your ML model
- Provides detailed disease treatment advice using a local LLM
- Shows the entire process visually
- Works offline (after initial setup)
- Costs $0 to run!

## Prerequisites
- ✅ Python ML API running (you already have this!)
- ⬜ Node.js installed
- ⬜ Ollama installed with Llama model

## Step-by-Step Setup

### 1. Install Node.js (if not installed)
Download from: https://nodejs.org/
- Choose LTS version
- Run installer
- Verify: `node --version`

### 2. Install Ollama and Download LLM
Follow the detailed guide in `OLLAMA_SETUP.md`

Quick version:
```bash
# Download Ollama from https://ollama.ai/download
# Then run:
ollama pull llama3.2:3b
```

### 3. Install Node.js Dependencies
```bash
npm install
```

This installs: express, cors, axios, dotenv

### 4. Start All Services

**Terminal 1 - ML API** (if not already running):
```bash
python api_service.py
```
Should show: "API Ready! Model loaded successfully"

**Terminal 2 - Ollama** (if not running as service):
```bash
ollama serve
```
Should show: "Listening on 127.0.0.1:11434"

**Terminal 3 - Chatbot Server**:
```bash
node chatbot-server.js
```
Should show: "🌱 Farmer Chatbot Server Started"

### 5. Open Demo Page
Simply open `demo.html` in your web browser:
- Double-click the file, OR
- Right-click → Open with → Chrome/Firefox/Edge

## Using the Demo

1. **Upload Image**
   - Click the upload box or drag & drop a plant image
   - Choose any image from your computer

2. **Watch the Magic** ✨
   - Step 1: ML model analyzes the image
   - Step 2: Disease is detected
   - Step 3: AI expert generates advice

3. **Get Detailed Advice**
   - See disease name and confidence
   - Read AI-generated treatment advice
   - Click suggested questions
   - Ask your own follow-up questions

4. **Chat with AI**
   - Type any question about the disease
   - Get instant answers
   - AI remembers the conversation context

## Troubleshooting

### "Failed to fetch" error
**Problem**: One of the services isn't running

**Solution**:
```bash
# Check ML API
curl http://localhost:5000/health

# Check Chatbot Server
curl http://localhost:4000/api/health

# Check Ollama
curl http://localhost:11434/api/tags
```

All should return 200 OK.

### Chatbot gives fallback responses
**Problem**: Ollama isn't running or model not downloaded

**Solution**:
```bash
# Check if Ollama is running
ollama list

# If no models, download one
ollama pull llama3.2:3b

# Start Ollama
ollama serve
```

### Slow responses
**Problem**: LLM is running on CPU

**Solutions**:
- Use smaller model: `llama3.2:3b` (fastest)
- Close other applications
- Be patient - first response takes 10-30 seconds
- Subsequent responses are faster

### CORS errors
**Problem**: Browser blocking requests

**Solution**:
- Make sure chatbot-server.js is running
- Check browser console for specific error
- Try different browser

## Testing Different Images

Try these types of images:
- Tomato leaves with spots
- Potato plants with blight
- Pepper plants with bacterial spot
- Healthy plants (to see positive feedback)

The ML model supports 16 disease classes!

## What's Happening Behind the Scenes

```
Your Image
    ↓
ML Model (EfficientNet)
    ↓
Disease Prediction
    ↓
Chatbot Server (Node.js)
    ↓
Ollama (Local LLM)
    ↓
Treatment Advice
    ↓
Your Browser (Streaming!)
```

## Next Steps

Once this works, you can:
1. Integrate into your MERN app
2. Add user authentication
3. Save conversation history to MongoDB
4. Deploy to production
5. Add more features (voice input, multi-language, etc.)

## Need Help?

Check these files:
- `OLLAMA_SETUP.md` - Detailed Ollama setup
- `chatbot-server.js` - Server code with comments
- `demo.html` - Frontend code with comments

## Performance Tips

- **First run**: Slow (model loading)
- **Subsequent runs**: Much faster
- **CPU vs GPU**: GPU is 5-10x faster but not required
- **Model size**: Smaller = faster, larger = better quality

Recommended for demo: `llama3.2:3b` (good balance)

## Success Checklist

- [ ] Node.js installed
- [ ] Ollama installed
- [ ] Llama model downloaded
- [ ] `npm install` completed
- [ ] ML API running (port 5000)
- [ ] Ollama running (port 11434)
- [ ] Chatbot server running (port 4000)
- [ ] demo.html opens in browser
- [ ] Can upload image
- [ ] See visual pipeline animation
- [ ] Get disease prediction
- [ ] Chatbot streams advice
- [ ] Can ask follow-up questions

🎉 **You're ready for the hackathon!**
