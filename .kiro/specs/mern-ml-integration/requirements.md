# Requirements Document

## Introduction

This document outlines the requirements for integrating a Python-based ML microservice (FastAPI + EfficientNet) with a MERN stack application for early detection of crop pests and diseases. The integration must work without Docker, enabling seamless communication between the Node.js backend, React frontend, and Python ML service for real-time plant disease predictions.

## Glossary

- **ML_Service**: The Python FastAPI microservice running on port 5000 that provides plant disease prediction endpoints
- **Node_Backend**: The Express.js server that handles business logic, authentication, and database operations
- **React_Frontend**: The client-side application that provides the user interface for image uploads and result display
- **Prediction_Request**: An HTTP request containing a plant image file sent to the ML service for disease classification
- **CORS**: Cross-Origin Resource Sharing mechanism that allows the frontend to communicate with different backend services
- **Process_Manager**: A tool (like PM2 or Windows Service) that keeps both Node.js and Python services running continuously

## Requirements

### Requirement 1

**User Story:** As a farmer, I want to upload a plant image through the web interface and receive instant disease predictions, so that I can take quick action to protect my crops

#### Acceptance Criteria

1. WHEN a user uploads an image file through the React interface, THE React_Frontend SHALL send the image to the Node_Backend via multipart form data
2. WHEN the Node_Backend receives an image upload request, THE Node_Backend SHALL forward the image to the ML_Service on port 5000
3. WHEN the ML_Service processes the image, THE ML_Service SHALL return a JSON response containing the disease prediction, confidence score, and top 5 alternative predictions within 2 seconds
4. WHEN the prediction response is received, THE React_Frontend SHALL display the primary disease name, confidence percentage, and alternative predictions in a user-friendly format
5. IF the ML_Service is unavailable, THEN THE Node_Backend SHALL return an error response with status code 503 and message "ML service unavailable"

### Requirement 2

**User Story:** As a developer, I want both the Node.js backend and Python ML service to run simultaneously on the same machine without Docker, so that I can deploy the application easily in the hackathon environment

#### Acceptance Criteria

1. THE Node_Backend SHALL run on port 4000 and remain accessible for HTTP requests
2. THE ML_Service SHALL run on port 5000 and remain accessible for HTTP requests
3. WHEN either service starts, THE service SHALL log its startup status and port number to the console
4. THE Node_Backend SHALL verify ML_Service availability by calling the /health endpoint on startup
5. WHERE a Process_Manager is configured, THE Process_Manager SHALL automatically restart either service if it crashes

### Requirement 3

**User Story:** As a system administrator, I want to store prediction history in MongoDB, so that I can track usage patterns and model performance over time

#### Acceptance Criteria

1. WHEN a prediction is successfully completed, THE Node_Backend SHALL save the prediction result to MongoDB with fields: userId, imagePath, prediction, confidence, timestamp, and allPredictions
2. THE Node_Backend SHALL create a Mongoose schema for the Prediction model with appropriate data types and validation
3. WHEN a user requests their prediction history, THE Node_Backend SHALL retrieve all predictions for that user sorted by timestamp in descending order
4. THE Node_Backend SHALL implement pagination for prediction history with a default limit of 20 results per page
5. IF database save fails, THEN THE Node_Backend SHALL still return the prediction result to the user but log the database error

### Requirement 4

**User Story:** As a frontend developer, I want proper error handling and loading states, so that users have a smooth experience even when issues occur

#### Acceptance Criteria

1. WHILE an image is being processed, THE React_Frontend SHALL display a loading indicator with the message "Analyzing plant image..."
2. WHEN the ML_Service returns a low confidence prediction (below 50%), THE React_Frontend SHALL display a warning message "Low confidence - consider retaking the image with better lighting"
3. IF the image upload fails due to network error, THEN THE React_Frontend SHALL display an error message and provide a retry button
4. WHEN an invalid file type is uploaded, THE React_Frontend SHALL validate the file extension and display an error message before sending the request
5. THE React_Frontend SHALL implement a timeout of 30 seconds for prediction requests and display a timeout error if exceeded

### Requirement 5

**User Story:** As a developer, I want proper CORS configuration between all services, so that the frontend can communicate with both backends without security issues

#### Acceptance Criteria

1. THE ML_Service SHALL configure CORS middleware to accept requests from the Node_Backend origin (http://localhost:4000)
2. THE Node_Backend SHALL configure CORS middleware to accept requests from the React_Frontend origin (http://localhost:3000)
3. THE ML_Service SHALL include the Access-Control-Allow-Origin header in all responses
4. THE Node_Backend SHALL act as a proxy between React_Frontend and ML_Service to avoid direct cross-origin requests
5. WHERE the application is deployed to production, THE CORS configuration SHALL be updated to use the production domain URLs instead of localhost

### Requirement 6

**User Story:** As a developer, I want to implement file upload handling with proper validation and cleanup, so that the system remains secure and doesn't accumulate unnecessary files

#### Acceptance Criteria

1. THE Node_Backend SHALL use multer middleware to handle multipart file uploads with a maximum file size of 10MB
2. WHEN a file is uploaded, THE Node_Backend SHALL validate that the file extension is one of: jpg, jpeg, png, or webp
3. THE Node_Backend SHALL store uploaded files temporarily in an "uploads" directory with unique filenames
4. WHEN a prediction request is completed, THE Node_Backend SHALL delete the temporary uploaded file from the uploads directory
5. IF file deletion fails, THEN THE Node_Backend SHALL log the error but not fail the request

### Requirement 7

**User Story:** As a hackathon participant, I want simple startup scripts for both services, so that judges and team members can easily run the application

#### Acceptance Criteria

1. THE project SHALL include a package.json script named "start:ml" that launches the Python ML_Service
2. THE project SHALL include a package.json script named "start:backend" that launches the Node_Backend
3. THE project SHALL include a package.json script named "dev" that launches both services concurrently
4. WHEN the "dev" script is executed, THE system SHALL start both Node_Backend and ML_Service and display logs from both in the same terminal
5. THE project SHALL include a README section with clear instructions for installing Python dependencies and Node.js dependencies separately
