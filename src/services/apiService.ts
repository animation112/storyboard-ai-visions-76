
export interface GenerateRequest {
  prompt: string;
  artStyle?: string;
  explanationStyle?: string;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  commentary: string;
}

export interface GenerateResponse {
  slides: Slide[];
  refinedPrompt: string;
  success: boolean;
  error?: string;
}

class ApiService {
  private baseUrl = 'http://localhost:8000'; // FastAPI backend

  async generateExplanation(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        slides: [],
        refinedPrompt: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async refinePrompt(originalPrompt: string, subject: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/refine-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          originalPrompt, 
          subject 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.refinedPrompt;
    } catch (error) {
      console.error('Prompt refinement error:', error);
      return originalPrompt; // Fallback to original
    }
  }

  async textToSpeech(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
