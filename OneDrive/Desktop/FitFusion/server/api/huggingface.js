const { HfInference } = require('@huggingface/inference');

class HuggingFaceAPI {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Hugging Face API key is required');
    }
    this.hf = new HfInference(apiKey);
  }

  async generateOutfitImage(prompt, style = 'photorealistic', width = 512, height = 768) {
    try {
      const enhancedPrompt = `
Fashion photography of ${prompt}. 
Professional studio lighting, high-end fashion photography style, 
${style} aesthetic, detailed outfit, full body shot, 
clean background, fashion magazine quality.
      `.trim();

      // Use Stable Diffusion XL for high-quality fashion images
      const response = await this.hf.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: enhancedPrompt,
        parameters: {
          width: width,
          height: height,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          negative_prompt: 'blurry, low quality, distorted, deformed, ugly, bad anatomy'
        }
      });

      // Convert image blob to base64
      const buffer = Buffer.from(response);
      const base64 = buffer.toString('base64');
      
      return {
        success: true,
        imageUrl: `data:image/png;base64,${base64}`,
        provider: 'huggingface'
      };
    } catch (error) {
      console.error('Hugging Face generation error:', error);
      throw new Error(`Failed to generate image with Hugging Face: ${error.message}`);
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

  async generateMoodboard(theme, style, items = []) {
    try {
      const prompt = `
Fashion moodboard for ${theme} with ${style} aesthetic.
Professional fashion collage, magazine layout style,
featuring ${items.join(', ')}. 
High-end fashion photography, artistic composition,
trendy color palette, sophisticated styling.
      `.trim();

      return await this.generateOutfitImage(prompt, 'fashion editorial', 768, 512);
    } catch (error) {
      console.error('Moodboard generation error:', error);
      throw error;
    }
  }
}

module.exports = HuggingFaceAPI;
