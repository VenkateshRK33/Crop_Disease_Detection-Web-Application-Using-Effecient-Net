# Implementation Plan

- [ ] 1. Set up Ollama and download LLM model
  - Install Ollama on the system
  - Download Llama 3.2 3B model using `ollama pull llama3.2:3b`
  - Verify Ollama is running on port 11434
  - Test basic generation with curl command
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 2. Create chatbot backend service (Node.js)
- [ ] 2.1 Set up Express server with required dependencies
  - Initialize Node.js project with package.json
  - Install dependencies: express, cors, axios, dotenv
  - Create chatbot-server.js with basic Express setup
  - Configure CORS to allow requests from demo page
  - Set up environment variables for Ollama URL and model name
  - _Requirements: 7.5_

- [ ] 2.2 Implement Ollama client for LLM communication
  - Create OllamaClient class with streaming support
  - Implement streamGenerate method using fetch API
  - Add checkHealth method to verify Ollama availability
  - Handle JSON parsing of streamed responses
  - Add error handling for connection failures
  - _Requirements: 4.1, 4.3, 9.2_

- [ ] 2.3 Create disease context builder and prompt templates
  - Implement buildPrompt function that formats disease information
  - Create prompt template with agricultural expert persona
  - Include disease name, confidence, and crop type in context
  - Add instructions for simple language and actionable advice
  - Limit response length to 300 words in prompt
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 2.2, 2.3, 2.4_

- [ ] 2.4 Implement conversation history management
  - Create in-memory Map to store conversations by ID
  - Store disease context and message history per conversation
  - Implement conversation timeout (30 minutes)
  - Add method to retrieve conversation by ID
  - Limit history to last 10 messages per conversation
  - _Requirements: 5.2, 5.5_

- [ ] 2.5 Create fallback knowledge base for offline mode
  - Define fallback knowledge structure for 16 diseases
  - Populate basic information: description, treatments, prevention
  - Implement getAdvice method to retrieve fallback data
  - Format fallback responses to match LLM output style
  - _Requirements: 9.1, 9.3, 9.4_

- [ ] 2.6 Implement API routes for chatbot functionality
  - Create POST /api/analyze-plant route
  - Forward image to ML API and get prediction
  - Build disease context from ML response
  - Initialize conversation and generate first advice
  - Create POST /api/chat route for follow-up questions
  - Implement Server-Sent Events for streaming responses
  - Add error handling for ML API and Ollama failures
  - _Requirements: 1.2, 3.1, 3.2, 3.3, 3.4, 5.1, 9.1, 9.2_

- [ ] 3. Create temporary demo page (HTML/CSS/JS)
- [ ] 3.1 Build HTML structure with all UI sections
  - Create demo.html with semantic HTML structure
  - Add header with title and description
  - Create image upload section with file input
  - Build visual pipeline section with 3 steps
  - Add results section with disease card and chatbot interface
  - Include suggested questions area and text input
  - _Requirements: 1.1, 1.4, 6.1, 6.3_

- [ ] 3.2 Style the demo page with CSS
  - Create mobile-first responsive CSS
  - Style upload section with drag-drop visual cues
  - Design visual pipeline with step indicators and animations
  - Style disease card with image and info layout
  - Create chat message bubbles (user right, bot left)
  - Add streaming text cursor animation
  - Ensure minimum 16px font size for readability
  - Test on mobile viewport (360px width)
  - _Requirements: 1.5, 6.2, 6.4, 6.5_

- [ ] 3.3 Implement image upload and preview functionality
  - Add event listener for file input change
  - Validate file type (jpg, jpeg, png)
  - Create image preview with thumbnail
  - Display file name and size
  - Add clear/reset button
  - _Requirements: 1.1_

- [ ] 3.4 Implement visual pipeline state management
  - Create updatePipeline function to change step states
  - Add CSS classes for pending, active, complete states
  - Implement step animations (pulse for active, checkmark for complete)
  - Show appropriate icons for each step
  - Display status messages under each step
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3.5 Implement ML API integration
  - Create analyzeImage function to call ML API
  - Build FormData with uploaded image
  - Send POST request to http://localhost:5000/predict
  - Handle response with disease prediction
  - Update pipeline to show "Disease Detected" step
  - Display disease card with results
  - Handle errors and show user-friendly messages
  - _Requirements: 1.2, 2.5_

- [ ] 3.6 Implement chatbot streaming interface
  - Create sendToChatbot function to call Node.js API
  - Use EventSource for Server-Sent Events
  - Implement streaming text display character-by-character
  - Add typing cursor animation during streaming
  - Handle stream completion and errors
  - Display bot messages in chat interface
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.7 Implement suggested questions functionality
  - Generate contextual suggested questions based on disease
  - Create clickable buttons for each suggestion
  - Handle button clicks to auto-send questions
  - Update suggested questions after each response
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 3.8 Implement follow-up question input
  - Add event listener for text input and send button
  - Validate user input (not empty, max length)
  - Send follow-up questions to chatbot API
  - Maintain conversation context with conversation ID
  - Display user messages in chat interface
  - Clear input field after sending
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4. Add download and print functionality
  - Create downloadAdvice function to generate PDF/text file
  - Include plant image, disease info, and full conversation
  - Format filename with disease name and date
  - Implement print function with printer-friendly CSS
  - Add download and print buttons to UI
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 5. Create installation and setup documentation
  - Write README with system requirements
  - Document Ollama installation steps for Windows
  - Provide commands to download and run LLM model
  - Explain how to start ML API server
  - Explain how to start chatbot Node.js server
  - Provide instructions to open demo.html in browser
  - Add troubleshooting section for common issues
  - _Requirements: 4.4_

- [ ] 6. Test complete integration
  - Test image upload with various plant images
  - Verify ML model predictions are accurate
  - Test chatbot generates relevant advice
  - Verify streaming text appears smoothly
  - Test suggested questions work correctly
  - Test follow-up questions maintain context
  - Test error handling when Ollama is offline
  - Test fallback knowledge base activation
  - Verify mobile responsiveness on phone
  - Test download and print functionality
  - _Requirements: All_
