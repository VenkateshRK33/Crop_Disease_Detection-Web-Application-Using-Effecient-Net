# Requirements Document

## Introduction

This document outlines the requirements for an AI-powered chatbot system that provides farmers with detailed disease information and treatment solutions based on plant disease predictions from the ML model. The chatbot uses a locally-downloaded LLM (no API costs) and displays the information transfer process visually in the UI so farmers can see how their plant diagnosis is being analyzed.

## Glossary

- **Farmer_Chatbot**: An AI assistant that provides disease information and treatment recommendations to farmers
- **Local_LLM**: A locally-downloaded language model (like Llama, Mistral, or Phi) that runs without API calls
- **Disease_Context**: Information about the detected plant disease passed from the ML model to the chatbot
- **Streaming_Response**: Real-time text generation displayed character-by-character as the LLM generates it
- **Visual_Pipeline**: UI elements that show the data flow from image upload → ML prediction → LLM analysis → farmer advice
- **Treatment_Recommendation**: Actionable advice for farmers including organic solutions, chemical treatments, and prevention methods
- **Ollama**: A tool for running LLMs locally on your machine

## Requirements

### Requirement 1

**User Story:** As a farmer, I want to upload a plant image and see the entire analysis process visually, so that I understand how the AI is diagnosing my crop

#### Acceptance Criteria

1. WHEN a farmer uploads a plant image, THE Visual_Pipeline SHALL display a step indicator showing "Analyzing Image" with a progress animation
2. WHEN the ML model completes prediction, THE Visual_Pipeline SHALL display the detected disease name with confidence score and transition to "Consulting AI Expert" step
3. WHEN the Local_LLM begins generating advice, THE Visual_Pipeline SHALL display "AI Expert Analyzing" with a typing indicator
4. THE Visual_Pipeline SHALL show all three stages: Image Analysis → Disease Detection → Expert Consultation
5. WHILE each stage is processing, THE Visual_Pipeline SHALL display relevant icons and animations to indicate active processing

### Requirement 2

**User Story:** As a farmer, I want to receive detailed disease information and treatment solutions in simple language, so that I can take immediate action to save my crops

#### Acceptance Criteria

1. WHEN the Local_LLM receives disease context from the ML model, THE Farmer_Chatbot SHALL generate a response containing disease description, symptoms, causes, and treatment options
2. THE Farmer_Chatbot SHALL provide at least 3 treatment options: organic methods, chemical treatments, and preventive measures
3. THE Farmer_Chatbot SHALL use simple, farmer-friendly language avoiding technical jargon
4. THE Farmer_Chatbot SHALL structure responses with clear sections: What is this disease, How to treat it, How to prevent it
5. WHEN confidence is below 60%, THE Farmer_Chatbot SHALL acknowledge uncertainty and provide general plant health advice

### Requirement 3

**User Story:** As a farmer, I want to see the chatbot's response appear in real-time like a conversation, so that I know the system is actively working on my query

#### Acceptance Criteria

1. WHEN the Local_LLM generates text, THE Farmer_Chatbot SHALL display the Streaming_Response character-by-character or word-by-word
2. THE Streaming_Response SHALL appear at a natural reading pace (not too fast or slow)
3. WHILE streaming, THE Farmer_Chatbot SHALL display a cursor or typing indicator at the end of the text
4. THE Farmer_Chatbot SHALL complete the full response within 30 seconds for typical disease queries
5. IF streaming is interrupted, THEN THE Farmer_Chatbot SHALL display the partial response and an error message

### Requirement 4

**User Story:** As a developer, I want to use a locally-downloaded LLM that runs without API costs, so that the system is sustainable and works offline

#### Acceptance Criteria

1. THE Local_LLM SHALL be downloaded and run using Ollama or similar local inference tool
2. THE system SHALL support multiple LLM options: Llama 3.2 (3B), Mistral (7B), or Phi-3 (3.8B)
3. THE Local_LLM SHALL run on CPU with acceptable performance (response within 30 seconds)
4. THE system SHALL provide installation instructions for downloading the LLM model
5. THE Local_LLM SHALL not require internet connection after initial download

