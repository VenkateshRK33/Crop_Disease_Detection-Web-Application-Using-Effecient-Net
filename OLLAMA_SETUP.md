# Ollama Setup Guide for Windows

## What is Ollama?
Ollama lets you run large language models (like Llama, Mistral) locally on your computer - no API costs, no internet needed after download!

## Installation Steps

### Step 1: Download Ollama
1. Go to: https://ollama.ai/download
2. Click "Download for Windows"
3. Run the installer (OllamaSetup.exe)
4. Follow the installation wizard

### Step 2: Verify Installation
Open PowerShell or Command Prompt and run:
```bash
ollama --version
```

You should see something like: `ollama version 0.1.x`

### Step 3: Download the LLM Model
We'll use Llama 3.2 (3B) - it's fast and works well on CPU:

```bash
ollama pull llama3.2:3b
```

This will download ~2GB. Wait for it to complete.

**Alternative models** (if you have more RAM):
```bash
# Phi-3 Mini (3.8B) - Balanced
ollama pull phi3:mini

# Mistral (7B) - Best quality but slower
ollama pull mistral:7b
```

### Step 4: Test Ollama
Start Ollama server:
```bash
ollama serve
```

In another terminal, test it:
```bash
ollama run llama3.2:3b "What is tomato late blight?"
```

You should see a response about the disease!

### Step 5: Keep Ollama Running
For the chatbot to work, Ollama must be running. You can:

**Option A**: Run in background
```bash
ollama serve
```
Keep this terminal open.

**Option B**: Install as Windows service (advanced)
Ollama usually installs as a service automatically. Check if it's running:
- Open Task Manager
- Look for "Ollama" in background processes

## Troubleshooting

### "ollama: command not found"
- Restart your terminal after installation
- Check if Ollama is in PATH: `C:\Users\<YourName>\AppData\Local\Programs\Ollama`

### "Failed to connect to Ollama"
- Make sure Ollama is running: `ollama serve`
- Check if port 11434 is available
- Try: `curl http://localhost:11434/api/tags`

### Model download is slow
- This is normal for first download (2-7GB depending on model)
- Downloads are cached, so you only do this once

### Out of memory errors
- Use smaller model: `llama3.2:3b` instead of `mistral:7b`
- Close other applications
- Minimum 8GB RAM recommended

## Quick Reference

```bash
# List downloaded models
ollama list

# Run a model interactively
ollama run llama3.2:3b

# Start Ollama server
ollama serve

# Remove a model
ollama rm llama3.2:3b

# Check Ollama status
curl http://localhost:11434/api/tags
```

## Next Steps
Once Ollama is installed and running:
1. Start your ML API: `python api_service.py`
2. Start the chatbot server: `node chatbot-server.js`
3. Open `demo.html` in your browser
4. Upload a plant image and watch the magic! 🌱
