const OpenAI = require('openai');

class OpenAIAPI {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({ apiKey });
    this.model = 'gpt-4o-mini';
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

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: `data:image/jpeg;base64,${imageBase64.split(',')[1]}`
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON response from OpenAI');
      }
    } catch (error) {
      console.error('OpenAI API error details:', error.message);
      console.error('Full error:', error);
      throw new Error(`Failed to analyze outfit with OpenAI: ${error.message}`);
    }
  }

  async chatAboutOutfit(question, analysisContext, previousMessages = []) {
    try {
      const conversationHistory = previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content
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

      const messages = [
        ...conversationHistory,
        { role: "user", content: prompt }
      ];

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw new Error(`Failed to get OpenAI response: ${error.message}`);
    }
  }
}

module.exports = OpenAIAPI;
