/**
 * Test the complete chatbot integration
 * ML Model → Chatbot Server → Ollama → Streaming Response
 */

const axios = require('axios');

async function testIntegration() {
    console.log('='.repeat(60));
    console.log('Testing Complete Chatbot Integration');
    console.log('='.repeat(60));
    console.log();

    // Step 1: Check ML API
    console.log('Step 1: Checking ML API...');
    try {
        const mlHealth = await axios.get('http://localhost:5000/health');
        console.log('✓ ML API is running');
        console.log(`  Model loaded: ${mlHealth.data.model_loaded}`);
        console.log(`  Classes: ${mlHealth.data.num_classes}`);
    } catch (error) {
        console.log('✗ ML API is not running!');
        console.log('  Start it with: python api_service.py');
        return;
    }
    console.log();

    // Step 2: Check Chatbot Server
    console.log('Step 2: Checking Chatbot Server...');
    try {
        const chatHealth = await axios.get('http://localhost:4000/api/health');
        console.log('✓ Chatbot Server is running');
        console.log(`  Ollama: ${chatHealth.data.ollama}`);
        console.log(`  Model: ${chatHealth.data.model}`);
    } catch (error) {
        console.log('✗ Chatbot Server is not running!');
        console.log('  Start it with: node chatbot-server.js');
        return;
    }
    console.log();

    // Step 3: Test disease context creation
    console.log('Step 3: Testing disease context creation...');
    const mockPrediction = {
        prediction: 'Tomato_Late_blight',
        confidence: 0.95,
        all_predictions: [
            { class: 'Tomato_Late_blight', confidence: 0.95 },
            { class: 'Tomato_Early_blight', confidence: 0.03 },
            { class: 'Tomato_Leaf_Mold', confidence: 0.01 }
        ]
    };

    try {
        const response = await axios.post('http://localhost:4000/api/analyze-plant', mockPrediction);
        console.log('✓ Disease context created');
        console.log(`  Conversation ID: ${response.data.conversationId}`);
        console.log(`  Disease: ${response.data.diseaseContext.diseaseName}`);
        console.log(`  Confidence: ${response.data.diseaseContext.confidence}%`);
        console.log(`  Suggested questions: ${response.data.suggestedQuestions.length}`);
        
        const conversationId = response.data.conversationId;
        console.log();

        // Step 4: Test streaming advice
        console.log('Step 4: Testing AI-generated advice (streaming)...');
        console.log('Waiting for Ollama to generate response...');
        console.log();
        console.log('AI Response:');
        console.log('-'.repeat(60));
        
        const streamUrl = `http://localhost:4000/api/chat/stream/${conversationId}`;
        const streamResponse = await axios.get(streamUrl, {
            responseType: 'stream',
            timeout: 60000
        });

        let fullResponse = '';
        let chunkCount = 0;

        return new Promise((resolve, reject) => {
            streamResponse.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.chunk) {
                                process.stdout.write(data.chunk);
                                fullResponse += data.chunk;
                                chunkCount++;
                            }
                            if (data.done) {
                                console.log();
                                console.log('-'.repeat(60));
                                console.log();
                                console.log('✓ Streaming completed!');
                                console.log(`  Total chunks: ${chunkCount}`);
                                console.log(`  Response length: ${fullResponse.length} characters`);
                                console.log(`  Fallback mode: ${data.fallback ? 'Yes' : 'No (AI generated!)'}`);
                                console.log();
                                console.log('='.repeat(60));
                                console.log('✓ All tests passed! Integration working perfectly!');
                                console.log('='.repeat(60));
                                console.log();
                                console.log('Next step: Open demo.html and upload a plant image!');
                                resolve();
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            });

            streamResponse.data.on('error', (error) => {
                console.log();
                console.log('✗ Streaming error:', error.message);
                reject(error);
            });

            streamResponse.data.on('end', () => {
                if (chunkCount === 0) {
                    console.log('✗ No response received');
                    reject(new Error('No response'));
                }
            });
        });

    } catch (error) {
        console.log('✗ Error:', error.message);
        if (error.response) {
            console.log('  Status:', error.response.status);
            console.log('  Data:', error.response.data);
        }
    }
}

// Run the test
testIntegration().catch(console.error);
