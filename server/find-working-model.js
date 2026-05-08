const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyAkO1CM6a3eNjnJBvZeS-enu6wVCA15YuU';

async function findWorkingModel() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // From the model list, let me try some models that support generateContent
    const modelNames = [
      'gemini-2.5-flash-preview-04-2025',
      'gemini-2.5-flash-exp',
      'gemini-2.5-pro-exp',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-exp-0827',
      'gemini-1.5-pro-exp-0827'
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, world!');
        const response = await result.response;
        console.log(`✅ ${modelName} works!`);
        console.log(`Response: ${response.text().substring(0, 100)}...`);
        return modelName; // Return the first working model
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}`);
      }
    }
    
    console.log('No working model found');
    return null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

findWorkingModel().then(model => {
  console.log(`\nUse this model: ${model}`);
  process.exit(model ? 0 : 1);
});
