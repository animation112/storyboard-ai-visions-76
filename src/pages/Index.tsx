
import React, { useState, useEffect } from 'react';
import { ThemeToggle } from "@/components/ThemeToggle";
import { Brain } from "lucide-react";
import CinemaMode from '../components/CinemaMode';
import AnimatedCharacter from '../components/AnimatedCharacter';
import QuerySection from '../components/QuerySection';
import { apiService } from '../services/apiService';
import { useTTS } from '../hooks/useTTS';
import { toast } from 'sonner';

interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  commentary: string;
  voiceoverScript: string;
  audioUrl?: string;
}

const Index = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCinema, setShowCinema] = useState(false);
  const [characterPosition, setCharacterPosition] = useState({ x: 100, y: 100 });
  const [characterMessage, setCharacterMessage] = useState<string>('');
  const [isCharacterActive, setIsCharacterActive] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  
  const { speak, stop, isPlaying } = useTTS();

  // Animate character movement
  useEffect(() => {
    const interval = setInterval(() => {
      if (isCharacterActive && !showCinema) {
        setCharacterPosition(prev => ({
          x: Math.max(50, Math.min(window.innerWidth - 100, prev.x + (Math.random() - 0.5) * 100)),
          y: Math.max(50, Math.min(window.innerHeight - 100, prev.y + (Math.random() - 0.5) * 100))
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isCharacterActive, showCinema]);

  const handleQuerySubmit = async (query: string, artStyle?: string) => {
    setIsLoading(true);
    setIsCharacterActive(true);
    setCharacterMessage(voiceoverEnabled ? "Let me create your visual story with voiceover..." : "Let me create your visual story...");
    
    try {
      toast.info(voiceoverEnabled ? "Generating visual explanation with voiceover..." : "Generating visual explanation...");
      
      const response = await apiService.generateExplanation({
        prompt: query,
        voiceoverEnabled: voiceoverEnabled,
        artStyle: artStyle
      });

      if (response.success && response.slides.length > 0) {
        setSlides(response.slides);
        setShowCinema(true);
        setCharacterMessage(voiceoverEnabled ? "Your visual story with voiceover is ready!" : "Your visual story is ready!");
        toast.success(voiceoverEnabled ? "Visual explanation with voiceover generated!" : "Visual explanation generated!");
      } else {
        toast.error(response.error || "Failed to generate explanation");
        setCharacterMessage("Oops! Something went wrong.");
      }
    } catch (error) {
      console.error('Error generating explanation:', error);
      toast.error("Failed to connect to the AI service");
      setCharacterMessage("I'm having trouble connecting...");
    } finally {
      setIsLoading(false);
      setTimeout(() => setCharacterMessage(''), 3000);
    }
  };

  const handleFollowUp = async (question: string) => {
    setIsLoading(true);
    setCharacterMessage(voiceoverEnabled ? "Let me create more content with voiceover..." : "Let me create more content...");
    
    try {
      const response = await apiService.generateExplanation({
        prompt: question,
        voiceoverEnabled: voiceoverEnabled
      });

      if (response.success && response.slides.length > 0) {
        setSlides(prev => [...prev, ...response.slides]);
        toast.success(voiceoverEnabled ? "Follow-up explanation with voiceover added!" : "Follow-up explanation added!");
      } else {
        toast.error("Failed to generate follow-up explanation");
      }
    } catch (error) {
      console.error('Error generating follow-up:', error);
      toast.error("Failed to generate follow-up explanation");
    } finally {
      setIsLoading(false);
      setCharacterMessage('');
    }
  };

  const handleCloseCinema = () => {
    setShowCinema(false);
    setSlides([]);
    setIsCharacterActive(false);
    stop(); // Stop any playing audio
  };

  if (showCinema) {
    return (
      <CinemaMode
        slides={slides}
        isLoading={isLoading}
        onClose={handleCloseCinema}
        onFollowUp={handleFollowUp}
      />
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border/10 backdrop-blur-sm bg-background/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Visual AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-88px)] p-6">
        <QuerySection
          onSubmit={handleQuerySubmit}
          isLoading={isLoading}
          voiceoverEnabled={voiceoverEnabled}
          onVoiceoverToggle={setVoiceoverEnabled}
        />
      </main>

      {/* Animated Character */}
      <AnimatedCharacter
        isActive={isCharacterActive}
        position={characterPosition}
        message={characterMessage}
      />
    </div>
  );
};

export default Index;
