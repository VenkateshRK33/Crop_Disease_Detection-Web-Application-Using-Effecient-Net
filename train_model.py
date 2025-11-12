"""
EfficientNet Training Script for Plant Disease Detection using PyTorch
Dataset: PlantVillage (https://www.kaggle.com/datasets/emmarex/plantdisease)
"""

import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import timm
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import json
from pathlib import Path
import cv2
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

# Configuration
CONFIG = {
    'dataset_path': r'C:\Users\11one\.cache\kagglehub\datasets\emmarex\plantdisease\versions\1\PlantVillage',  # Kaggle downloaded dataset
    'image_size': (224, 224),
    'batch_size': 32,
    'epochs': 50,
    'learning_rate': 0.001,
    'validation_split': 0.2,
    'test_split': 0.1,
    'model_save_path': 'efficientnet_plant_disease.pth',
    'label_encoder_path': 'label_encoder.pkl',
    'class_names_path': 'class_names.json',
    'random_seed': 42,
    'num_workers': 0,  # Set to 0 for Windows compatibility
    'device': 'cuda' if torch.cuda.is_available() else 'cpu'
}

# Set random seeds
np.random.seed(CONFIG['random_seed'])
torch.manual_seed(CONFIG['random_seed'])
if torch.cuda.is_available():
    torch.cuda.manual_seed(CONFIG['random_seed'])

class PlantDiseaseDataset(Dataset):
    """Custom Dataset for Plant Disease Images"""
    def __init__(self, images, labels, transform=None):
        self.images = images
        self.labels = labels
        self.transform = transform
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        image = self.images[idx]
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
        else:
            # Convert to tensor and normalize
            image = torch.from_numpy(image).permute(2, 0, 1).float() / 255.0
            # Normalize with ImageNet stats
            mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
            std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
            image = (image - mean) / std
        
        return image, label

def load_dataset(dataset_path):
    """Load images and labels from dataset directory"""
    print("Loading dataset...")
    images = []
    labels = []
    
    dataset_dir = Path(dataset_path)
    if not dataset_dir.exists():
        raise FileNotFoundError(f"Dataset directory not found: {dataset_path}")
    
    class_names = sorted([d.name for d in dataset_dir.iterdir() if d.is_dir()])
    
    for class_name in tqdm(class_names, desc="Loading classes"):
        class_dir = dataset_dir / class_name
        for img_path in class_dir.glob('*'):
            if img_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                try:
                    img = cv2.imread(str(img_path))
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    img = cv2.resize(img, CONFIG['image_size'])
                    images.append(img)
                    labels.append(class_name)
                except Exception as e:
                    print(f"Error loading {img_path}: {e}")
    
    print(f"Loaded {len(images)} images from {len(class_names)} classes")
    return np.array(images), np.array(labels), class_names

def preprocess_data(images, labels, class_names):
    """Preprocess images and encode labels"""
    print("Preprocessing data...")
    
    # Encode labels
    label_encoder = LabelEncoder()
    labels_encoded = label_encoder.fit_transform(labels)
    
    # Save label encoder and class names
    joblib.dump(label_encoder, CONFIG['label_encoder_path'])
    with open(CONFIG['class_names_path'], 'w') as f:
        json.dump(class_names, f, indent=2)
    
    print(f"Classes: {len(class_names)}")
    return images, labels_encoded, label_encoder

def create_data_splits(images, labels):
    """Split data into train, validation, and test sets"""
    print("Creating data splits...")
    
    # First split: separate test set
    X_temp, X_test, y_temp, y_test = train_test_split(
        images, labels, 
        test_size=CONFIG['test_split'], 
        random_state=CONFIG['random_seed'],
        stratify=labels
    )
    
    # Second split: separate train and validation
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp,
        test_size=CONFIG['validation_split']/(1-CONFIG['test_split']),
        random_state=CONFIG['random_seed'],
        stratify=y_temp
    )
    
    print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
    return X_train, X_val, X_test, y_train, y_val, y_test

def create_model(num_classes):
    """Create EfficientNet model using timm"""
    print("Building EfficientNetB3 model...")
    
    # Load pre-trained EfficientNetB3
    model = timm.create_model('efficientnet_b3', pretrained=True, num_classes=num_classes)
    
    return model

def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    pbar = tqdm(dataloader, desc='Training')
    for images, labels in pbar:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
        
        pbar.set_postfix({'loss': running_loss/len(dataloader), 'acc': 100.*correct/total})
    
    epoch_loss = running_loss / len(dataloader)
    epoch_acc = 100. * correct / total
    return epoch_loss, epoch_acc

