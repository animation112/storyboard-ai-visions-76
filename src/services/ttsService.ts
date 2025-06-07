
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export class TTSService {
  private client: ElevenLabsClient;
  private readonly voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // George voice

  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: 'sk_95d4a96ed70b048e541eb280dd57c6e1f4aa1677d0f962d6'
    });
  }

  async generateSpeech(text: string): Promise<string> {
    try {
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
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
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
}

export const ttsService = new TTSService();
