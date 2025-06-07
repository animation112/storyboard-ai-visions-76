
import { GoogleGenAI, Modality } from "@google/genai";

export interface GenerateRequest {
  prompt: string;
  artStyle?: string;
  explanationStyle?: string;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  commentary: string;
}

export interface GenerateResponse {
  slides: Slide[];
  refinedPrompt: string;
  success: boolean;
  error?: string;
}

class ApiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: "AIzaSyDMwNHMeZVWmf0Wtc9BQSsY4mks2yd0aAg" });
  }

  async generateExplanation(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const systemPrompt = `I will name a task. Come up with an unexpected, absurd, fun method to complete that task. Then pretend you're giving a slideshow presentation pitching me on your method. Be a gripping narrator. Be clever, conversational, and very concise.

Give your method a fun name and explain it in 5 clear steps with very short sentences. At the end of your presentation, suggest to me that I can ask you to solve another task.

Illustrate the slides with minimal, black ink on white background, with bits of watercolor. Always generate images, never just describe them.

Use markdown formatting and intersperse your commentary between slides like this:

Slide 1: Title

Some commentary to be spoken over the slide...

Slide 2: Title

Further commentary to be spoken over slide 2...

etc`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: `${request.prompt}\n\n${systemPrompt}`,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const slides: Slide[] = [];
      let currentText = '';
      let slideCounter = 0;

      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          currentText += part.text;
        } else if (part.inlineData) {
          // Create a slide when we have both text and image
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          
          // Parse the text to extract title and content
          const lines = currentText.trim().split('\n').filter(line => line.trim());
          const title = lines[0] || `Slide ${slideCounter + 1}`;
          const content = lines.slice(1).join('\n') || currentText;
          
          slides.push({
            id: `slide-${slideCounter}`,
            title: title.replace(/^#+\s*/, ''), // Remove markdown headers
            content: content,
            imageUrl: imageUrl,
            commentary: content // Use content as commentary for now
          });

          slideCounter++;
          currentText = '';
        }
      }

      // If there's remaining text without an image, create a text-only slide
      if (currentText.trim()) {
        const lines = currentText.trim().split('\n').filter(line => line.trim());
        const title = lines[0] || `Slide ${slideCounter + 1}`;
        const content = lines.slice(1).join('\n') || currentText;
        
        slides.push({
          id: `slide-${slideCounter}`,
          title: title.replace(/^#+\s*/, ''),
          content: content,
          commentary: content
        });
      }

      return {
        slides,
        refinedPrompt: request.prompt,
        success: true
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        slides: [],
        refinedPrompt: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async refinePrompt(originalPrompt: string, subject: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-preview",
        contents: `Refine this prompt for better visual explanations: "${originalPrompt}" for the subject: "${subject}". Make it more specific and engaging for visual storytelling.`,
      });

      return response.candidates[0].content.parts[0].text || originalPrompt;
    } catch (error) {
      console.error('Prompt refinement error:', error);
      return originalPrompt;
    }
  }

  async textToSpeech(text: string): Promise<string> {
    // Placeholder for TTS - would need a TTS service
    return Promise.resolve('');
  }
}

export const apiService = new ApiService();
