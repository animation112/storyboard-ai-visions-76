import { GoogleGenAI, Modality } from "@google/genai";
import { ttsService } from './ttsService';

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

const getStylePrompts = (artStyle?: string) => {
  switch (artStyle) {
    case 'dark-surreal':
      return {
        narrative: "Use powerful conceptual metaphors and social commentary to tell a story about the topic. The tone should be thought-provoking, critical, and reflective of societal issues.",
        visuals: `4. Generate an image in a 'Conceptual Social Commentary Illustration' style for each slide. The style must be:
   - Conceptual and Symbolic: Use abstract visual metaphors to critique or explore societal aspects of the concept. Show systems, power structures, or human relationships through symbolic imagery.
   - Social Commentary Focus: Address how the topic impacts society, inequality, power dynamics, or human behavior through visual storytelling.
   - Minimalist Conceptual Art: Use clean, geometric shapes and symbolic representations rather than realistic depictions.
   - Strategic Color Usage: Employ a limited color palette with purposeful color choices - perhaps stark black/white with strategic use of red, blue, or gold to highlight key concepts.
   - Graphic Design Approach: Think infographic meets editorial illustration - clear, impactful visual communication that makes complex social concepts accessible.
   - Human-Centered Perspective: Show how the concept affects people, communities, or society at large through abstract human figures or symbolic representations.`
      };
    case 'cute-minimal-watercolor':
    default:
      return {
        narrative: "2. Use a fun story about lots of tiny, curious cats as a metaphor to explain the concept.",
        visuals: "4. Generate a cute, minimal illustration for each slide with black ink on a clean white background, with small, soft bits of watercolor."
      };
  }
};

class ApiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: "AIzaSyDMwNHMeZVWmf0Wtc9BQSsY4mks2yd0aAg" });
  }

  async generateExplanation(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      // Get the dynamic style instructions based on the request
      const { narrative, visuals } = getStylePrompts(request.artStyle);

      const systemPrompt = `Create a comprehensive visual story explanation with these requirements:

CRITICAL: You MUST create EXACTLY 10 slides. This is absolutely essential.

1. Create EXACTLY 10 slides - no more, no less
${narrative}
3. Keep sentences very short but conversational and engaging
${visuals}
5. Focus heavily on visuals - each slide MUST have an image
6. Maximum 2-3 short sentences per slide content
7. Always generate images, never just describe them
8. Make it cinematic and story-driven
9. Each slide must have a detailed voiceover script (3-4 sentences that explain the concept in depth)

IMPORTANT: You must generate exactly 10 images - one for each slide.

Format each slide EXACTLY like this:
Slide 1: [Short catchy title]
Visual: [1-2 very short sentences for the slide display]
Voiceover: [3-4 detailed sentences explaining the concept in depth]

Slide 2: [Short catchy title]
Visual: [1-2 very short sentences for the slide display]
Voiceover: [3-4 detailed sentences explaining the concept in depth]

Continue this exact pattern for all 10 slides.

Then generate 10 corresponding illustrations - one image immediately after each slide description.`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: `${request.prompt}\n\n${systemPrompt}`,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const slides: Slide[] = [];
      let fullTextContent = '';
      const images: string[] = [];

      // First, collect all text and images separately
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          fullTextContent += part.text;
        } else if (part.inlineData) {
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          images.push(imageUrl);
        }
      }

      console.log(`Received ${images.length} images from Gemini`);
      console.log('Full text content length:', fullTextContent.length);

      // Parse slides using improved regex
      const slideRegex = /Slide\s+(\d+):\s*([^\n]+)\s*\n\s*Visual:\s*([^\n]+)\s*\n\s*Voiceover:\s*([^\n]+(?:\n(?!Slide)[^\n]*)*)/gi;
      let match;
      let slideIndex = 0;

      while ((match = slideRegex.exec(fullTextContent)) !== null && slideIndex < 10) {
        const [, slideNumber, title, visual, voiceover] = match;
        
        const slide: Slide = {
          id: `slide-${slideIndex}`,
          title: title.trim(),
          content: visual.trim(),
          imageUrl: images[slideIndex] || undefined,
          commentary: visual.trim(),
          voiceoverScript: voiceover.trim()
        };

        slides.push(slide);
        slideIndex++;
        
        console.log(`Parsed slide ${slideIndex}: ${slide.title}`);
      }

      // If regex parsing didn't get 10 slides, try alternative parsing
      if (slides.length < 10) {
        console.log(`Only got ${slides.length} slides from regex, trying alternative parsing`);
        
        // Split by "Slide" and process each section
        const slideSections = fullTextContent.split(/Slide\s+\d+:/i).filter(section => section.trim());
        
        for (let i = 0; i < Math.min(slideSections.length, 10); i++) {
          if (slides.length >= 10) break;
          
          const section = slideSections[i];
          const lines = section.split('\n').filter(line => line.trim());
          
          let title = `Step ${i + 1}`;
          let visual = '';
          let voiceover = '';
          
          // Extract title (first meaningful line)
          if (lines.length > 0) {
            title = lines[0].trim();
          }
          
          // Look for Visual and Voiceover sections
          for (let j = 0; j < lines.length; j++) {
            const line = lines[j].trim();
            if (line.toLowerCase().startsWith('visual:')) {
              visual = line.replace(/^visual:\s*/i, '');
            } else if (line.toLowerCase().startsWith('voiceover:')) {
              voiceover = line.replace(/^voiceover:\s*/i, '');
              // Include following lines that are part of voiceover
              for (let k = j + 1; k < lines.length; k++) {
                const nextLine = lines[k].trim();
                if (!nextLine.toLowerCase().startsWith('slide') && 
                    !nextLine.toLowerCase().startsWith('visual:') && 
                    nextLine) {
                  voiceover += ' ' + nextLine;
                } else {
                  break;
                }
              }
            }
          }
          
          // If we don't have visual/voiceover, use the content
          if (!visual && !voiceover) {
            const content = lines.join(' ').trim();
            visual = content.substring(0, 100) + '...';
            voiceover = content;
          }
          
          const slide: Slide = {
            id: `slide-${slides.length}`,
            title: title || `Step ${slides.length + 1}`,
            content: visual || 'Visual explanation',
            imageUrl: images[slides.length] || undefined,
            commentary: visual || 'Visual explanation',
            voiceoverScript: voiceover || visual || 'Detailed explanation'
          };
          
          slides.push(slide);
          console.log(`Alternative parsing - slide ${slides.length}: ${slide.title}`);
        }
      }

      // Ensure we have at least some slides, but fail if we have too few
      if (slides.length === 0) {
        throw new Error('Failed to parse any slides from the response');
      }

      if (slides.length < 5) {
        throw new Error(`Failed to generate enough slides. Only generated ${slides.length} slides, expected 10. Retrying...`);
      }

      // Pad to 10 slides if we have between 5-9 slides
      while (slides.length < 10 && slides.length >= 5) {
        const lastSlide = slides[slides.length - 1];
        const paddedSlide: Slide = {
          id: `slide-${slides.length}`,
          title: `Summary ${slides.length - 4}`,
          content: `Let's review what we've learned so far.`,
          imageUrl: images[slides.length] || lastSlide.imageUrl,
          commentary: `Let's review what we've learned so far.`,
          voiceoverScript: `This slide summarizes the key concepts we've covered. The process we've explained shows how complex topics can be broken down into understandable steps.`
        };
        slides.push(paddedSlide);
      }

      // Generate audio for all slides only if voiceover is enabled
      if (request.voiceoverEnabled !== false) {
        console.log('Generating audio for all slides...');
        const voiceoverTexts = slides.map(slide => slide.voiceoverScript);
        const audioUrls = await ttsService.generateMultipleSpeechFiles(voiceoverTexts);
        
        // Add audio URLs to slides
        slides.forEach((slide, index) => {
          slide.audioUrl = audioUrls[index];
        });
      }

      console.log(`Successfully generated ${slides.length} slides${request.voiceoverEnabled !== false ? ' with audio' : ''}`);

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
