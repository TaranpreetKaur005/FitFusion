const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyAkO1CM6a3eNjnJBvZeS-enu6wVCA15YuU';

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    console.log('Available models:', JSON.stringify(data, null, 2));
    
    // Try different model names
    const modelNames = [
      'gemini-1.0-pro',
      'gemini-1.0-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-pro-vision'
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, world!');
        const response = await result.response;
        console.log(`✅ ${modelName} works:`, response.text().substring(0, 100));
      } catch (error) {
        console.log(`❌ ${modelName} failed:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
