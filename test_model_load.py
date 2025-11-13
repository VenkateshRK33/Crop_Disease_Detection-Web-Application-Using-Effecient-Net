import torch
import timm
import json
import joblib

print("Testing model loading...")

# Load class names
with open('class_names.json', 'r') as f:
    class_names = json.load(f)
print(f"✓ Loaded {len(class_names)} classes")

# Create model
model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=len(class_names))
print(f"✓ Created model")

# Load weights
model.load_state_dict(torch.load('efficientnet_plant_disease.pth', map_location='cpu'))
print(f"✓ Loaded weights")

# Load label encoder
label_encoder = joblib.load('label_encoder.pkl')
print(f"✓ Loaded label encoder")

print("\nAll components loaded successfully!")
print(f"Model: {type(model)}")
print(f"Label encoder: {type(label_encoder)}")
print(f"Classes: {class_names[:3]}...")
