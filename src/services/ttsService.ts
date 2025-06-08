
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export class TTSService {
  private client: ElevenLabsClient;
  private readonly voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // George voice
  private isApiKeyValid = true;

  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: 'sk_33d9adedf102d7f082b10137d93fdec01b878f04e21a4d83'
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
        modelId: 'eleven_multilingual_v2',
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
      
      // Check if it's a 401 error (invalid API key)
      if (error.statusCode === 401) {
        console.error('ElevenLabs API key is invalid or expired. Disabling TTS for this session.');
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