### Requirement 5

**User Story:** As a farmer, I want to ask follow-up questions about the disease, so that I can get clarification on treatment methods

#### Acceptance Criteria

1. WHEN a farmer types a follow-up question, THE Farmer_Chatbot SHALL maintain context of the previously detected disease
2. THE Farmer_Chatbot SHALL answer questions related to: treatment timing, dosage, alternative methods, cost estimates, and prevention
3. THE Farmer_Chatbot SHALL limit responses to disease and agriculture topics only
4. WHEN a question is off-topic, THE Farmer_Chatbot SHALL politely redirect to disease-related queries
5. THE Farmer_Chatbot SHALL maintain conversation history for the current session (up to 10 messages)

### Requirement 6

**User Story:** As a farmer, I want the chatbot interface to be simple and mobile-friendly, so that I can use it in the field on my phone

#### Acceptance Criteria

1. THE Farmer_Chatbot interface SHALL display in a chat-like layout with user messages on the right and bot messages on the left
2. THE interface SHALL be responsive and work on mobile screens (minimum 360px width)
3. THE interface SHALL include a text input field with a send button for follow-up questions
4. THE interface SHALL display the uploaded plant image thumbnail alongside the conversation
5. THE interface SHALL use large, readable fonts (minimum 16px) suitable for outdoor viewing

### Requirement 7

**User Story:** As a developer, I want the chatbot to receive structured disease information from the ML model, so that it can provide accurate and relevant advice

#### Acceptance Criteria

1. WHEN the ML model completes prediction, THE system SHALL create a Disease_Context object containing: disease name, confidence score, top 3 predictions, and crop type
2. THE Disease_Context SHALL be formatted as a prompt template for the Local_LLM
3. THE prompt template SHALL instruct the LLM to act as an agricultural expert providing farmer-friendly advice
4. THE prompt template SHALL include constraints: keep responses under 300 words, use simple language, focus on actionable solutions
5. THE system SHALL pass the Disease_Context to the Local_LLM via HTTP request to the Ollama API endpoint

### Requirement 8

**User Story:** As a farmer, I want to see example questions I can ask, so that I know what information the chatbot can provide

#### Acceptance Criteria

1. WHEN the chatbot first displays disease information, THE interface SHALL show 3-4 suggested follow-up questions as clickable buttons
2. THE suggested questions SHALL include: "How do I apply this treatment?", "What are organic alternatives?", "How can I prevent this in future?", "Is this disease contagious to other plants?"
3. WHEN a farmer clicks a suggested question, THE Farmer_Chatbot SHALL automatically send that question and generate a response
4. THE suggested questions SHALL be contextual based on the detected disease type
5. THE interface SHALL allow farmers to type custom questions in addition to suggested ones

### Requirement 9

**User Story:** As a developer, I want error handling for LLM failures, so that farmers always receive helpful information even if the AI is unavailable

#### Acceptance Criteria

1. IF the Local_LLM fails to respond within 45 seconds, THEN THE system SHALL display a timeout message with basic disease information from a fallback database
2. IF Ollama is not running, THEN THE system SHALL display an error message with instructions to start Ollama
3. THE system SHALL include a fallback knowledge base with basic information for the 16 supported diseases
4. WHEN the LLM is unavailable, THE system SHALL display the fallback information and suggest restarting the chatbot
5. THE system SHALL log all LLM errors for debugging purposes

### Requirement 10

**User Story:** As a farmer, I want to download or print the chatbot's advice, so that I can reference it later when treating my crops

#### Acceptance Criteria

1. THE Farmer_Chatbot interface SHALL include a "Download Advice" button that saves the conversation as a PDF or text file
2. THE downloaded file SHALL include: plant image, detected disease, confidence score, full chatbot advice, and timestamp
3. THE interface SHALL include a "Print" button that opens a printer-friendly version of the advice
4. THE downloaded/printed format SHALL be clean and readable without UI elements
5. THE filename SHALL include the disease name and date (e.g., "Tomato_Late_Blight_Advice_2025-11-13.pdf")
