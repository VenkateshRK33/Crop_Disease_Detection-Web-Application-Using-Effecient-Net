"""
Download PlantVillage Dataset using kagglehub
"""

import kagglehub

print("Downloading PlantVillage dataset from Kaggle...")
print("This may take a few minutes...")

# Download the PlantVillage dataset
path = kagglehub.dataset_download("emmarex/plantdisease")

print(f"\n✓ Dataset downloaded successfully!")
print(f"Path: {path}")
print(f"\nYou can now train the model using this path.")
print(f"Update train_model.py CONFIG['dataset_path'] to: {path}")
