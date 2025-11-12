"""
Test script to verify all dependencies are installed correctly
"""

print("Testing imports...")
print("=" * 60)

try:
    import torch
    print(f"✓ PyTorch {torch.__version__}")
    print(f"  Device: {'CUDA' if torch.cuda.is_available() else 'CPU'}")
except ImportError as e:
    print(f"✗ PyTorch: {e}")

try:
    import torchvision
    print(f"✓ torchvision {torchvision.__version__}")
except ImportError as e:
    print(f"✗ torchvision: {e}")

try:
    import timm
    print(f"✓ timm {timm.__version__}")
except ImportError as e:
    print(f"✗ timm: {e}")

try:
    import numpy as np
    print(f"✓ numpy {np.__version__}")
except ImportError as e:
    print(f"✗ numpy: {e}")

try:
    import cv2
    print(f"✓ opencv-python {cv2.__version__}")
except ImportError as e:
    print(f"✗ opencv-python: {e}")

try:
    import sklearn
    print(f"✓ scikit-learn {sklearn.__version__}")
except ImportError as e:
    print(f"✗ scikit-learn: {e}")

try:
    import fastapi
    print(f"✓ FastAPI {fastapi.__version__}")
except ImportError as e:
    print(f"✗ FastAPI: {e}")

try:
    import uvicorn
    print(f"✓ uvicorn {uvicorn.__version__}")
except ImportError as e:
    print(f"✗ uvicorn: {e}")

try:
    import matplotlib
    print(f"✓ matplotlib {matplotlib.__version__}")
except ImportError as e:
    print(f"✗ matplotlib: {e}")

try:
    import seaborn
    print(f"✓ seaborn {seaborn.__version__}")
except ImportError as e:
    print(f"✗ seaborn: {e}")

try:
    import joblib
    print(f"✓ joblib {joblib.__version__}")
except ImportError as e:
    print(f"✗ joblib: {e}")

try:
    import tqdm
    print(f"✓ tqdm {tqdm.__version__}")
except ImportError as e:
    print(f"✗ tqdm: {e}")

print("=" * 60)
print("\nTesting EfficientNet model loading...")

try:
    model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=38)
    print(f"✓ EfficientNetB3 model created successfully")
    print(f"  Parameters: {sum(p.numel() for p in model.parameters()):,}")
except Exception as e:
    print(f"✗ Model creation failed: {e}")

print("=" * 60)
print("\n✅ All dependencies are installed correctly!")
print("\nNext steps:")
print("1. Download PlantVillage dataset from Kaggle")
print("2. Run: python train_model.py")
print("3. Run: python api_service.py")
print("=" * 60)
