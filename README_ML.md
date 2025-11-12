# Plant Disease Detection - ML Microservice

EfficientNet-based ML model for early detection of crop pests and diseases, designed to integrate with MERN stack.

## 🎯 Features

- **EfficientNetB3** architecture (PyTorch + timm) for optimal accuracy/efficiency balance
- **38 disease classes** from PlantVillage dataset
- **FastAPI microservice** for easy MERN integration
- **Comprehensive evaluation** metrics and visualizations
- **Batch prediction** support
- **CORS enabled** for cross-origin requests
- **Python 3.14 compatible**

## 📁 Project Structure

```
├── train_efficientnet_pytorch.py  # Training script (PyTorch)
├── api_service_pytorch.py          # FastAPI microservice (PyTorch)
├── requirements_ml.txt             # Python dependencies
├── PlantVillage/                   # Dataset directory (download from Kaggle)
├── efficientnet_plant_disease.pth  # Trained model (generated)
├── label_encoder.pkl               # Label encoder (generated)
├── class_names.json                # Class names (generated)
├── training_history.png            # Training plots (generated)
├── confusion_matrix.png            # Confusion matrix (generated)
└── classification_report.txt       # Evaluation report (generated)
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements_ml.txt
```

### 2. Download Dataset

Download the PlantVillage dataset from Kaggle:
https://www.kaggle.com/datasets/emmarex/plantdisease

Extract it to a folder named `PlantVillage` in the project root.

### 3. Train the Model

```bash
python train_efficientnet_pytorch.py
```

**Training Details:**
- Uses pre-trained EfficientNetB3 from timm
- Fine-tunes entire model (50 epochs with early stopping)
- Generates evaluation metrics and visualizations
- Saves best model based on validation accuracy

**Expected Output:**
- `efficientnet_plant_disease.pth` - Trained model
- `label_encoder.pkl` - Label encoder
- `class_names.json` - Disease class names
- `training_history.png` - Training curves
- `confusion_matrix.png` - Confusion matrix
- `classification_report.txt` - Detailed metrics

### 4. Start the API Service

```bash
python api_service_pytorch.py
```

The API will run on `http://localhost:5000`

## 🔌 API Endpoints

### Health Check
```bash
GET http://localhost:5000/health
```

### Get All Classes
```bash
GET http://localhost:5000/classes
```

### Single Image Prediction
```bash
POST http://localhost:5000/predict
Content-Type: multipart/form-data
Body: file=<image_file>
```

**Response:**
```json
{
  "success": true,
  "prediction": "Tomato___Late_blight",
  "confidence": 0.9876,
  "all_predictions": [
    {"class": "Tomato___Late_blight", "confidence": 0.9876},
    {"class": "Tomato___Early_blight", "confidence": 0.0098},
    ...
  ],
  "timestamp": "2025-11-10T10:30:00",
  "message": "Prediction successful"
}
```

### Batch Prediction
```bash
POST http://localhost:5000/predict/batch
Content-Type: multipart/form-data
Body: files=<image_file1>, files=<image_file2>, ...
```

## 🔗 MERN Stack Integration

### From Node.js Backend

```javascript
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

async function predictDisease(imagePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  
  const response = await axios.post('http://localhost:5000/predict', form, {
    headers: form.getHeaders()
  });
  
  return response.data;
}
```

### From React Frontend

```javascript
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:5000/predict', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result;
}
```

## 📊 Model Performance

After training, check:
- `classification_report.txt` for per-class metrics
- `confusion_matrix.png` for prediction patterns
- `training_history.png` for training curves
- `test_metrics.json` for overall performance

Expected metrics:
- **Accuracy**: 95%+
- **Precision**: 94%+
- **Recall**: 94%+
- **F1-Score**: 94%+

## 🛠️ Configuration

Edit `CONFIG` dictionary in `train_efficientnet_pytorch.py`:

```python
CONFIG = {
    'dataset_path': 'PlantVillage',
    'image_size': (224, 224),
    'batch_size': 32,
    'epochs': 50,
    'learning_rate': 0.001,
    'device': 'cuda' if torch.cuda.is_available() else 'cpu'
    ...
}
```

Edit `CONFIG` dictionary in `api_service_pytorch.py`:

```python
CONFIG = {
    'model_path': 'efficientnet_plant_disease.pth',
    'image_size': (224, 224),
    'confidence_threshold': 0.5
}
```

## 🐛 Troubleshooting

**Issue: Out of memory during training**
- Reduce `batch_size` in CONFIG
- Use smaller image size (e.g., 192x192)

**Issue: API not accessible from frontend**
- Check CORS settings in `api_service_pytorch.py`
- Update `allow_origins` with your frontend URL

**Issue: Low accuracy**
- Train for more epochs
- Increase dataset size with augmentation
- Try EfficientNetB4 or B5 (change model name in code)

**Issue: Python 3.14 compatibility**
- This version uses PyTorch which supports Python 3.14
- If you have Python 3.11 or 3.12, you can also use TensorFlow/Keras

## 📝 Notes

- Training takes 2-4 hours on GPU, longer on CPU
- Model file is ~50MB (PyTorch checkpoint)
- API uses ~2GB RAM when loaded
- Supports JPG, JPEG, PNG image formats
- Recommended image size: 224x224 pixels
- Works on Windows, Linux, and macOS

## 🎓 Dataset Classes (38 total)

The model detects diseases across multiple crops:
- Apple (4 classes)
- Blueberry (1 class)
- Cherry (2 classes)
- Corn (4 classes)
- Grape (4 classes)
- Orange (1 class)
- Peach (2 classes)
- Pepper (2 classes)
- Potato (3 classes)
- Raspberry (1 class)
- Soybean (1 class)
- Squash (1 class)
- Strawberry (2 classes)
- Tomato (10 classes)

## 🚀 Deployment

For production deployment:

1. Update CORS origins in `api_service.py`
2. Use production WSGI server (already using uvicorn)
3. Set up reverse proxy (nginx)
4. Enable HTTPS
5. Add authentication if needed
6. Monitor with logging/metrics

## 📧 Support

For hackathon support, check:
- Model training logs
- API server logs
- Test the `/health` endpoint
- Verify file paths in CONFIG
