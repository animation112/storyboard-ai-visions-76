import { GoogleGenAI } from '@google/genai';

export class TTSService {
  private ai: GoogleGenAI;
  private readonly voiceName = 'Puck'; // Upbeat voice
  private isApiKeyValid = true;

  constructor() {
    this.ai = new GoogleGenAI({ 
      apiKey: 'AIzaSyDUFGY5Sf2Mx2h1e-NlUAsOU9jaL_y5qLI'
    });
  }

  async generateSpeech(text: string): Promise<string> {
    try {
      if (!this.isApiKeyValid) {
        console.log('TTS API key is invalid, skipping audio generation');
        return '';
      }

      console.log('Generating speech for text:', text);
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: this.voiceName },
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!audioData) {
        console.error('No audio data in response');
        return '';
      }

      // Convert base64 to WAV blob
      const audioBuffer = this.base64ToArrayBuffer(audioData);
      const wavBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(wavBlob);
      
      console.log('Speech generated successfully');
      return audioUrl;
    } catch (error: any) {
      console.error('Error generating speech:', error);
      
      if (error.status === 403 || error.status === 401) {
        console.error('Gemini API key is invalid or access denied. Disabling TTS for this session.');
        this.isApiKeyValid = false;
      }
      
      return '';
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
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
