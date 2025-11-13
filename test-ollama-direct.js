/**
 * Test Ollama directly to see if it generates responses
 */

const axios = require('axios');

async function testOllama() {
    console.log('Testing Ollama directly...');
    console.log();

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'minimax-m2:cloud',
            prompt: 'What is tomato late blight disease? Answer in 2 sentences.',
            stream: false
        }, {
            timeout: 30000
        });

        console.log('✓ Ollama responded!');
        console.log();
        console.log('Response:', response.data.response);
        console.log();
        console.log('Model:', response.data.model);
        console.log('Done:', response.data.done);

    } catch (error) {
        console.log('✗ Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testOllama();
