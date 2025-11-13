"""
FastAPI Microservice for Plant Disease Detection using Keras/TensorFlow
Integrates with MERN Stack
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
import cv2
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

# Global variables for model
model = None
class_names = None

# Configuration
CONFIG = {
    'model_path': 'plant_disease_model.h5',
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
    timestamp: str

# Load model on startup
@app.on_event("startup")
async def load_model_on_startup():
    """Load ML model when API starts"""
    global model, class_names
    
    try:
        print("Loading model and class names...")
        
        # Load class names
        with open(CONFIG['class_names_path'], 'r') as f:
            class_names = json.load(f)
        print(f"✓ Class names loaded: {len(class_names)} classes")
        
        # Load Keras model
        model = tf.keras.models.load_model(CONFIG['model_path'])
        print(f"✓ Model loaded from {CONFIG['model_path']}")
        
        print("=" * 60)
        print("API Ready! Model loaded successfully")
        print("=" * 60)
        
    except Exception as e:
        print(f"Error loading model: {e}")
        print("API will start but predictions will fail until model is loaded")

def preprocess_image(image_bytes: bytes) -> np.ndarray:
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
        
        # Normalize to [0, 1]
        img = img.astype(np.float32) / 255.0
        
        # Add batch dimension
        img = np.expand_dims(img, axis=0)
        
        return img
        
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {str(e)}")

def get_top_predictions(predictions: np.ndarray, top_k: int = 5) -> List[Dict[str, float]]:
    """Get top K predictions with class names and confidence scores"""
    # Get probabilities
    probs = predictions[0]
    
    # Get top K indices
    top_indices = np.argsort(probs)[-top_k:][::-1]
    
    # Create list of predictions
    top_predictions = []
    for idx in top_indices:
        top_predictions.append({
            'class': class_names[idx],
            'confidence': float(probs[idx])
        })
    
    return top_predictions

@app.get("/", response_model=Dict)
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Plant Disease Detection API",
        "version": "1.0.0",
        "framework": "TensorFlow/Keras + EfficientNet",
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
    if model is None:
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
        
        # Make prediction
        predictions = model.predict(processed_image, verbose=0)
        
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
    if model is None:
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
            
            predictions = model.predict(processed_image, verbose=0)
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
        "api_service_keras:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )
