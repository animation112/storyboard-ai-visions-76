
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export class TTSService {
  private client: ElevenLabsClient;
  private readonly voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // George voice
  private isApiKeyValid = true;

  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: 'sk_54165c6b09047491b7b3c65331e67a8c902985e594510297'
    });
  }

  private addEmotionalExpressions(text: string): string {
    // Add emotional expressions to make the voiceover more engaging
    const sentences = text.split('. ');
    const emotionalSentences = sentences.map((sentence, index) => {
      if (!sentence.trim()) return sentence;
      
      // Add emotions based on content and position
      if (sentence.toLowerCase().includes('imagine') || sentence.toLowerCase().includes('picture')) {
        return `[curious] ${sentence}`;
      } else if (sentence.toLowerCase().includes('wow') || sentence.toLowerCase().includes('amazing')) {
        return `[excited] ${sentence}`;
      } else if (sentence.toLowerCase().includes('problem') || sentence.toLowerCase().includes('issue')) {
        return `[cautiously] ${sentence}`;
      } else if (sentence.toLowerCase().includes('fun') || sentence.toLowerCase().includes('play')) {
        return `[playful] ${sentence}`;
      } else if (sentence.toLowerCase().includes('important') || sentence.toLowerCase().includes('critical')) {
        return `[serious] ${sentence}`;
      } else if (index === 0) {
        // First sentence - often introduction
        return `[calm] ${sentence}`;
      } else if (index === sentences.length - 1 && sentences.length > 1) {
        // Last sentence - often conclusion
        return `[elated] ${sentence}`;
      } else {
        // Vary emotions for middle sentences
        const emotions = ['curious', 'playful', 'excited', 'calm'];
        const emotion = emotions[index % emotions.length];
        return `[${emotion}] ${sentence}`;
      }
    });
    
    return emotionalSentences.join('. ');
  }

  async generateSpeech(text: string): Promise<string> {
    try {
      // If we know the API key is invalid, return empty string immediately
      if (!this.isApiKeyValid) {
        console.log('TTS API key is invalid, skipping audio generation');
        return '';
      }

      // Add emotional expressions to the text
      const emotionalText = this.addEmotionalExpressions(text);
      console.log('Generating speech for text with emotions:', emotionalText);
      
      const audioStream = await this.client.textToSpeech.stream(this.voiceId, {
        text: emotionalText,
        modelId: 'eleven_multilingual_v2', // Using v2 instead of v3 as it's more widely available
        outputFormat: 'mp3_44100_128'
      });

      // Convert stream to blob
      const chunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('Speech generated successfully with emotions');
      return audioUrl;
    } catch (error: any) {
      console.error('Error generating speech:', error);
      
      // Check if it's a 403 error (model access denied) or 401 (invalid API key)
      if (error.statusCode === 403 || error.statusCode === 401) {
        console.error('ElevenLabs API key is invalid or model access denied. Disabling TTS for this session.');
        this.isApiKeyValid = false;
      }
      
      // Return empty string instead of throwing - this allows the app to continue without audio
      return '';
    }
  }

  async generateMultipleSpeechFiles(texts: string[]): Promise<string[]> {
    console.log('Generating multiple speech files:', texts.length);
    const audioUrls: string[] = [];
    
    for (const text of texts) {
      if (text.trim()) {
        const audioUrl = await this.generateSpeech(text);
        audioUrls.push(audioUrl);
        
        // If API key becomes invalid, stop trying to generate more audio
        if (!this.isApiKeyValid) {
          console.log('API key invalid, stopping audio generation for remaining slides');
          // Fill remaining slots with empty strings
          while (audioUrls.length < texts.length) {
            audioUrls.push('');
          }
          break;
        }
      } else {
        audioUrls.push('');
      }
    }
    
    return audioUrls;
  }

  // Method to check if TTS is available
  isAvailable(): boolean {
    return this.isApiKeyValid;
  }
}

export const ttsService = new TTSService();
