"""
Fix EfficientNet model weights to work with newer timm versions
"""
import torch
import timm
import json

print("Loading old model weights...")
old_weights = torch.load('efficientnet_plant_disease.pth', map_location='cpu')

# Load class names to get num_classes
with open('class_names.json', 'r') as f:
    class_names = json.load(f)
num_classes = len(class_names)

print(f"Creating new model with {num_classes} classes...")
model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=num_classes)

# Create mapping from old names to new names
new_weights = {}
for old_key in old_weights.keys():
    # Remove leading underscore from layer names
    new_key = old_key.replace('_', '', 1) if old_key.startswith('_') else old_key
    # Handle specific mappings
    new_key = new_key.replace('_blocks.', 'blocks.')
    new_key = new_key.replace('_conv_stem', 'conv_stem')
    new_key = new_key.replace('_bn0', 'bn1')
    new_key = new_key.replace('_bn1', 'bn2')
    new_key = new_key.replace('_bn2', 'bn3')
    new_key = new_key.replace('_conv_head', 'conv_head')
    new_key = new_key.replace('_fc', 'classifier')
    new_key = new_key.replace('_depthwise_conv', 'conv_dw')
    new_key = new_key.replace('_expand_conv', 'conv_pw')
    new_key = new_key.replace('_project_conv', 'conv_pwl')
    new_key = new_key.replace('_se_reduce', 'se.conv_reduce')
    new_key = new_key.replace('_se_expand', 'se.conv_expand')
    
    new_weights[new_key] = old_weights[old_key]

print("Loading weights into new model...")
missing, unexpected = model.load_state_dict(new_weights, strict=False)

if missing:
    print(f"Missing keys: {len(missing)}")
    print(missing[:5])
if unexpected:
    print(f"Unexpected keys: {len(unexpected)}")
    print(unexpected[:5])

# Save the fixed model
print("Saving fixed model...")
torch.save({
    'model_state_dict': model.state_dict(),
    'num_classes': num_classes,
    'class_names': class_names
}, 'efficientnet_plant_disease_fixed.pth')

print("✓ Model fixed and saved as 'efficientnet_plant_disease_fixed.pth'")
