
import { GoogleGenAI, Modality } from "@google/genai";
import { ttsService } from './ttsService';
import { contentService } from './contentService';
import { imageService } from './imageService';

export interface GenerateRequest {
  prompt: string;
  artStyle?: string;
  explanationStyle?: string;
  voiceoverEnabled?: boolean;
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
  async generateExplanation(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      console.log('Starting two-model pipeline...');
      
      // Step 1: Generate content structure with Gemini 2.5 Flash
      console.log('Step 1: Generating content with smart model...');
      const contentResponse = await contentService.generateContent(request.prompt, request.artStyle);
      
      if (!contentResponse.success || contentResponse.slides.length === 0) {
        return {
          slides: [],
          refinedPrompt: '',
          success: false,
          error: contentResponse.error || 'Failed to generate content structure'
        };
      }

      // Step 2: Generate images based on the content
      console.log('Step 2: Generating images with image model...');
      const imagePrompts = contentResponse.slides.map(slide => slide.imagePrompt);
      const imageResponse = await imageService.generateImages({
        imagePrompts,
        artStyle: request.artStyle
      });

      // Step 3: Combine content and images into final slides
      const slides: Slide[] = contentResponse.slides.map((contentSlide, index) => ({
        id: contentSlide.id,
        title: contentSlide.title,
        content: contentSlide.content,
        imageUrl: imageResponse.images[index] || undefined,
        commentary: contentSlide.content,
        voiceoverScript: contentSlide.voiceoverScript
      }));

      // Step 4: Generate audio if requested
      if (request.voiceoverEnabled !== false && ttsService.isAvailable()) {
        console.log('Step 3: Generating audio for all slides...');
        try {
          const voiceoverTexts = slides.map(slide => slide.voiceoverScript);
          const audioUrls = await ttsService.generateMultipleSpeechFiles(voiceoverTexts);
          
          slides.forEach((slide, index) => {
            slide.audioUrl = audioUrls[index];
          });
          
          console.log('Audio generation completed successfully');
        } catch (audioError) {
          console.error('Audio generation failed, but continuing without audio:', audioError);
        }
      }

      console.log(`Two-model pipeline completed successfully: ${slides.length} slides generated`);

      return {
        slides,
        refinedPrompt: request.prompt,
        success: true
      };
    } catch (error) {
      console.error('Two-model pipeline error:', error);
      return {
        slides: [],
        refinedPrompt: '',
        success: false,
        error: error instanceof Error ? `Pipeline failed: ${error.message}` : 'Two-model pipeline failed - please try again'
      };
    }
  }

  async refinePrompt(originalPrompt: string, subject: string): Promise<string> {
    try {
      // Use the smarter model for prompt refinement too
      const ai = new GoogleGenAI({ apiKey: "AIzaSyDMwNHMeZVWmf0Wtc9BQSsY4mks2yd0aAg" });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-05-20",
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
