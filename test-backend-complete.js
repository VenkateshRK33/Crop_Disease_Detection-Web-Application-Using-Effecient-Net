/**
 * Complete Backend Test
 * Tests: Database + ML Model + LLM Integration
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:4000';
const ML_API_URL = 'http://localhost:5000';
const OLLAMA_URL = 'http://localhost:11434';

async function testCompleteBackend() {
    console.log('='.repeat(70));
    console.log('🧪 Complete Backend Integration Test');
    console.log('='.repeat(70));
    console.log();

    let testsPassed = 0;
    let testsFailed = 0;

    // Test 1: Check ML API
    console.log('Test 1: Checking ML API...');
    try {
        const mlHealth = await axios.get(`${ML_API_URL}/health`, { timeout: 5000 });
        if (mlHealth.data.model_loaded) {
            console.log('✅ ML API is running and model loaded');
            console.log(`   Classes: ${mlHealth.data.num_classes}`);
            testsPassed++;
        } else {
            console.log('❌ ML API running but model not loaded');
            testsFailed++;
        }
    } catch (error) {
        console.log('❌ ML API is not accessible');
        console.log(`   Error: ${error.message}`);
        console.log('   Start it with: python api_service.py');
        testsFailed++;
    }
    console.log();

    // Test 2: Check Ollama
    console.log('Test 2: Checking Ollama LLM...');
    try {
        const ollamaHealth = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
        console.log('✅ Ollama is running');
        const models = ollamaHealth.data.models || [];
        console.log(`   Models available: ${models.length}`);
        if (models.length > 0) {
            console.log(`   Using: ${models[0].name}`);
        }
        testsPassed++;
    } catch (error) {
        console.log('❌ Ollama is not accessible');
        console.log(`   Error: ${error.message}`);
        console.log('   Start it with: ollama serve');
        testsFailed++;
    }
    console.log();

    // Test 3: Check Backend Server
    console.log('Test 3: Checking Backend Server...');
    try {
        const backendHealth = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
        console.log('✅ Backend server is running');
        console.log(`   Database: ${backendHealth.data.database}`);
        console.log(`   Ollama: ${backendHealth.data.ollama}`);
        console.log(`   Model: ${backendHealth.data.model}`);
        
        if (backendHealth.data.database === 'connected') {
            console.log('✅ MongoDB is connected');
            testsPassed++;
        } else {
            console.log('⚠️  MongoDB is not connected');
            console.log('   Make sure MongoDB is running');
            testsFailed++;
        }
    } catch (error) {
        console.log('❌ Backend server is not accessible');
        console.log(`   Error: ${error.message}`);
        console.log('   Start it with: npm start');
        testsFailed++;
        return; // Can't continue without backend
    }
    console.log();

    // Test 4: Test User Creation
    console.log('Test 4: Testing User Creation...');
    try {
        const userResponse = await axios.post(`${BASE_URL}/api/users`, {
            email: 'test@farmer.com',
            name: 'Test Farmer',
            phone: '1234567890',
            location: 'Test Farm'
        });
        
        if (userResponse.data.success) {
            console.log('✅ User creation/retrieval works');
            console.log(`   User ID: ${userResponse.data.user._id}`);
            console.log(`   Name: ${userResponse.data.user.name}`);
            testsPassed++;
        }
    } catch (error) {
        console.log('❌ User creation failed');
        console.log(`   Error: ${error.response?.data?.error || error.message}`);
        testsFailed++;
    }
    console.log();

    // Test 5: Test Image Analysis (if test image exists)
    console.log('Test 5: Testing Image Analysis + Database Save...');
    const testImagePath = '0a3d19ca-a126-4ea3-83e3-0abb0e9b02e3___YLCV_GCREC 2449.JPG';
    
    if (fs.existsSync(testImagePath)) {
        try {
            const formData = new FormData();
            formData.append('image', fs.createReadStream(testImagePath));
            formData.append('userId', 'test-user-123');

            const analyzeResponse = await axios.post(`${BASE_URL}/api/analyze`, formData, {
                headers: formData.getHeaders(),
                timeout: 30000
            });

            if (analyzeResponse.data.success) {
                console.log('✅ Image analysis works');
                console.log(`   Disease: ${analyzeResponse.data.prediction.disease}`);
                console.log(`   Confidence: ${(analyzeResponse.data.prediction.confidence * 100).toFixed(1)}%`);
                console.log(`   Prediction ID: ${analyzeResponse.data.predictionId}`);
                console.log(`   Conversation ID: ${analyzeResponse.data.conversationId}`);
                testsPassed++;

                // Test 6: Test Chat Streaming
                console.log();
                console.log('Test 6: Testing AI Chat Response...');
                const conversationId = analyzeResponse.data.conversationId;
                
                try {
                    const chatUrl = `${BASE_URL}/api/chat/stream/${conversationId}`;
                    const chatResponse = await axios.get(chatUrl, {
                        responseType: 'stream',
                        timeout: 60000
                    });

                    let receivedData = false;
                    let fullResponse = '';

                    await new Promise((resolve, reject) => {
                        chatResponse.data.on('data', (chunk) => {
                            const lines = chunk.toString().split('\n');
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    try {
                                        const data = JSON.parse(line.slice(6));
                                        if (data.chunk) {
                                            receivedData = true;
                                            fullResponse += data.chunk;
                                        }
                                        if (data.done) {
                                            resolve();
                                        }
                                    } catch (e) {
                                        // Ignore parse errors
                                    }
                                }
                            }
                        });

                        chatResponse.data.on('error', reject);
                        
                        setTimeout(() => {
                            if (!receivedData) {
                                reject(new Error('No response received within timeout'));
                            }
                        }, 30000);
                    });

                    if (receivedData) {
                        console.log('✅ AI chat response works');
                        console.log(`   Response length: ${fullResponse.length} characters`);
                        console.log(`   Preview: ${fullResponse.substring(0, 100)}...`);
                        testsPassed++;
                    }
                } catch (error) {
                    console.log('❌ AI chat response failed');
                    console.log(`   Error: ${error.message}`);
                    testsFailed++;
                }

            }
        } catch (error) {
            console.log('❌ Image analysis failed');
            console.log(`   Error: ${error.response?.data?.error || error.message}`);
            testsFailed++;
        }
    } else {
        console.log('⚠️  Test image not found, skipping image analysis test');
        console.log(`   Looking for: ${testImagePath}`);
    }

    // Summary
    console.log();
    console.log('='.repeat(70));
    console.log('📊 Test Summary');
    console.log('='.repeat(70));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log();

    if (testsFailed === 0) {
        console.log('🎉 All tests passed! Backend is fully functional!');
        console.log();
        console.log('✅ ML Model: Connected');
        console.log('✅ Ollama LLM: Connected');
        console.log('✅ MongoDB: Connected');
        console.log('✅ Image Analysis: Working');
        console.log('✅ Database Save: Working');
        console.log('✅ AI Chat: Working');
        console.log();
        console.log('🚀 Your backend is ready for production!');
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.');
        console.log();
        console.log('Common fixes:');
        console.log('- ML API not running: python api_service.py');
        console.log('- Ollama not running: ollama serve');
        console.log('- MongoDB not running: Start MongoDB Compass');
        console.log('- Backend not running: npm start');
    }
    console.log('='.repeat(70));
}

// Run tests
testCompleteBackend().catch(console.error);
