"""
FastAPI Microservice for Plant Disease Detection using PyTorch
Integrates with MERN Stack
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import torch.nn.functional as F
import timm
import numpy as np
import cv2
import joblib
import json
from pathlib import Path
from typing import List, Dict
import uvicorn
from pydantic import BaseModel
from datetime import datetime
import io

# Initialize FastAPI app
app = FastAPI(
    title="Plant Disease Detection API",
    description="AI-powered early detection of crop pests and diseases",
    version="1.0.0"
)

# CORS configuration for MERN stack integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and encoder
model = None
label_encoder = None
class_names = None
device = None

# Configuration
CONFIG = {
    'model_path': 'efficientnet_plant_disease.pth',
    'label_encoder_path': 'label_encoder.pkl',
    'class_names_path': 'class_names.json',
    'image_size': (224, 224),
    'confidence_threshold': 0.5
}

# Response models
class PredictionResponse(BaseModel):
    success: bool
    prediction: str
    confidence: float
    all_predictions: List[Dict[str, float]]
    timestamp: str
    message: str = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    num_classes: int
    device: str
    timestamp: str

# Load model and encoder on startup
@app.on_event("startup")
async def load_model_on_startup():
    """Load ML model and label encoder when API starts"""
    global model, label_encoder, class_names, device
    
    try:
        print("Loading model and encoders...")
        
        # Set device
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {device}")
        
        # Load checkpoint
        checkpoint = torch.load(CONFIG['model_path'], map_location=device)
        num_classes = checkpoint['num_classes']
        
        # Create model
        model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=num_classes)
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(device)
        model.eval()
        print(f"✓ Model loaded from {CONFIG['model_path']}")
        
        # Load label encoder
        label_encoder = joblib.load(CONFIG['label_encoder_path'])
        print(f"✓ Label encoder loaded from {CONFIG['label_encoder_path']}")
        
        # Load class names
        with open(CONFIG['class_names_path'], 'r') as f:
            class_names = json.load(f)
        print(f"✓ Class names loaded: {len(class_names)} classes")
        
        print("=" * 60)
        print("API Ready! Model loaded successfully")
        print("=" * 60)
        
    except Exception as e:
        print(f"Error loading model: {e}")
        print("API will start but predictions will fail until model is loaded")

def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Preprocess uploaded image for model prediction"""
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        
        # Decode image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image")
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize to model input size
        img = cv2.resize(img, CONFIG['image_size'])
        
        # Convert to tensor and normalize
        img_tensor = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0
        
        # Normalize with ImageNet stats
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
        img_tensor = (img_tensor - mean) / std
        
        # Add batch dimension
        img_tensor = img_tensor.unsqueeze(0)
        
        return img_tensor
        
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {str(e)}")

def get_top_predictions(predictions: torch.Tensor, top_k: int = 5) -> List[Dict[str, float]]:
    """Get top K predictions with class names and confidence scores"""
    # Apply softmax to get probabilities
    probs = F.softmax(predictions, dim=1)[0]
    
    # Get top K indices and values
    top_probs, top_indices = torch.topk(probs, min(top_k, len(probs)))
    
    # Create list of predictions
    top_predictions = []
    for prob, idx in zip(top_probs.cpu().numpy(), top_indices.cpu().numpy()):
        top_predictions.append({
            'class': class_names[idx],
            'confidence': float(prob)
        })
    
    return top_predictions

@app.get("/", response_model=Dict)
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Plant Disease Detection API",
        "version": "1.0.0",
        "framework": "PyTorch + EfficientNet",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "predict_batch": "/predict/batch",
            "classes": "/classes"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if model is not None else "model_not_loaded",
        model_loaded=model is not None,
        num_classes=len(class_names) if class_names else 0,
        device=str(device) if device else "unknown",
        timestamp=datetime.now().isoformat()
    )

@app.get("/classes")
async def get_classes():
    """Get all available disease classes"""
    if class_names is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "success": True,
        "num_classes": len(class_names),
        "classes": class_names
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_disease(file: UploadFile = File(...)):
    """
    Predict plant disease from uploaded image
    
    Args:
        file: Image file (JPG, JPEG, PNG)
    
    Returns:
        Prediction results with confidence scores
    """
    # Check if model is loaded
    if model is None or label_encoder is None:
        raise HTTPException(
            status_code=503, 
            detail="Model not loaded. Please check server logs."
        )
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (JPG, JPEG, PNG)"
        )
    
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Preprocess image
        processed_image = preprocess_image(image_bytes)
        processed_image = processed_image.to(device)
        
        # Make prediction
        with torch.no_grad():
            predictions = model(processed_image)
        
        # Get top predictions
        top_predictions = get_top_predictions(predictions, top_k=5)
        
        # Get primary prediction
        primary_prediction = top_predictions[0]
        
        # Check confidence threshold
        if primary_prediction['confidence'] < CONFIG['confidence_threshold']:
            message = f"Low confidence prediction. Consider retaking image."
        else:
            message = "Prediction successful"
        
        return PredictionResponse(
            success=True,
            prediction=primary_prediction['class'],
            confidence=primary_prediction['confidence'],
            all_predictions=top_predictions,
            timestamp=datetime.now().isoformat(),
            message=message
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.post("/predict/batch")
async def predict_batch(files: List[UploadFile] = File(...)):
    """
    Predict plant diseases for multiple images
    
    Args:
        files: List of image files
    
    Returns:
        List of prediction results
    """
    if model is None or label_encoder is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 images allowed per batch"
        )
    
    results = []
    
    for file in files:
        try:
            image_bytes = await file.read()
            processed_image = preprocess_image(image_bytes)
            processed_image = processed_image.to(device)
            
            with torch.no_grad():
                predictions = model(processed_image)
            
            top_predictions = get_top_predictions(predictions, top_k=3)
            
            results.append({
                "filename": file.filename,
                "success": True,
                "prediction": top_predictions[0]['class'],
                "confidence": top_predictions[0]['confidence'],
                "top_predictions": top_predictions
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return {
        "success": True,
        "total_images": len(files),
        "results": results,
        "timestamp": datetime.now().isoformat()
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"success": False, "message": "Endpoint not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"}
    )

if __name__ == "__main__":
    # Run the API server
    uvicorn.run(
        "api_service_pytorch:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )
