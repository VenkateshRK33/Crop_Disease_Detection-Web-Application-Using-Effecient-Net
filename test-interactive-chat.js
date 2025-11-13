/**
 * Test interactive conversation with follow-up questions
 */

const axios = require('axios');

async function testInteractiveChat() {
    console.log('='.repeat(60));
    console.log('Testing Interactive Chatbot Conversation');
    console.log('='.repeat(60));
    console.log();

    // Step 1: Create conversation
    console.log('Step 1: Creating conversation with disease context...');
    const mockPrediction = {
        prediction: 'Tomato_Late_blight',
        confidence: 0.95,
        all_predictions: [
            { class: 'Tomato_Late_blight', confidence: 0.95 },
            { class: 'Tomato_Early_blight', confidence: 0.03 }
        ]
    };

    const createResponse = await axios.post('http://localhost:4000/api/analyze-plant', mockPrediction);
    const conversationId = createResponse.data.conversationId;
    console.log(`✓ Conversation created: ${conversationId}`);
    console.log();

    // Step 2: Get initial advice
    console.log('Step 2: Getting initial AI advice...');
    console.log('-'.repeat(60));
    await streamResponse(conversationId, null);
    console.log();

    // Step 3: Ask follow-up question 1
    console.log('Step 3: Asking follow-up question: "How do I apply copper fungicide?"');
    console.log('-'.repeat(60));
    await streamResponse(conversationId, 'How do I apply copper fungicide?');
    console.log();

    // Step 4: Ask follow-up question 2
    console.log('Step 4: Asking follow-up question: "What are organic alternatives?"');
    console.log('-'.repeat(60));
    await streamResponse(conversationId, 'What are organic alternatives?');
    console.log();

    // Step 5: Ask follow-up question 3
    console.log('Step 5: Asking follow-up question: "How long until I see results?"');
    console.log('-'.repeat(60));
    await streamResponse(conversationId, 'How long until I see results?');
    console.log();

    console.log('='.repeat(60));
    console.log('✓ Interactive conversation test complete!');
    console.log('='.repeat(60));
}

async function streamResponse(conversationId, question) {
    return new Promise((resolve, reject) => {
        const url = question 
            ? `http://localhost:4000/api/chat/stream/${conversationId}?question=${encodeURIComponent(question)}`
            : `http://localhost:4000/api/chat/stream/${conversationId}`;

        axios.get(url, {
            responseType: 'stream',
            timeout: 60000
        }).then(response => {
            let fullText = '';

            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.chunk) {
                                process.stdout.write(data.chunk);
                                fullText += data.chunk;
                            }
                            if (data.done) {
                                console.log();
                                console.log('-'.repeat(60));
                                resolve(fullText);
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            });

            response.data.on('error', reject);
        }).catch(reject);
    });
}

// Run test
testInteractiveChat().catch(console.error);
