import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Brain, RefreshCw, ChevronDown, Paperclip, Send } from "lucide-react";
import CinemaMode from '../components/CinemaMode';
import AnimatedCharacter from '../components/AnimatedCharacter';
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
  const [message, setMessage] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCinema, setShowCinema] = useState(false);
  const [characterPosition, setCharacterPosition] = useState({ x: 100, y: 100 });
  const [characterMessage, setCharacterMessage] = useState<string>('');
  const [isCharacterActive, setIsCharacterActive] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  
  const { speak, stop, isPlaying } = useTTS();

  const suggestions = [
    "Explain quantum computing in simple terms",
    "How does photosynthesis work?",
    "Show me the water cycle process",
    "What causes climate change?",
  ];

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

  const handleQuerySubmit = async (query: string) => {
    setIsLoading(true);
    setIsCharacterActive(true);
    setCharacterMessage(voiceoverEnabled ? "Let me create your visual story with voiceover..." : "Let me create your visual story...");
    
    try {
      toast.info(voiceoverEnabled ? "Generating visual explanation with voiceover..." : "Generating visual explanation...");
      
      const response = await apiService.generateExplanation({
        prompt: query,
        voiceoverEnabled: voiceoverEnabled
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

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      handleQuerySubmit(message);
      setMessage("");
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
      <header className="flex items-center justify-between p-4 border-b border-border/10">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span className="font-semibold">Visual AI</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center p-4 max-w-4xl mx-auto relative">
        <div className="flex flex-col items-center text-center space-y-4 w-full pt-6">
          {/* Gradient Orb */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 orb-glow animate-pulse" />
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-t from-transparent to-white/20" />
          </div>

          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Good evening</h1>
            <h2 className="text-xl text-muted-foreground">How can I visualize your ideas?</h2>
          </div>

          {/* Input Area - Moved up */}
          <div className="w-full max-w-3xl space-y-4 pt-2">
            <div className="relative">
              <Textarea
                placeholder="How can Visual AI help you today?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-[100px] resize-none pr-20 pb-12 bg-card/50 border-border/20"
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8"
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Model Selector */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Visual AI with {voiceoverEnabled ? 'Voiceover' : 'Silent Mode'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVoiceoverEnabled(!voiceoverEnabled)}
                  className="h-auto p-1 text-xs"
                >
                  {voiceoverEnabled ? 'Disable Audio' : 'Enable Audio'}
                </Button>
              </div>
              <div className="text-xs">
                Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">shift + return</kbd> for new line
              </div>
            </div>
          </div>

          {/* Suggestion Cards - Moved below input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl pt-2">
            {suggestions.map((suggestion, index) => (
              <Card
                key={index}
                className="p-3 cursor-pointer hover:bg-accent/50 transition-colors border border-border/20 bg-card/50"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <p className="text-sm text-left">{suggestion}</p>
              </Card>
            ))}
          </div>

          {/* Refresh Prompts */}
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh prompts
          </Button>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Visual AI can make mistakes. Please double-check responses.
          </p>
        </div>
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
