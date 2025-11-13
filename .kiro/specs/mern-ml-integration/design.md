# Design Document

## Overview

This design outlines the integration architecture for connecting a Python FastAPI ML microservice with a MERN stack application without Docker. The solution uses a proxy pattern where the Node.js backend acts as an intermediary between the React frontend and Python ML service, providing a unified API surface while maintaining separation of concerns.

**Key Design Principles:**
- No Docker required - services run as separate processes on the same machine
- Node.js backend acts as API gateway and handles all business logic
- Python service focuses solely on ML inference
- Simple process management using npm scripts or PM2
- Proper error handling and graceful degradation

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Frontend (Port 3000)                   │  │
│  │  • Image upload component                                 │  │
│  │  • Results display                                        │  │
│  │  • Loading states & error handling                        │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP (axios/fetch)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Node.js Backend (Port 4000)                     │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Express Routes                                     │  │  │
│  │  │  • POST /api/predict                                │  │  │
│  │  │  • GET  /api/history                                │  │  │
│  │  │  • GET  /api/health                                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Middleware                                         │  │  │
│  │  │  • Multer (file upload)                             │  │  │
│  │  │  • CORS                                             │  │  │
│  │  │  • Error handling                                   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Services                                           │  │  │
│  │  │  • ML Service Client (axios)                        │  │  │
│  │  │  • File cleanup service                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────┘
