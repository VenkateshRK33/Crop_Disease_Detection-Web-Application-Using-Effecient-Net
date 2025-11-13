"""
Simple test to see if we can make predictions despite version mismatch
"""
import torch
import timm
import json
import cv2
import numpy as np

print("Loading class names...")
with open('class_names.json', 'r') as f:
    class_names = json.load(f)
print(f"✓ {len(class_names)} classes")

print("\nCreating model...")
model = timm.create_model('efficientnet_b3', pretrained=True, num_classes=len(class_names))
print("✓ Model created")

print("\nModel is ready with pretrained ImageNet weights")
print("Note: This will use pretrained weights, not your trained weights")
print("But it will show the API works!")

# Test with an image
image_path = "0a3d19ca-a126-4ea3-83e3-0abb0e9b02e3___YLCV_GCREC 2449.JPG"
print(f"\nTesting with image: {image_path}")

img = cv2.imread(image_path)
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
img = cv2.resize(img, (224, 224))
img_tensor = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0
mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
img_tensor = (img_tensor - mean) / std
img_tensor = img_tensor.unsqueeze(0)

model.eval()
with torch.no_grad():
    output = model(img_tensor)
    probs = torch.nn.functional.softmax(output, dim=1)[0]
    top_prob, top_idx = torch.topk(probs, 5)
    
print("\nTop 5 predictions:")
for prob, idx in zip(top_prob, top_idx):
    print(f"  {class_names[idx]}: {prob.item()*100:.2f}%")

print("\n✓ Prediction works! The API will function.")
print("Note: These predictions use ImageNet pretrained weights, not your custom trained weights.")
print("To use your trained weights, we need to fix the version compatibility issue.")
