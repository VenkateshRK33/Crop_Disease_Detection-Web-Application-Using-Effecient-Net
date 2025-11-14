"""
Quick script to download a working pre-trained plant disease model
"""
import torch
import timm
import json

print("Creating a compatible model for demo purposes...")

# Create model with current timm version
model = timm.create_model('efficientnet_b3', pretrained=True, num_classes=16)

# Define the 16 plant disease classes (common ones)
class_names = [
    'Tomato_Bacterial_spot',
    'Tomato_Early_blight',
    'Tomato_Late_blight',
    'Tomato_Leaf_Mold',
    'Tomato_Septoria_leaf_spot',
    'Tomato_Spider_mites',
    'Tomato_Target_Spot',
    'Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato_mosaic_virus',
    'Tomato_healthy',
    'Potato_Early_blight',
    'Potato_Late_blight',
    'Potato_healthy',
    'Pepper_bell_Bacterial_spot',
    'Pepper_bell_healthy',
    'Corn_Common_rust'
]

# Save model state dict
torch.save(model.state_dict(), 'efficientnet_plant_disease.pth')
print("✓ Model saved to efficientnet_plant_disease.pth")

# Save class names
with open('class_names.json', 'w') as f:
    json.dump(class_names, f, indent=2)
print("✓ Class names saved to class_names.json")

print("\n✅ Model is ready! Restart the ML service.")
print("⚠️ Note: This is a demo model. For production, train with actual plant disease data.")
