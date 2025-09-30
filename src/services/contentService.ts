
import { GoogleGenAI } from "@google/genai";

export interface ContentSlide {
  id: string;
  title: string;
  content: string;
  voiceoverScript: string;
  imagePrompt: string;
}

export interface ContentResponse {
  slides: ContentSlide[];
  success: boolean;
  error?: string;
}

class ContentService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: "AIzaSyDUFGY5Sf2Mx2h1e-NlUAsOU9jaL_y5qLI" });
  }

  async generateContent(prompt: string, artStyle?: string): Promise<ContentResponse> {
    try {
      console.log('Generating content with Gemini 2.5 Flash...');
      
      const styleInstructions = this.getStyleInstructions(artStyle);
      
      const systemPrompt = `You are an expert content creator for visual storytelling presentations. Create EXACTLY 10 slides that explain the topic comprehensively.

CRITICAL REQUIREMENTS:
- Create EXACTLY 10 slides - no more, no less
- Each slide must have: title, brief content, detailed voiceover script, and image prompt
- Keep content concise (1-2 sentences max per slide)
- Make voiceover scripts detailed and engaging (3-4 sentences each)
- Create specific, detailed image prompts that match the ${styleInstructions.description}

${styleInstructions.narrative}

Format each slide EXACTLY like this:
SLIDE 1:
Title: [Catchy title]
Content: [1-2 brief sentences for display]
Voiceover: [3-4 detailed sentences explaining the concept]
Image: [Detailed prompt for ${styleInstructions.description}]

SLIDE 2:
Title: [Catchy title]
Content: [1-2 brief sentences for display]  
Voiceover: [3-4 detailed sentences explaining the concept]
Image: [Detailed prompt for ${styleInstructions.description}]

Continue this exact pattern for all 10 slides.`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-09-2025",
        contents: `${prompt}\n\n${systemPrompt}`,
      });

      const textContent = response.candidates[0].content.parts[0].text || '';
      console.log('Content generation response received');

      const slides = this.parseContentSlides(textContent);
      
      if (slides.length < 10) {
        console.warn(`Only generated ${slides.length} slides, expected 10`);
      }

      return {
        slides,
        success: true
      };
    } catch (error) {
      console.error('Content generation error:', error);
      return {
        slides: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content'
      };
    }
  }

  private getStyleInstructions(artStyle?: string) {
    switch (artStyle) {
      case 'atmospheric-gradient-grain':
        return {
          description: 'Modern Gradient & Grain Illustration style with heavy grain texture, luminous gradients, minimalist forms, and dramatic lighting',
          narrative: 'Use atmospheric and emotional metaphors to explore the concept\'s deeper meaning.'
        };
      case 'dark-surreal':
        return {
          description: 'Conceptual Social Commentary Illustration style with symbolic metaphors, graphic illustration, and meaningful color psychology',
          narrative: 'Use powerful conceptual metaphors and social commentary to explore deeper implications.'
        };
      case 'cute-minimal-watercolor':
      default:
        return {
          description: 'cute, minimal illustration with black ink on white background and soft watercolor accents',
          narrative: 'Use fun metaphors with tiny, curious cats to explain the concept in an engaging way.'
        };
    }
  }

  private parseContentSlides(content: string): ContentSlide[] {
    const slides: ContentSlide[] = [];
    
    // Split by SLIDE markers
    const slideMatches = content.match(/SLIDE\s+(\d+):([\s\S]*?)(?=SLIDE\s+\d+:|$)/gi);
    
    if (slideMatches) {
      slideMatches.forEach((slideMatch, index) => {
        const titleMatch = slideMatch.match(/Title:\s*(.+)/i);
        const contentMatch = slideMatch.match(/Content:\s*(.+)/i);
        const voiceoverMatch = slideMatch.match(/Voiceover:\s*(.+)/i);
        const imageMatch = slideMatch.match(/Image:\s*(.+)/i);
        
        if (titleMatch && contentMatch && voiceoverMatch && imageMatch) {
          slides.push({
            id: `slide-${index}`,
            title: titleMatch[1].trim(),
            content: contentMatch[1].trim(),
            voiceoverScript: voiceoverMatch[1].trim(),
            imagePrompt: imageMatch[1].trim()
          });
        }
      });
    }
    
    // Fallback parsing if the above doesn't work
    if (slides.length === 0) {
      const lines = content.split('\n').filter(line => line.trim());
      let currentSlide: Partial<ContentSlide> = {};
      let slideIndex = 0;
      
      for (const line of lines) {
        if (line.match(/^(SLIDE|Slide)\s*\d+/i)) {
          if (currentSlide.title) {
            slides.push({
              id: `slide-${slideIndex}`,
              title: currentSlide.title || `Step ${slideIndex + 1}`,
              content: currentSlide.content || 'Content explanation',
              voiceoverScript: currentSlide.voiceoverScript || 'Detailed voiceover explanation',
              imagePrompt: currentSlide.imagePrompt || 'Simple illustration'
            });
            slideIndex++;
          }
          currentSlide = {};
        } else if (line.match(/^Title:/i)) {
          currentSlide.title = line.replace(/^Title:\s*/i, '').trim();
        } else if (line.match(/^Content:/i)) {
          currentSlide.content = line.replace(/^Content:\s*/i, '').trim();
        } else if (line.match(/^Voiceover:/i)) {
          currentSlide.voiceoverScript = line.replace(/^Voiceover:\s*/i, '').trim();
        } else if (line.match(/^Image:/i)) {
          currentSlide.imagePrompt = line.replace(/^Image:\s*/i, '').trim();
        }
      }
      
      // Add the last slide
      if (currentSlide.title) {
        slides.push({
          id: `slide-${slideIndex}`,
          title: currentSlide.title || `Step ${slideIndex + 1}`,
          content: currentSlide.content || 'Content explanation',
          voiceoverScript: currentSlide.voiceoverScript || 'Detailed voiceover explanation',
          imagePrompt: currentSlide.imagePrompt || 'Simple illustration'
        });
      }
    }
    
    console.log(`Successfully parsed ${slides.length} content slides`);
    return slides;
  }
}

export const contentService = new ContentService();
