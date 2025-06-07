import { GoogleGenAI, Modality } from "@google/genai";
import { ttsService } from './ttsService';

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
  voiceoverScript: string;
  audioUrl?: string;
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
      const systemPrompt = `Create a comprehensive visual story explanation with these requirements:

1. Create EXACTLY 10 slides - this is very important
2. Use a fun story about lots of tiny cats as a metaphor
3. Keep sentences very short but conversational and engaging
4. Generate a cute, minimal illustration for each sentence with black ink on white background, with bits of watercolor
5. Focus heavily on visuals - each slide MUST have an image
6. Maximum 2-3 short sentences per slide content
7. Always generate images, never just describe them
8. Make it cinematic and story-driven
9. Each slide must have a detailed voiceover script (3-4 sentences that explain the concept in depth)

For each slide, provide:
- A short catchy title
- Brief visual content (1-2 sentences for the slide display)
- A detailed voiceover script (3-4 sentences explaining the concept in depth, as the image is supporting the explanation)

Format each slide as:
Slide [number]: [Short catchy title]
Visual: [1-2 very short sentences for the slide]
Voiceover: [3-4 detailed sentences explaining the concept in depth]

You MUST create exactly 10 slides. Then generate the corresponding illustration for each slide.

IMPORTANT: Generate 10 images total - one for each slide.`;

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
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          
          const lines = currentText.trim().split('\n').filter(line => line.trim());
          const titleLine = lines.find(line => line.includes('Slide')) || `Slide ${slideCounter + 1}`;
          const title = titleLine.replace(/^Slide \d+:\s*/, '').replace(/^#+\s*/, '');
          
          // Extract visual content and voiceover script
          const visualLine = lines.find(line => line.toLowerCase().includes('visual:'));
          const voiceoverLine = lines.find(line => line.toLowerCase().includes('voiceover:'));
          
          const visualContent = visualLine ? visualLine.replace(/^visual:\s*/i, '') : '';
          const voiceoverScript = voiceoverLine ? voiceoverLine.replace(/^voiceover:\s*/i, '') : '';
          
          // Fallback to using all content if structured format not found
          const content = visualContent || lines.filter(line => 
            !line.includes('Slide') && 
            !line.toLowerCase().includes('visual:') && 
            !line.toLowerCase().includes('voiceover:')
          ).join(' ').trim() || currentText;
          
          const finalVoiceoverScript = voiceoverScript || content;
          
          slides.push({
            id: `slide-${slideCounter}`,
            title: title || `Step ${slideCounter + 1}`,
            content: content,
            imageUrl: imageUrl,
            commentary: content,
            voiceoverScript: finalVoiceoverScript
          });

          slideCounter++;
          currentText = '';
        }
      }

      // Check if we have enough slides
      if (slides.length < 5) {
        throw new Error(`Failed to generate enough slides. Only generated ${slides.length} slides, expected at least 10.`);
      }

      // Generate audio for all slides
      console.log('Generating audio for all slides...');
      const voiceoverTexts = slides.map(slide => slide.voiceoverScript);
      const audioUrls = await ttsService.generateMultipleSpeechFiles(voiceoverTexts);
      
      // Add audio URLs to slides
      slides.forEach((slide, index) => {
        slide.audioUrl = audioUrls[index];
      });

      console.log(`Successfully generated ${slides.length} slides with audio`);

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
        error: error instanceof Error ? `Failed to generate: ${error.message}` : 'Failed to generate explanation - please try again'
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
