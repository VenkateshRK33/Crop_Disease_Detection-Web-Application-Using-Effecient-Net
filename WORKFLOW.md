# Complete Workflow - Plant Disease Detection

## 🎯 Overview

This project uses **EfficientNetB3** with **PyTorch** to detect 38 plant diseases, integrated with your MERN stack via a **FastAPI** microservice.

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MERN Stack                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React      │→ │   Node.js    │→ │   MongoDB    │     │
│  │  (Frontend)  │  │  (Backend)   │  │  (Database)  │     │
│  └──────────────┘  └──────┬───────┘  └──────────────┘     │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP Request
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              Python ML Microservice (Port 5000)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              FastAPI Server                          │  │
│  │  • POST /predict        - Single image               │  │
│  │  • POST /predict/batch  - Multiple images            │  │
│  │  • GET  /health         - Health check               │  │
│  │  • GET  /classes        - Get all classes            │  │
│  └──────────────────────────────────────────────────────┘  │
│                             ↓                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         EfficientNetB3 Model (PyTorch)               │  │
│  │  • 10.7M parameters                                  │  │
│  │  • 38 disease classes                                │  │
│  │  • 95%+ accuracy                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Complete Workflow

### Phase 1: Setup (✅ DONE)
```bash
# All dependencies installed
✓ PyTorch 2.9.0
✓ FastAPI, Uvicorn
✓ OpenCV, scikit-learn
✓ All other dependencies
```

### Phase 2: Data Preparation (📥 TODO)
```bash
# 1. Download dataset from Kaggle
https://www.kaggle.com/datasets/emmarex/plantdisease

# 2. Extract to PlantVillage folder
PlantVillage/
├── Apple___Apple_scab/
├── Apple___Black_rot/
├── Tomato___Late_blight/
└── ... (38 classes total)
```

### Phase 3: Model Training (🎓 TODO)
```bash
# Run training script
python train_efficientnet_pytorch.py

# What happens:
# 1. Loads ~54,000 images
# 2. Splits: 70% train, 20% val, 10% test
# 3. Trains EfficientNetB3 for 50 epochs
# 4. Saves best model based on validation accuracy
# 5. Generates evaluation metrics and plots

# Output files:
# ✓ efficientnet_plant_disease.pth  - Trained model
# ✓ label_encoder.pkl                - Label encoder
# ✓ class_names.json                 - Class names
# ✓ training_history.png             - Training curves
# ✓ confusion_matrix.png             - Confusion matrix
# ✓ classification_report.txt        - Detailed metrics
# ✓ test_metrics.json                - JSON metrics
```

### Phase 4: API Deployment (🚀 TODO)
```bash
# Start the API server
python api_service_pytorch.py

# Server starts on http://localhost:5000
# Loads model and waits for requests
```

### Phase 5: Testing (🧪 TODO)
```bash
# Test the API
python test_api.py

# Or manually:
curl http://localhost:5000/health
curl http://localhost:5000/classes
curl -X POST -F "file=@image.jpg" http://localhost:5000/predict
```

### Phase 6: MERN Integration (🔗 TODO)

#### Option A: Direct from React
```javascript
// React component
const [result, setResult] = useState(null);

const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:5000/predict', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  setResult(data);
};

// Display results
{result && (
  <div>
    <h3>Disease: {result.prediction}</h3>
    <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
    <ul>
      {result.all_predictions.map((pred, i) => (
        <li key={i}>{pred.class}: {(pred.confidence * 100).toFixed(2)}%</li>
      ))}
    </ul>
  </div>
)}
```

#### Option B: Through Node.js Backend
```javascript
// Node.js Express route
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

app.post('/api/predict', upload.single('image'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path));
    
    const response = await axios.post('http://localhost:5000/predict', form, {
      headers: form.getHeaders()
    });
    
    // Save to MongoDB if needed
    await Disease.create({
      prediction: response.data.prediction,
      confidence: response.data.confidence,
      timestamp: new Date(),
      userId: req.user.id
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 📈 Data Flow

### Prediction Request Flow:
```
1. User uploads image in React
   ↓
2. React sends FormData to Node.js (or directly to Python)
   ↓
3. Node.js forwards to Python API (optional)
   ↓
