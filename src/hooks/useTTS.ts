
import { useState, useCallback } from 'react';

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    try {
      // For now, we'll use the Web Speech API as a fallback
      if ('speechSynthesis' in window) {
        // Stop current speech if playing
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }

        setIsPlaying(true);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          console.error('Speech synthesis failed');
        };

        speechSynthesis.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported in this browser');
      }
    } catch (error) {
      setIsPlaying(false);
      console.error('TTS Error:', error);
    }
  }, [currentAudio]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  }, [currentAudio]);

  return { speak, stop, isPlaying };
};
