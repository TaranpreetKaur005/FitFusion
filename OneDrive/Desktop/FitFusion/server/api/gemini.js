const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAPI {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }

  async analyzeOutfit(imageBase64, analysisContext) {
    try {
      const prompt = `
You are a professional fashion stylist and style analyst. Analyze the provided outfit image and give detailed style advice.

Context from previous analysis:
${analysisContext}

Please provide:
1. Overall style assessment (1-100 score)
2. Color harmony analysis (1-100 score)  
3. Fit and proportion analysis (1-100 score)
4. Trend relevance (1-100 score)
5. What's working well (bullet points)
6. Suggestions for improvement (bullet points)
7. Style tags/keywords

Respond in JSON format with this structure:
{
  "overall": 85,
  "color": 80,
  "fit": 90,
  "trend": 75,
  "working": ["point 1", "point 2", "point 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "tags": ["tag1", "tag2", "tag3"],
  "verdict": "Brief verdict summary"
}
      `;

      const [, mimeType = 'image/jpeg', base64Data = ''] =
        imageBase64.match(/^data:(.*?);base64,(.*)$/) || [];

      if (!base64Data) {
        throw new Error('Invalid image payload format');
      }

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      return this.normalizeAnalysisResponse(text);
    } catch (error) {
      console.error('Gemini API error details:', error.message);
      console.error('Full error:', error);
      throw new Error(`Failed to analyze outfit with Gemini AI: ${error.message}`);
    }
  }

  async chatAboutOutfit(question, analysisContext, previousMessages = []) {
    try {
      const conversationHistory = previousMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const prompt = `
You are a professional fashion stylist having a conversation about a user's outfit analysis.

Outfit Analysis Context:
${analysisContext}

The user is asking: "${question}"

Please provide helpful, specific fashion advice about their outfit. Be conversational, professional, and encouraging. Keep responses concise but detailed enough to be helpful.

Consider:
- Specific recommendations for accessories, shoes, or other items
- Color coordination advice
- Fit and proportion suggestions
- Occasion appropriateness
- Trend relevance
- Practical, actionable advice

Respond naturally as a fashion expert would in a consultation.
      `;

      const chat = this.model.startChat({
        history: conversationHistory,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw new Error(`Failed to get response from Gemini AI: ${error.message}`);
    }
  }

  normalizeAnalysisResponse(text) {
    const cleanedText = text.replace(/```json|```/gi, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not parse JSON response from Gemini');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      overall: this.clampScore(parsed.overall),
      color: this.clampScore(parsed.color),
      fit: this.clampScore(parsed.fit),
      trend: this.clampScore(parsed.trend),
      working: this.toStringList(parsed.working),
      suggestions: this.toStringList(parsed.suggestions || parsed.improvements),
      tags: this.toStringList(parsed.tags || parsed.styleTags),
      verdict: this.toVerdict(parsed.verdict)
    };
  }

  clampScore(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(numericValue)));
  }

  toStringList(value) {
    if (Array.isArray(value)) {
      return value.map(item => String(item).trim()).filter(Boolean).slice(0, 5);
    }

    if (typeof value === 'string' && value.trim()) {
      return [value.trim()];
    }

    return [];
  }

  toVerdict(value) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    return '✨ Style analysis complete!';
  }
}

module.exports = GeminiAPI;
