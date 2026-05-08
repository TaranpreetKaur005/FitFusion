const https = require('https');

const apiKey = 'AIzaSyAkO1CM6a3eNjnJBvZeS-enu6wVCA15YuU';

async function getModels() {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const models = JSON.parse(data);
          resolve(models);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function findGenerateContentModels() {
  try {
    const models = await getModels();
    const generateContentModels = [];
    
    if (models.models) {
      for (const model of models.models) {
        if (model.supportedGenerationMethods && 
            model.supportedGenerationMethods.includes('generateContent')) {
          generateContentModels.push({
            name: model.name,
            displayName: model.displayName,
            description: model.description
          });
        }
      }
    }
    
    console.log('Models that support generateContent:');
    generateContentModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name} (${model.displayName})`);
      console.log(`   ${model.description}`);
      console.log('');
    });
    
    return generateContentModels;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

findGenerateContentModels();
