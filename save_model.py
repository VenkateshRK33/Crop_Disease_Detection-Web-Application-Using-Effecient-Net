import torch
from efficientnet_pytorch import EfficientNet  # only if you're using EfficientNet
# import your model definition properly if it's in another file

# Example: Recreate your model structure
model = EfficientNet.from_name('efficientnet-b0', num_classes=15)

# Load your trained weights if model is already trained in memory, skip this line.
# model.load_state_dict(torch.load('path_to_trained_weights.pth'))

# Save model weights
torch.save(model.state_dict(), "efficientnet_plant_disease.pth")

print("✅ Model saved successfully!")