def validate(model, dataloader, criterion, device):
    """Validate the model"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in tqdm(dataloader, desc='Validation'):
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    
    epoch_loss = running_loss / len(dataloader)
    epoch_acc = 100. * correct / total
    return epoch_loss, epoch_acc

def plot_training_history(history):
    """Plot training history"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    # Accuracy
    ax1.plot(history['train_acc'], label='Train')
    ax1.plot(history['val_acc'], label='Validation')
    ax1.set_title('Model Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy (%)')
    ax1.legend()
    ax1.grid(True)
    
    # Loss
    ax2.plot(history['train_loss'], label='Train')
    ax2.plot(history['val_loss'], label='Validation')
    ax2.set_title('Model Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
    print("Training history saved to 'training_history.png'")

def evaluate_model(model, dataloader, label_encoder, device):
    """Evaluate model on test set"""
    print("\nEvaluating model on test set...")
    
    model.eval()
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for images, labels in tqdm(dataloader, desc='Testing'):
            images = images.to(device)
            outputs = model(images)
            _, predicted = outputs.max(1)
            
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.numpy())
    
    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    
    # Classification report
    class_names = label_encoder.classes_
    report = classification_report(all_labels, all_preds, target_names=class_names, digits=4)
    print("\nClassification Report:")
    print(report)
    
    # Save report
    with open('classification_report.txt', 'w') as f:
        f.write(report)
    
    # Confusion matrix
    cm = confusion_matrix(all_labels, all_preds)
    
    # Plot confusion matrix
    plt.figure(figsize=(20, 18))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.xticks(rotation=90)
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    print("Confusion matrix saved to 'confusion_matrix.png'")
    
    # Calculate metrics
    test_acc = accuracy_score(all_labels, all_preds)
    test_precision = precision_score(all_labels, all_preds, average='weighted')
    test_recall = recall_score(all_labels, all_preds, average='weighted')
    test_f1 = f1_score(all_labels, all_preds, average='weighted')
    
    metrics = {
        'test_accuracy': float(test_acc),
        'test_precision': float(test_precision),
        'test_recall': float(test_recall),
        'test_f1_score': float(test_f1)
    }
    
    print("\nTest Metrics:")
    for key, value in metrics.items():
        print(f"{key}: {value:.4f}")
    
    # Save metrics
    with open('test_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    
    return metrics

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("EfficientNet Plant Disease Detection - Training Pipeline")
    print("=" * 60)
    
    # Check device
    device = torch.device(CONFIG['device'])
    print(f"\nUsing device: {device}")
    
    # Load dataset
    images, labels, class_names = load_dataset(CONFIG['dataset_path'])
    
    # Preprocess
    images, labels_encoded, label_encoder = preprocess_data(images, labels, class_names)
    
    # Create splits
    X_train, X_val, X_test, y_train, y_val, y_test = create_data_splits(images, labels_encoded)
    
    # Create datasets
    train_dataset = PlantDiseaseDataset(X_train, y_train)
    val_dataset = PlantDiseaseDataset(X_val, y_val)
    test_dataset = PlantDiseaseDataset(X_test, y_test)
    
    # Create dataloaders
    train_loader = DataLoader(train_dataset, batch_size=CONFIG['batch_size'], 
                             shuffle=True, num_workers=CONFIG['num_workers'])
    val_loader = DataLoader(val_dataset, batch_size=CONFIG['batch_size'], 
                           shuffle=False, num_workers=CONFIG['num_workers'])
    test_loader = DataLoader(test_dataset, batch_size=CONFIG['batch_size'], 
                            shuffle=False, num_workers=CONFIG['num_workers'])
    
    # Create model
    model = create_model(num_classes=len(class_names))
    model = model.to(device)
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=CONFIG['learning_rate'])
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', 
                                                     factor=0.5, patience=5)
    
    # Training loop
    print("\n" + "=" * 60)
    print("Starting Training")
    print("=" * 60)
    
    history = {
        'train_loss': [],
        'train_acc': [],
        'val_loss': [],
        'val_acc': []
    }
    
    best_val_acc = 0.0
    
    for epoch in range(CONFIG['epochs']):
        print(f"\nEpoch {epoch+1}/{CONFIG['epochs']}")
        
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        
        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        # Update scheduler
        scheduler.step(val_loss)
        
        # Save history
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'num_classes': len(class_names)
            }, CONFIG['model_save_path'])
            print(f"✓ Best model saved! Val Acc: {val_acc:.2f}%")
    
    # Plot training history
    plot_training_history(history)
    
    # Load best model and evaluate
    print("\n" + "=" * 60)
    print("Loading best model for evaluation")
    print("=" * 60)
    
    checkpoint = torch.load(CONFIG['model_save_path'])
    model.load_state_dict(checkpoint['model_state_dict'])
    
    metrics = evaluate_model(model, test_loader, label_encoder, device)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    print(f"Model saved to: {CONFIG['model_save_path']}")
    print(f"Label encoder saved to: {CONFIG['label_encoder_path']}")
    print(f"Class names saved to: {CONFIG['class_names_path']}")
    print(f"Test Accuracy: {metrics['test_accuracy']:.4f}")
    print("=" * 60)

if __name__ == "__main__":
    main()
