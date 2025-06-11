import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, X, SkipBack, SkipForward, Volume2, VolumeX, MessageSquare } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  commentary: string;
  voiceoverScript: string;
  audioUrl?: string;
}

interface CinemaModeProps {
  slides: Slide[];
  isLoading: boolean;
  onClose: () => void;
  onFollowUp: (question: string) => void;
}

const CinemaMode: React.FC<CinemaModeProps> = ({ slides, isLoading, onClose, onFollowUp }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [showFollowUpSection, setShowFollowUpSection] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transitionSfxRef = useRef<HTMLAudioElement | null>(null);

  // Initialize transition sound effect
  useEffect(() => {
    transitionSfxRef.current = new Audio('https://raw.githubusercontent.com/Panshief12/storyboard-ai-visions/main/447808__florianreichelt__swishes-and-swooshes.mp3');
    transitionSfxRef.current.volume = 0.3; // Lower volume for sfx
    
    return () => {
      if (transitionSfxRef.current) {
        transitionSfxRef.current = null;
      }
    };
  }, []);

  // Play transition sound effect
  const playTransitionSfx = () => {
    if (transitionSfxRef.current && !isMuted) {
      transitionSfxRef.current.currentTime = 0;
      transitionSfxRef.current.play().catch(error => {
        console.log('Transition SFX play error:', error);
      });
    }
  };

  // Detect if slides have audio to determine initial voiceover state
  useEffect(() => {
    if (slides.length > 0) {
      const hasAudio = slides.some(slide => slide.audioUrl);
      setVoiceoverEnabled(hasAudio);
    }
  }, [slides]);

  useEffect(() => {
    if (slides.length > 0 && !isLoading && voiceoverEnabled) {
      setIsPlaying(true);
      playCurrentSlideAudio();
    } else if (slides.length > 0 && !isLoading && !voiceoverEnabled) {
      setIsPlaying(true);
    }
  }, [slides, isLoading, voiceoverEnabled]);

  useEffect(() => {
    if (isPlaying && !isLoading && voiceoverEnabled) {
      playCurrentSlideAudio();
    } else {
      stopAudio();
    }
  }, [currentSlide, isPlaying, voiceoverEnabled]);

  // Show content with animation after slides load
  useEffect(() => {
    if (slides.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [slides, isLoading]);

  // Enhanced text highlighting function
  const highlightText = (text: string) => {
    // Keywords to highlight with different colors
    const highlights = {
      important: ['important', 'crucial', 'key', 'main', 'primary', 'essential', 'critical'],
      technical: ['algorithm', 'data', 'process', 'system', 'computer', 'AI', 'artificial intelligence', 'neural', 'network'],
      action: ['learn', 'analyze', 'process', 'understand', 'recognize', 'identify', 'generate', 'create'],
      emphasis: ['amazing', 'incredible', 'powerful', 'smart', 'intelligent', 'advanced', 'sophisticated']
    };

    let highlightedText = text;
    
    // Apply highlighting for each category
    Object.entries(highlights).forEach(([category, words]) => {
      words.forEach(word => {
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        const colorClass = {
          important: 'text-yellow-400 font-semibold',
          technical: 'text-blue-400 font-medium',
          action: 'text-green-400 font-medium',
          emphasis: 'text-purple-400 font-semibold'
        }[category];
        
        highlightedText = highlightedText.replace(regex, `<span class="${colorClass}">$1</span>`);
      });
    });

    return highlightedText;
  };

  // Helper function to advance slide with animation
  const advanceSlideWithAnimation = (nextSlideIndex: number) => {
    playTransitionSfx(); // Play sound effect
    setSlideDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(nextSlideIndex);
      setIsTransitioning(false);
    }, 250);
  };

  // Play audio for the current slide
  const playCurrentSlideAudio = () => {
    if (isMuted || !slides[currentSlide]?.audioUrl || !voiceoverEnabled) return;

    stopAudio();
    
    const audio = new Audio(slides[currentSlide].audioUrl);
    audioRef.current = audio;
    
    audio.onloadeddata = () => {
      console.log('Audio loaded for slide:', currentSlide);
    };
    
    audio.onplay = () => {
      setIsAudioPlaying(true);
      console.log('Audio started playing for slide:', currentSlide);
    };
    
    audio.onended = () => {
      setIsAudioPlaying(false);
      console.log('Audio ended for slide:', currentSlide);
      
      // Auto-advance to next slide with animation when audio finishes
      if (isPlaying && currentSlide < slides.length - 1) {
        setTimeout(() => {
          advanceSlideWithAnimation(currentSlide + 1);
        }, 500); // Small delay before advancing
      } else if (currentSlide >= slides.length - 1) {
        setIsPlaying(false);
      }
    };
    
    audio.onerror = (e) => {
      console.error('Audio error:', e);
      setIsAudioPlaying(false);
    };
    
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsAudioPlaying(false);
    });
  };

  // Stop audio playback
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsAudioPlaying(false);
  };

  // Move to the next slide
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      playTransitionSfx(); // Play sound effect
      advanceSlideWithAnimation(currentSlide + 1);
    } else {
      setIsPlaying(false);
    }
  };

  // Move to the previous slide
  const prevSlide = () => {
    if (currentSlide > 0) {
      playTransitionSfx(); // Play sound effect
      setSlideDirection('left');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsTransitioning(false);
      }, 250);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopAudio();
    } else if (isPlaying && voiceoverEnabled) {
      playCurrentSlideAudio();
    }
  };

  // Handle follow-up question submission
  const handleFollowUp = () => {
    if (followUpQuestion.trim()) {
      stopAudio();
      onFollowUp(followUpQuestion);
      setFollowUpQuestion('');
      setShowFollowUpSection(false);
    }
  };

  // Handle keyboard press for follow-up question submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFollowUp();
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-pixelify">
      {/* Header Controls */}
      <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 bg-gradient-to-b from-black/90 to-black/60 backdrop-blur-sm relative z-30 shrink-0">
        <div className="flex items-center space-x-2 md:space-x-4">
          <h1 className="text-base md:text-xl font-bold text-white">Visual AI Explainer</h1>
          {!isLoading && slides.length > 0 && (
            <div className="text-gray-300 flex items-center space-x-2 text-xs md:text-sm">
              <span>{currentSlide + 1} of {slides.length}</span>
              {voiceoverEnabled && isAudioPlaying && <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-green-400" />}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {!isLoading && slides.length > 0 && (
            <Button
              onClick={() => setShowFollowUpSection(!showFollowUpSection)}
              variant="ghost"
              size="sm"
              className={`text-white hover:bg-white/10 ${showFollowUpSection ? 'bg-white/20' : ''}`}
            >
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          )}
          {voiceoverEnabled && !isLoading && slides.length > 0 && (
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      </div>

      {/* Main Cinema Screen */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        {/* Navigation Buttons */}
        {!isLoading && slides.length > 0 && (
          <>
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              variant="ghost"
              size="lg"
              className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30 transition-all duration-200 z-20 h-12 w-12 md:h-16 md:w-16"
            >
              <SkipBack className="w-6 h-6 md:w-8 md:h-8" />
            </Button>

            <Button
              onClick={nextSlide}
              disabled={currentSlide >= slides.length - 1}
              variant="ghost"
              size="lg"
              className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30 transition-all duration-200 z-20 h-12 w-12 md:h-16 md:w-16"
            >
              <SkipForward className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </>
        )}

        {/* Content Container */}
        <div className="h-full flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="text-center space-y-4 md:space-y-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-white text-lg md:text-2xl font-medium">
                    Creating your visual story{voiceoverEnabled ? ' with voiceover' : ''}...
                  </p>
                  <p className="text-gray-400 text-sm md:text-base">
                    Generating images{voiceoverEnabled ? ' and audio' : ''} - this may take a moment
                  </p>
                </div>
              </div>
            ) : slides.length > 0 ? (
              <div className="w-full h-full flex flex-col">
                {/* Slide Container */}
                <div 
                  className={`w-full h-full flex flex-col transition-all duration-500 ease-out transform-gpu cursor-pointer ${
                    isTransitioning 
                      ? slideDirection === 'right' 
                        ? 'animate-slide-out-left' 
                        : 'translate-x-full opacity-0'
                      : 'translate-x-0 opacity-100'
                  } ${showContent ? 'animate-fade-in' : 'opacity-0'} hover:scale-[1.01]`}
                  onClick={togglePlay}
                >
                  
                  {/* Title Section */}
                  <div className="text-center py-4 md:py-6 shrink-0">
                    <div className={`transition-all duration-500 ease-out ${
                      showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}>
                      <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg font-pixelify px-2">
                        {slides[currentSlide]?.title}
                      </h2>
                    </div>
                  </div>
                  
                  {/* Visual Section */}
                  <div className="flex-1 flex items-center justify-center px-4 md:px-8 min-h-0">
                    {slides[currentSlide]?.imageUrl ? (
                      <div className={`relative transition-all duration-500 delay-200 ease-out transform-gpu w-full max-w-4xl ${
                        showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`}>
                        {/* White glow background */}
                        <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl scale-110 -z-10"></div>
                        <div className="absolute inset-0 bg-white/10 rounded-xl blur-2xl scale-125 -z-20"></div>
                        
                        <img 
                          src={slides[currentSlide].imageUrl} 
                          alt={slides[currentSlide].title}
                          className="relative w-full h-auto object-contain rounded-xl shadow-2xl"
                          style={{ 
                            maxHeight: '50vh',
                            aspectRatio: '16/9'
                          }}
                        />
                        {/* Play/Pause overlay indicator */}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl transition-opacity duration-200 ${
                          isPlaying ? 'opacity-0' : 'opacity-100'
                        }`}>
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/80 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[8px] md:border-l-[12px] border-l-black border-t-[6px] md:border-t-[8px] border-t-transparent border-b-[6px] md:border-b-[8px] border-b-transparent ml-1"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center">
                        <p className="text-gray-400">No image available</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Section */}
                  <div className="px-4 md:px-8 py-4 md:py-6 shrink-0">
                    <div className={`transition-all duration-500 delay-400 ease-out ${
                      showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 md:p-4 mx-auto max-w-3xl">
                        <p 
                          className="text-sm md:text-base lg:text-lg text-white leading-relaxed text-center font-pixelify font-medium"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(slides[currentSlide]?.voiceoverScript || '') 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-20">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-white text-lg md:text-xl">No slides generated yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up Section - Only shown when enabled */}
      {!isLoading && slides.length > 0 && showFollowUpSection && (
        <div className={`shrink-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-black/60 backdrop-blur-sm transition-all duration-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <div className="p-3 md:p-4 space-y-3">
                <h3 className="text-sm md:text-base font-semibold text-white font-pixelify">Continue the story</h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Textarea
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask for more details or explore another aspect..."
                    className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 font-pixelify text-sm"
                    rows={2}
                  />
                  <Button 
                    onClick={handleFollowUp}
                    disabled={!followUpQuestion.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 self-end transition-all duration-200"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaMode;

</edits_to_apply>
