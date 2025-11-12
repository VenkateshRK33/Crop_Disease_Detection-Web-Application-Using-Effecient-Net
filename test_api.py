"""
Test script for the Plant Disease Detection API
"""

import requests
import json
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("Testing /health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 60)

def test_classes():
    """Test classes endpoint"""
    print("Testing /classes endpoint...")
    response = requests.get(f"{BASE_URL}/classes")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Number of classes: {data.get('num_classes')}")
    print(f"First 5 classes: {data.get('classes', [])[:5]}")
    print("-" * 60)

def test_predict(image_path):
    """Test prediction endpoint"""
    print(f"Testing /predict endpoint with image: {image_path}")
    
    if not Path(image_path).exists():
        print(f"Error: Image file not found: {image_path}")
        return
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/predict", files=files)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success: {data.get('success')}")
        print(f"Prediction: {data.get('prediction')}")
        print(f"Confidence: {data.get('confidence'):.4f}")
        print(f"Message: {data.get('message')}")
        print("\nTop 5 Predictions:")
        for pred in data.get('all_predictions', [])[:5]:
            print(f"  - {pred['class']}: {pred['confidence']:.4f}")
    else:
        print(f"Error: {response.text}")
    
    print("-" * 60)

def test_batch_predict(image_paths):
    """Test batch prediction endpoint"""
    print(f"Testing /predict/batch endpoint with {len(image_paths)} images")
    
    files = []
    for path in image_paths:
        if Path(path).exists():
            files.append(('files', open(path, 'rb')))
        else:
            print(f"Warning: Image not found: {path}")
    
    if not files:
        print("Error: No valid images found")
        return
    
    response = requests.post(f"{BASE_URL}/predict/batch", files=files)
    
    # Close file handles
    for _, f in files:
        f.close()
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total images: {data.get('total_images')}")
        print("\nResults:")
        for result in data.get('results', []):
            print(f"  {result['filename']}: {result.get('prediction', 'Error')} "
                  f"({result.get('confidence', 0):.4f})")
    else:
        print(f"Error: {response.text}")
    
    print("-" * 60)

def main():
    """Run all tests"""
    print("=" * 60)
    print("Plant Disease Detection API - Test Suite")
    print("=" * 60)
    print()
    
    # Test health
    try:
        test_health()
    except Exception as e:
        print(f"Health test failed: {e}")
        print("Make sure the API is running: python api_service.py")
        return
    
    # Test classes
    try:
        test_classes()
    except Exception as e:
        print(f"Classes test failed: {e}")
    
    # Test single prediction
    # Update this path with an actual test image
    test_image = "0a3d19ca-a126-4ea3-83e3-0abb0e9b02e3___YLCV_GCREC 2449.JPG"
    if Path(test_image).exists():
        try:
            test_predict(test_image)
        except Exception as e:
            print(f"Prediction test failed: {e}")
    else:
        print(f"Skipping prediction test - no test image found at: {test_image}")
        print("Update 'test_image' variable with a valid image path")
        print("-" * 60)
    
    # Test batch prediction
    # Update these paths with actual test images
    batch_images = [test_image]  # Add more images if available
    if all(Path(p).exists() for p in batch_images):
        try:
            test_batch_predict(batch_images)
        except Exception as e:
            print(f"Batch prediction test failed: {e}")
    
    print("\n" + "=" * 60)
    print("Test Suite Complete")
    print("=" * 60)

if __name__ == "__main__":
    main()
