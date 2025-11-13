# 🗄️ MongoDB + Mongoose Setup Guide

## Overview
This guide will help you integrate MongoDB database with your Plant Disease AI Assistant using Mongoose ODM.

## What We'll Store in Database

1. **Users** - Farmer accounts
2. **Predictions** - Disease detection history
3. **Conversations** - Chatbot conversations
4. **Images** - Uploaded plant images (references)

## 📋 Prerequisites

- ✅ Node.js installed
- ✅ MongoDB Compass installed (you have this!)
- ⬜ MongoDB connection string

## Step-by-Step Setup

### Step 1: Install Mongoose

```bash
npm install mongoose
```

### Step 2: Get MongoDB Connection String

#### Option A: MongoDB Compass (Local)
```
mongodb://localhost:27017/plant-disease-db
```

#### Option B: MongoDB Atlas (Cloud - Free)
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create free cluster
4. Get connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/plant-disease-db
```

### Step 3: Add to .env File

Add this line to your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/plant-disease-db
```

Or for Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/plant-disease-db
```

## 🎯 What Each Step Does

### Step 1: Install Mongoose
- **What**: Mongoose is an ODM (Object Data Modeling) library
- **Why**: Makes working with MongoDB easier
- **How**: Provides schemas, validation, and query helpers

### Step 2: Get Connection String
- **What**: URL to connect to your MongoDB database
- **Why**: Tells your app where the database is
- **How**: Local (Compass) or Cloud (Atlas)

### Step 3: Add to .env
- **What**: Store connection string securely
- **Why**: Don't hardcode sensitive data
- **How**: Environment variables

## 📊 Database Schema Design

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  location: String,
  createdAt: Date
}
```

### Predictions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  imagePath: String,
  disease: String,
  confidence: Number,
  topPredictions: Array,
  timestamp: Date
}
```

### Conversations Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  predictionId: ObjectId (ref: Prediction),
  messages: [{
    role: String (user/assistant),
    content: String,
    timestamp: Date
  }],
  createdAt: Date,
  lastActivity: Date
}
```

## 🚀 Next Steps

After setup:
1. Create database connection file
2. Create Mongoose models
3. Update chatbot server to use database
4. Test database operations

Continue to: `DATABASE-INTEGRATION.md`

---
**Status**: Setup Instructions
**Next**: Database Integration
