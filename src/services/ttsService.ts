
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

  async generateSpeech(text: string): Promise<string> {
    try {
      // If we know the API key is invalid, return empty string immediately
      if (!this.isApiKeyValid) {
        console.log('TTS API key is invalid, skipping audio generation');
        return '';
      }

      console.log('Generating speech for text:', text);
      
      const audioStream = await this.client.textToSpeech.stream(this.voiceId, {
        text: text,
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
      
      console.log('Speech generated successfully');
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
