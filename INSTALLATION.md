# 📦 Installation Guide

Complete step-by-step installation guide for the Plant Disease AI Assistant.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Step-by-Step Installation](#step-by-step-installation)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Prerequisites

### Required Software

#### 1. Node.js (v16.x or higher)

**Windows:**
1. Download installer from [nodejs.org](https://nodejs.org/)
2. Run installer and follow prompts
3. Verify installation:
```bash
node --version
npm --version
```

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

#### 2. Python (v3.8 or higher)

**Windows:**
1. Download from [python.org](https://www.python.org/downloads/)
2. **Important**: Check "Add Python to PATH" during installation
3. Verify:
```bash
python --version
pip --version
```

**macOS:**
```bash
# Using Homebrew
brew install python@3.11

# Verify
python3 --version
pip3 --version
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip

# Verify
python3 --version
pip3 --version
```

#### 3. MongoDB (v4.4 or higher)

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run installer, choose "Complete" installation
3. Install as Windows Service (recommended)
4. Start MongoDB:
```bash
net start MongoDB
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh --eval "db.version()"
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh --eval "db.version()"
```

**Alternative: MongoDB Atlas (Cloud)**
1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get connection string
4. Use connection string in `.env` file

#### 4. Ollama (Local LLM)

**Windows:**
1. Download from [ollama.ai](https://ollama.ai/download)
2. Run installer
3. Ollama will start automatically
4. Verify:
```bash
ollama --version
```

**macOS:**
```bash
# Download and install from ollama.ai
# Or use Homebrew
brew install ollama

# Start Ollama
ollama serve

# Verify
ollama --version
```

**Linux:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Verify
ollama --version
```

## Step-by-Step Installation

### Step 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd plant-disease-ai

# Or if you have the project folder already
cd path/to/plant-disease-ai
```

### Step 2: Install Python Dependencies

```bash
# Install ML service dependencies
pip install -r requirements_ml.txt

# If using Python 3 explicitly
pip3 install -r requirements_ml.txt

# Verify PyTorch installation
python -c "import torch; print(f'PyTorch {torch.__version__} installed successfully')"

# Verify all imports
python test_imports.py
```

**Expected Output:**
```
✓ torch imported successfully
✓ torchvision imported successfully
✓ fastapi imported successfully
✓ uvicorn imported successfully
✓ PIL imported successfully
All imports successful!
```

**If Installation Fails:**
```bash
# Try upgrading pip first
pip install --upgrade pip

# Install with verbose output to see errors
pip install -r requirements_ml.txt --verbose

# For Windows users with PyTorch issues
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### Step 3: Install Node.js Dependencies

```bash
# Install backend dependencies (from project root)
npm install

# Expected output: packages installed without errors
```

**Common Packages Installed:**
- express - Web server framework
- mongoose - MongoDB ODM
- multer - File upload handling
- axios - HTTP client
- cors - Cross-origin resource sharing
- dotenv - Environment configuration
- concurrently - Run multiple processes

### Step 4: Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend-react

# Install React dependencies
npm install

# Return to project root
cd ..
```

**Common Packages Installed:**
- react - UI library
- react-dom - React DOM rendering
- react-scripts - React build tools
- axios - HTTP client for API calls

### Step 5: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Windows (if cp doesn't work)
copy .env.example .env
```

**Edit `.env` file** (optional - defaults work for local development):

```bash
# Backend Configuration
PORT=4000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/plant-disease-db

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=minimax-m2:cloud

# ML Service Configuration
ML_API_URL=http://localhost:5000

# Environment
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```bash
# Replace MONGODB_URI with your Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/plant-disease-db?retryWrites=true&w=majority
```

### Step 6: Download Ollama Model

```bash
# Pull the AI model (first time only - ~4GB download)
ollama pull minimax-m2:cloud

# This may take several minutes depending on your internet speed
# Expected output: Downloading model... 100%

# Verify model is available
ollama list
```

**Alternative Models** (if minimax-m2:cloud is not available):
```bash
# Smaller, faster models
ollama pull llama2:7b
ollama pull mistral

# Update OLLAMA_MODEL in .env to match
```

### Step 7: Verify Model Files

```bash
# Check that the trained ML model exists
ls -la efficientnet_plant_disease.pth

# Windows
dir efficientnet_plant_disease.pth
```

**If model file is missing:**
```bash
# Train the model (this will take time)
python train_model.py

# Or download pre-trained model if available
```

### Step 8: Create Required Directories

```bash
# Create uploads directory for temporary files
mkdir uploads

# Windows
mkdir uploads

# Verify directory exists
ls -la uploads
```

## Verification

### Test Each Component Individually

#### 1. Test MongoDB Connection

```bash
# Test MongoDB is running
mongosh --eval "db.version()"

# Expected output: MongoDB version number

# Test connection from Node.js
node -e "require('mongoose').connect('mongodb://localhost:27017/plant-disease-db').then(() => console.log('✓ MongoDB Connected')).catch(e => console.log('✗ Error:', e.message))"
```

#### 2. Test ML Service

```bash
# Start ML service
python api_service.py

# In another terminal, test health endpoint
curl http://localhost:5000/health

# Expected output: {"status": "healthy"}

# Test prediction endpoint
curl -X POST -F "file=@test-image.jpg" http://localhost:5000/predict

# Stop ML service (Ctrl+C)
```

#### 3. Test Ollama

```bash
# Ensure Ollama is running
ollama serve

# In another terminal, test Ollama
curl http://localhost:11434/api/tags

# Expected output: JSON with list of models

# Test model inference
ollama run minimax-m2:cloud "Hello, how are you?"
```

#### 4. Test Backend

```bash
# Start backend (ensure MongoDB and ML service are running)
npm run start:backend

# In another terminal, test health endpoint
curl http://localhost:4000/api/health

# Expected output:
# {
#   "status": "ok",
#   "database": "connected",
#   "ollama": "connected",
#   "model": "minimax-m2:cloud"
# }

# Stop backend (Ctrl+C)
```

#### 5. Test Frontend

```bash
# Start frontend dev server
npm run start:frontend

# Browser should automatically open to http://localhost:3000
# If not, manually open http://localhost:3000

# You should see the Plant Disease AI Assistant interface

# Stop frontend (Ctrl+C)
```

### Run Integration Tests

```bash
# Test ML API
python test_api.py

# Test backend integration
node test-backend-complete.js

# Test chatbot integration
node test-chatbot-integration.js

# Test interactive chat
node test-interactive-chat.js
```

**Expected Results:**
- All tests should pass ✓
- No error messages
- Services respond correctly

## Start All Services

### Option 1: Start All at Once (Recommended)

```bash
# Start all services concurrently
npm run dev
```

**Expected Output:**
```
[ML] INFO:     Started server process
[ML] INFO:     Uvicorn running on http://0.0.0.0:5000
[Backend] Server running on port 4000
[Backend] MongoDB connected successfully
[Backend] Ollama connected: minimax-m2:cloud
[Frontend] Compiled successfully!
[Frontend] webpack compiled with 0 warnings
[Frontend] On Your Network: http://192.168.1.x:3000
```

### Option 2: Start Services Individually

**Terminal 1 - ML Service:**
```bash
npm run start:ml
# Or: python api_service.py
```

**Terminal 2 - Backend:**
```bash
npm run start:backend
# Or: node backend/server.js
```

**Terminal 3 - Frontend:**
```bash
npm run start:frontend
# Or: cd frontend-react && npm start
```

### Access the Application

Open your browser and navigate to:
- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/health
- **ML Service**: http://localhost:5000/health

## Troubleshooting

### Python Issues

**Problem: `pip: command not found`**
```bash
# Use pip3 instead
pip3 install -r requirements_ml.txt

# Or use python -m pip
python -m pip install -r requirements_ml.txt
```

**Problem: PyTorch installation fails**
```bash
# Install CPU-only version (smaller, faster download)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# For CUDA support (if you have NVIDIA GPU)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

**Problem: Permission denied**
```bash
# Use --user flag
pip install -r requirements_ml.txt --user

# Or use virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements_ml.txt
```

### Node.js Issues

**Problem: `npm install` fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Windows
rmdir /s /q node_modules
del package-lock.json
npm install
```

**Problem: Port already in use**
```bash
# Find and kill process using the port
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9

# Or change PORT in .env
```

### MongoDB Issues

**Problem: MongoDB won't start**
```bash
# Windows
net start MongoDB

# macOS
brew services restart mongodb-community

# Linux
sudo systemctl restart mongod

# Check status
sudo systemctl status mongod
```

**Problem: Connection refused**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Use MongoDB Atlas as alternative
# Update MONGODB_URI in .env with Atlas connection string
```

### Ollama Issues

**Problem: Ollama not found**
```bash
# Reinstall Ollama from ollama.ai
# Ensure it's added to PATH

# Start Ollama service
ollama serve

# Verify installation
ollama --version
```

**Problem: Model not found**
```bash
# List available models
ollama list

# Pull the required model
ollama pull minimax-m2:cloud

# If model is too large, use smaller alternative
ollama pull llama2:7b
# Update OLLAMA_MODEL in .env
```

### General Issues

**Problem: Services can't communicate**
```bash
# Verify all services are running on correct ports
curl http://localhost:5000/health  # ML Service
curl http://localhost:4000/api/health  # Backend
curl http://localhost:3000  # Frontend

# Check .env configuration
cat .env

# Ensure no firewall blocking localhost connections
```

**Problem: File upload fails**
```bash
# Ensure uploads directory exists
mkdir uploads

# Check directory permissions
# Windows: Right-click > Properties > Security
# Linux/macOS: chmod 755 uploads

# Verify file size is under 10MB
# Check file format is jpg, jpeg, png, or webp
```

## Next Steps

After successful installation:

1. **Test the Application**
   - Upload a plant disease image
   - Verify prediction accuracy
   - Test the chatbot interaction

2. **Read Documentation**
   - [Quick Start Guide](QUICKSTART_CHATBOT.md)
   - [Project Overview](docs/PROJECT-OVERVIEW.md)
   - [API Documentation](docs/CHATBOT/README.md)

3. **Explore Features**
   - Try different plant images
   - Ask various questions to the AI
   - Check prediction history

4. **Development**
   - Review code structure
   - Make customizations
   - Add new features

5. **Deployment**
   - Follow [Deployment Guide](README.md#-deployment)
   - Set up production environment
   - Configure monitoring

## Getting Help

If you encounter issues not covered here:

1. Check the main [README.md](README.md) troubleshooting section
2. Review component-specific documentation:
   - [ML Model Docs](docs/ML-MODEL/README.md)
   - [Chatbot Docs](docs/CHATBOT/README.md)
3. Run diagnostic tests:
   ```bash
   python test_api.py
   node test-backend-complete.js
   ```
4. Check service health:
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:4000/api/health
   ```

## Summary

You should now have:
- ✅ All prerequisites installed
- ✅ Python dependencies installed
- ✅ Node.js dependencies installed
- ✅ Environment configured
- ✅ Ollama model downloaded
- ✅ All services tested and working
- ✅ Application accessible at http://localhost:3000

**Ready to use the Plant Disease AI Assistant!** 🌱
