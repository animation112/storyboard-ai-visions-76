
import { GoogleGenAI, Modality } from "@google/genai";

export interface ImageGenerationRequest {
  imagePrompts: string[];
  artStyle?: string;
}

export interface ImageGenerationResponse {
  images: string[];
  success: boolean;
  error?: string;
}

class ImageService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: "AIzaSyDUFGY5Sf2Mx2h1e-NlUAsOU9jaL_y5qLI" });
  }

  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      console.log(`Generating ${request.imagePrompts.length} images...`);
      
      const images: string[] = [];
      const batchSize = 5; // Process in batches to avoid overwhelming the API
      
      for (let i = 0; i < request.imagePrompts.length; i += batchSize) {
        const batch = request.imagePrompts.slice(i, i + batchSize);
        const batchImages = await this.generateImageBatch(batch, request.artStyle);
        images.push(...batchImages);
      }
      
      console.log(`Successfully generated ${images.length} images`);
      
      return {
        images,
        success: true
      };
    } catch (error) {
      console.error('Image generation error:', error);
      return {
        images: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate images'
      };
    }
  }

  private async generateImageBatch(prompts: string[], artStyle?: string): Promise<string[]> {
    const images: string[] = [];
    
    for (const prompt of prompts) {
      try {
        const enhancedPrompt = this.enhancePrompt(prompt, artStyle);
        
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash-image-preview",
          contents: enhancedPrompt,
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT], // Fixed: Added TEXT modality
          },
        });

        // Extract image from response
        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              images.push(imageUrl);
              console.log(`Successfully generated image for prompt: ${prompt.substring(0, 50)}...`);
              break; // Only take the first image for each prompt
            }
          }
        }
      } catch (error) {
        console.error(`Failed to generate image for prompt: ${prompt}`, error);
        // Continue with other images even if one fails
      }
    }
    
    return images;
  }

  private enhancePrompt(basePrompt: string, artStyle?: string): string {
    const styleEnhancements = this.getStyleEnhancements(artStyle);
    return `${basePrompt}. ${styleEnhancements}`;
  }

  private getStyleEnhancements(artStyle?: string): string {
    switch (artStyle) {
      case 'atmospheric-gradient-grain':
        return 'Style: Modern Gradient & Grain Illustration with heavy grain texture, luminous gradients, minimalist abstract forms, dramatic lighting with high contrast, atmospheric and dreamlike mood, vibrant color palette with deep blues/purples and warm yellows/pinks/oranges.';
        
      case 'dark-surreal':
        return 'Style: Conceptual Social Commentary Illustration with abstract visual metaphors, symbolic elements, graphic illustration style, meaningful color psychology, minimalist composition with one central metaphor, editorial art aesthetic.';
        
      case 'cute-minimal-watercolor':
      default:
        return 'Style: Cute, minimal illustration with black ink line art on clean white background, small soft bits of watercolor, simple and charming aesthetic.';
    }
  }
}

export const imageService = new ImageService();
