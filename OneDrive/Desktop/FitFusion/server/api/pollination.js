const axios = require('axios');

class PollinationAPI {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Pollination API key is required');
    }
    this.apiKey = apiKey;
    this.baseURL = 'https://api.pollination.ai';
  }

  async generateOutfitImage(prompt, style = 'photorealistic', width = 512, height = 768) {
    try {
      const enhancedPrompt = `
Fashion photography of ${prompt}. 
Professional studio lighting, high-end fashion photography style, 
${style} aesthetic, detailed outfit, full body shot, 
clean background, fashion magazine quality.
      `.trim();

      const requestBody = {
        version: "db21e6d4b5dcf04a50b94c0f8923e7f8afeb838e98e7d2ae8416f96b93221c5",
        input: {
          prompt: enhancedPrompt,
          width: width,
          height: height,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
          seed: -1,
          scheduler: "DPMSolverMultistep"
        }
      };

      const response = await axios.post(
        `${this.baseURL}/predictions`,
        requestBody,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.output) {
        return {
          success: true,
          imageUrl: response.data.output[0],
          prompt: enhancedPrompt
        };
      } else {
        throw new Error('No image generated in response');
      }
    } catch (error) {
      console.error('Pollination API error:', error);
      if (error.response && error.response.data) {
        throw new Error(`Pollination API error: ${error.response.data.message || error.response.data.error}`);
      }
      throw new Error('Failed to generate outfit image with Pollination AI');
    }
  }

  async generateStyleMoodboard(style, occasion, colorPalette = null) {
    try {
      const colorHint = colorPalette ? `Color palette: ${colorPalette.join(', ')}.` : '';
      const prompt = `
Fashion mood board for ${style} style, suitable for ${occasion}.
${colorHint}
Minimalist flat lay arrangement, fashion editorial style, 
clean aesthetic, multiple outfit pieces arranged artfully, 
soft shadows, professional fashion photography.
      `.trim();

      return await this.generateOutfitImage(prompt, 'editorial', 768, 512);
    } catch (error) {
      console.error('Moodboard generation error:', error);
      throw error;
    }
  }

  async generateAccessorySuggestions(outfitStyle, occasion) {
    try {
      const prompt = `
Fashion accessories that complement ${outfitStyle} style for ${occasion}.
Luxury accessories, professional product photography, 
white background, detailed textures, high-end fashion accessories,
including bags, shoes, jewelry, belts, and other complementary items.
      `.trim();

      return await this.generateOutfitImage(prompt, 'product photography', 512, 512);
    } catch (error) {
      console.error('Accessory generation error:', error);
      throw error;
    }
  }
}

module.exports = PollinationAPI;
