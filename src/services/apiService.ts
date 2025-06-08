
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
    case 'atmospheric-gradient-grain':
      return {
        narrative: "Use simple, archetypal characters and minimalist scenes as a metaphor to explore the concept's emotional or atmospheric core.",
        visuals: `4. Generate an image in a 'Modern Gradient & Grain Illustration' style for each slide. The style must have:
   - Heavy Grain & Airbrush Texture: The entire image must have a prominent, tactile grain or stipple texture, giving it an organic, analog feel.
   - Luminous Gradients: Use soft, dithered gradients to create a sense of glowing light and atmosphere.
   - Minimalist & Abstract Forms: Subjects should be simplified into bold, soft silhouettes or geometric shapes. Avoid fine details.
   - Dramatic Lighting: Use high contrast between light and shadow. Light should appear to glow, carving forms out of deep, dark backgrounds.
   - Atmospheric Mood: The overall feeling should be dreamlike, mysterious, and contemplative. Focus on emotion over narrative detail.
   - Vibrant & Muted Palettes: Use deliberate color schemes with deep blues/purples contrasted with warm yellows/pinks/oranges.`
      };
    case 'dark-surreal':
      return {
        narrative: "Use powerful conceptual metaphors and social commentary to explore the deeper implications of the topic. Focus on thought-provoking themes, societal impact, and philosophical questions.",
        visuals: `4. Generate an image in a 'Conceptual Social Commentary Illustration' style for each slide. The style must be:
   - Conceptual and Symbolic: Use abstract visual metaphors that represent ideas rather than literal objects. Think of concepts like surveillance as eyes in screens, social media as puppet strings, or technology as growing vines consuming nature.
   - Social Commentary: Critique or explore societal themes, power structures, human behavior, and cultural phenomena through visual storytelling.
   - Graphic Illustration Style: Clean, bold graphic illustrations with strong symbolic elements rather than photorealistic imagery.
   - Meaningful Color Psychology: Use intentional color choices - cool blues for technology/isolation, warm reds for danger/emotion, stark black and white for contrast/conflict, muted tones for dystopian themes.
   - Minimalist Composition: Focus on one central powerful metaphor per image with clean, uncluttered compositions that communicate the concept clearly.
   - Editorial Art Aesthetic: Think magazine editorial illustrations, protest art, or infographic-style visuals that convey complex ideas simply.`
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

      console.log('Sending request to Gemini...');
      let response;
      let images: string[] = [];
      let fullTextContent = '';
      let retryCount = 0;
      const maxRetries = 3;

      // Retry loop for image generation
      while (retryCount < maxRetries) {
        try {
          response = await this.ai.models.generateContent({
            model: "gemini-2.0-flash-preview-image-generation",
            contents: `${request.prompt}\n\n${systemPrompt}`,
            config: {
              responseModalities: [Modality.TEXT, Modality.IMAGE],
            },
          });

          // Reset for each attempt
          images = [];
          fullTextContent = '';

          // Collect all text and images
          for (const part of response.candidates[0].content.parts) {
            if (part.text) {
              fullTextContent += part.text;
            } else if (part.inlineData) {
              const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              images.push(imageUrl);
            }
          }

          console.log(`Attempt ${retryCount + 1}: Received ${images.length} images from Gemini`);

          // If we have a reasonable number of images, break out of retry loop
          if (images.length >= 5) {
            break;
          }

          retryCount++;
          if (retryCount < maxRetries) {
            console.warn(`Only received ${images.length} images, retrying... (${retryCount}/${maxRetries})`);
          }
        } catch (genError) {
          console.error(`Generation attempt ${retryCount + 1} failed:`, genError);
          retryCount++;
          if (retryCount >= maxRetries) {
            throw genError;
          }
        }
      }

      // Check if we still have too few images after all retries
      if (images.length === 0) {
        return {
          slides: [],
          refinedPrompt: '',
          success: false,
          error: 'No images were generated after multiple attempts. Please try again with a different prompt or art style.'
        };
      }

      // Parse slides using improved regex
      const slideRegex = /Slide\s+(\d+):\s*([^\n]+)\s*\n\s*Visual:\s*([^\n]+)\s*\n\s*Voiceover:\s*([^\n]+(?:\n(?!Slide)[^\n]*)*)/gi;
      let match;
      let slideIndex = 0;
      const slides: Slide[] = [];

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

      // If regex parsing didn't get enough slides, try alternative parsing
      if (slides.length < 5) {
        console.log(`Only got ${slides.length} slides from regex, trying alternative parsing`);
        
        // Clear slides and try alternative parsing
        slides.length = 0;
        
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

      if (slides.length < 3) {
        throw new Error(`Failed to generate enough slides. Only generated ${slides.length} slides, expected 10. Please try a different prompt.`);
      }

      // Pad to 10 slides if we have between 3-9 slides
      while (slides.length < 10 && slides.length >= 3) {
        const lastSlide = slides[slides.length - 1];
        const paddedSlide: Slide = {
          id: `slide-${slides.length}`,
          title: `Summary ${slides.length - 2}`,
          content: `Let's review what we've learned so far.`,
          imageUrl: images[slides.length] || lastSlide.imageUrl,
          commentary: `Let's review what we've learned so far.`,
          voiceoverScript: `This slide summarizes the key concepts we've covered. The process we've explained shows how complex topics can be broken down into understandable steps.`
        };
        slides.push(paddedSlide);
      }

      // Generate audio for all slides only if voiceover is enabled AND TTS is available
      // This should NOT fail the entire generation if it doesn't work
      if (request.voiceoverEnabled !== false && ttsService.isAvailable()) {
        console.log('Generating audio for all slides...');
        try {
          const voiceoverTexts = slides.map(slide => slide.voiceoverScript);
          const audioUrls = await ttsService.generateMultipleSpeechFiles(voiceoverTexts);
          
          // Add audio URLs to slides
          slides.forEach((slide, index) => {
            slide.audioUrl = audioUrls[index];
          });
          
          console.log('Audio generation completed successfully');
        } catch (audioError) {
          console.error('Audio generation failed, but continuing without audio:', audioError);
          // Don't fail the entire generation if only audio fails
          // The slides will just not have audio
        }
      } else if (!ttsService.isAvailable()) {
        console.log('TTS service not available, skipping audio generation');
      } else {
        console.log('Voiceover disabled, skipping audio generation');
      }

      console.log(`Successfully generated ${slides.length} slides${request.voiceoverEnabled !== false && ttsService.isAvailable() ? ' (with audio attempt)' : ''}`);

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
