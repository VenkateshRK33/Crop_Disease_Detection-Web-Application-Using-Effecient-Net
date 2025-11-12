# Quick Start Guide - Plant Disease Detection

## ✅ All Dependencies Installed!

Your environment is ready with:
- ✓ PyTorch 2.9.0
- ✓ torchvision 0.24.0
- ✓ timm 1.0.22 (EfficientNet models)
- ✓ FastAPI & Uvicorn
- ✓ OpenCV, scikit-learn, matplotlib, seaborn
- ✓ Python 3.14 compatible

## 🚀 Next Steps

### 1. Download the Dataset

Go to: https://www.kaggle.com/datasets/emmarex/plantdisease

Download and extract to a folder named `PlantVillage` in this directory.

Your structure should look like:
```
PlantVillage/
├── Apple___Apple_scab/
├── Apple___Black_rot/
├── Apple___Cedar_apple_rust/
├── Apple___healthy/
├── Tomato___Late_blight/
└── ... (38 classes total)
```

### 2. Train the Model

```bash
python train_efficientnet_pytorch.py
```

**What happens:**
- Loads ~54,000 images from 38 disease classes
- Trains EfficientNetB3 for 50 epochs
- Saves best model as `efficientnet_plant_disease.pth`
- Generates evaluation plots and metrics

**Time:** 2-4 hours on GPU, 8-12 hours on CPU

**Output files:**
- `efficientnet_plant_disease.pth` - Trained model
- `label_encoder.pkl` - Label encoder
- `class_names.json` - Class names
- `training_history.png` - Training curves
- `confusion_matrix.png` - Confusion matrix
- `classification_report.txt` - Metrics

### 3. Start the API

```bash
python api_service_pytorch.py
```

The API will start on `http://localhost:5000`

### 4. Test the API

Open another terminal and run:

```bash
python test_api.py
```

Or test manually:

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Get Classes:**
```bash
curl http://localhost:5000/classes
```

**Predict (with an image):**
```bash
curl -X POST -F "file=@your_image.jpg" http://localhost:5000/predict
```

## 🔗 Integrate with MERN Stack

### From Node.js Backend:

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

// Usage
predictDisease('./plant_image.jpg')
  .then(result => {
    console.log('Prediction:', result.prediction);
    console.log('Confidence:', result.confidence);
  });
```

### From React Frontend:

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

// Usage in component
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  const result = await uploadImage(file);
  
  console.log('Disease:', result.prediction);
  console.log('Confidence:', result.confidence);
  console.log('Top 5:', result.all_predictions);
};
```

## 📊 Expected Results

After training, you should see:
- **Accuracy**: 95-98%
- **Precision**: 94-97%
- **Recall**: 94-97%
- **F1-Score**: 94-97%

## 🎯 API Response Format

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
  "timestamp": "2025-11-10T10:30:00",
  "message": "Prediction successful"
}
```

## 🛠️ Troubleshooting

**Dataset not found:**
- Make sure `PlantVillage` folder is in the same directory as the script
- Check that it contains 38 subdirectories (one per class)

**Out of memory:**
- Reduce `batch_size` in CONFIG (try 16 or 8)
- Close other applications

**API not accessible:**
- Check if port 5000 is available
- Try changing port in `api_service_pytorch.py`

**Low accuracy:**
- Train for more epochs
- Check if dataset is complete

## 📚 Files Overview

| File | Purpose |
|------|---------|
| `train_efficientnet_pytorch.py` | Training script |
| `api_service_pytorch.py` | FastAPI microservice |
| `test_api.py` | API testing script |
| `requirements_ml.txt` | Python dependencies |
| `README_ML.md` | Detailed documentation |

## 🎓 Dataset Classes (38 total)

- Apple: 4 classes (scab, black rot, cedar rust, healthy)
- Corn: 4 classes
- Grape: 4 classes
- Tomato: 10 classes
- And 16 more crops...

## 💡 Tips for Hackathon

1. **Demo preparation**: Have sample images ready for each disease class
2. **Performance**: Mention 95%+ accuracy in your presentation
3. **Real-world impact**: Emphasize early detection for sustainable farming
4. **Scalability**: Highlight microservice architecture for easy integration
5. **Future work**: Mention mobile app, real-time detection, treatment recommendations

## 🚀 Ready to Go!

You're all set! Just download the dataset and start training. Good luck with your hackathon! 🎉
