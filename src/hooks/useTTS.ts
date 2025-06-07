
import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      setIsPlaying(true);
      const audioUrl = await apiService.textToSpeech(text);
      const audio = new Audio(audioUrl);
      
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        console.error('Audio playback failed');
      };

      await audio.play();
    } catch (error) {
      setIsPlaying(false);
      console.error('TTS Error:', error);
    }
  }, [currentAudio]);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  }, [currentAudio]);

  return { speak, stop, isPlaying };
};