4. Python API:
   - Receives image
   - Preprocesses (resize, normalize)
   - Runs through EfficientNet
   - Gets predictions
   - Returns JSON response
   ↓
5. Node.js saves to MongoDB (optional)
   ↓
6. React displays results
```

### Response Format:
```json
{
  "success": true,
  "prediction": "Tomato___Late_blight",
  "confidence": 0.9876,
  "all_predictions": [
    {"class": "Tomato___Late_blight", "confidence": 0.9876},
    {"class": "Tomato___Early_blight", "confidence": 0.0098},
    {"class": "Tomato___Leaf_Mold", "confidence": 0.0015},
    {"class": "Tomato___Septoria_leaf_spot", "confidence": 0.0008},
    {"class": "Tomato___healthy", "confidence": 0.0003}
  ],
  "timestamp": "2025-11-10T10:30:00.000Z",
  "message": "Prediction successful"
}
```

## 🎯 Performance Metrics

### Expected Results:
- **Accuracy**: 95-98%
- **Precision**: 94-97%
- **Recall**: 94-97%
- **F1-Score**: 94-97%
- **Inference Time**: <100ms per image
- **Model Size**: ~50MB

### Training Time:
- **GPU**: 2-4 hours
- **CPU**: 8-12 hours

## 🔧 Configuration

### Training Config:
```python
CONFIG = {
    'dataset_path': 'PlantVillage',
    'image_size': (224, 224),
    'batch_size': 32,
    'epochs': 50,
    'learning_rate': 0.001,
    'validation_split': 0.2,
    'test_split': 0.1,
    'device': 'cuda' if torch.cuda.is_available() else 'cpu'
}
```

### API Config:
```python
CONFIG = {
    'model_path': 'efficientnet_plant_disease.pth',
    'label_encoder_path': 'label_encoder.pkl',
    'class_names_path': 'class_names.json',
    'image_size': (224, 224),
    'confidence_threshold': 0.5
}
```

## 📦 Deployment Options

### Development:
```bash
# Python API
python api_service_pytorch.py

# Node.js
npm run dev

# React
npm start
```

### Production:
```bash
# Python API with Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker api_service_pytorch:app

# Or with PM2
pm2 start "python api_service_pytorch.py" --name ml-api

# Node.js with PM2
pm2 start server.js --name node-backend

# React build
npm run build
```

## 🐛 Troubleshooting

### Issue: Model not loading
```bash
# Check if files exist
ls efficientnet_plant_disease.pth
ls label_encoder.pkl
ls class_names.json

# If missing, train the model first
python train_efficientnet_pytorch.py
```

### Issue: CORS error
```python
# In api_service_pytorch.py, update:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Out of memory
```python
# Reduce batch size in train_efficientnet_pytorch.py
CONFIG = {
    'batch_size': 16,  # or 8
    ...
}
```

## 📚 File Reference

| File | Purpose | Status |
|------|---------|--------|
| `train_efficientnet_pytorch.py` | Training script | ✅ Ready |
| `api_service_pytorch.py` | API server | ✅ Ready |
| `test_api.py` | API testing | ✅ Ready |
| `test_imports.py` | Verify setup | ✅ Ready |
| `requirements_ml.txt` | Dependencies | ✅ Installed |
| `START_HERE.md` | Quick start | ✅ Created |
| `QUICKSTART.md` | Detailed guide | ✅ Created |
| `SETUP_COMPLETE.md` | Full docs | ✅ Created |

## 🎓 For Hackathon Presentation

### Key Points:
1. **Problem**: Manual disease detection is slow and inaccurate
2. **Solution**: AI-powered early detection with 95%+ accuracy
3. **Technology**: EfficientNetB3 + PyTorch + FastAPI + MERN
4. **Impact**: Reduces pesticide use, increases crop yield
5. **Scalability**: Microservice architecture, easy to deploy

### Demo Flow:
1. Show the React interface
2. Upload a diseased plant image
3. Show real-time prediction with confidence
4. Explain the top 5 predictions
5. Show the confusion matrix (high accuracy)
6. Discuss future features (mobile app, IoT sensors)

## 🚀 Next Steps

1. ✅ Setup complete
2. 📥 Download PlantVillage dataset
3. 🎓 Train the model
4. 🚀 Start the API
5. 🔗 Integrate with MERN
6. 🎉 Demo at hackathon!

Good luck! 🍀
