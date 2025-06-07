import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (slides.length > 0 && !isLoading) {
      setIsPlaying(true);
      playCurrentSlideAudio();
    }
  }, [slides, isLoading]);

  useEffect(() => {
    if (isPlaying && !isLoading) {
      playCurrentSlideAudio();
    } else {
      stopAudio();
    }
  }, [currentSlide, isPlaying]);

  const playCurrentSlideAudio = () => {
    if (isMuted || !slides[currentSlide]?.audioUrl) return;

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
      
      // Auto-advance to next slide when audio finishes
      if (isPlaying && currentSlide < slides.length - 1) {
        setTimeout(() => {
          setCurrentSlide(prev => prev + 1);
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

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsAudioPlaying(false);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopAudio();
    } else if (isPlaying) {
      playCurrentSlideAudio();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleFollowUp = () => {
    if (followUpQuestion.trim()) {
      stopAudio();
      onFollowUp(followUpQuestion);
      setFollowUpQuestion('');
    }
  };

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
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header Controls - Hidden in fullscreen */}
      {!isFullscreen && (
        <div className="flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent relative z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Visual AI Explainer</h1>
            {!isLoading && slides.length > 0 && (
              <div className="text-gray-300 flex items-center space-x-2">
                <span>{currentSlide + 1} of {slides.length}</span>
                {isAudioPlaying && <Volume2 className="w-4 h-4 text-green-400" />}
              </div>
            )}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Main Cinema Screen */}
      <div className={`flex-1 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-8'}`}>
        <div className="w-full max-w-7xl relative">
          {isLoading ? (
            <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-white text-2xl font-medium">Creating your visual story with voiceover...</p>
                <p className="text-gray-400">Generating images and audio - this may take a moment</p>
              </div>
            </div>
          ) : slides.length > 0 ? (
            <div className={`relative ${isFullscreen ? 'h-screen' : 'aspect-video'}`}>
              {/* Beveled Card Container */}
              <div className={`
                ${isFullscreen ? 'h-full w-full' : 'h-full w-full rounded-3xl'}
                bg-gradient-to-br from-gray-100 to-gray-200 
                shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)]
                relative overflow-hidden
              `}>
                {/* Image with Glow and Animation */}
                <div className="h-full w-full flex items-center justify-center p-8 relative">
                  {slides[currentSlide]?.imageUrl ? (
                    <div className="relative max-w-full max-h-full">
                      {/* Glowing background */}
                      <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-30 animate-pulse" />
                      
                      {/* Main image */}
                      <img 
                        src={slides[currentSlide].imageUrl} 
                        alt={slides[currentSlide].title}
                        className="
                          relative z-10 max-w-full max-h-full object-contain rounded-2xl 
                          shadow-[0_0_50px_rgba(255,255,255,0.3)]
                          animate-[float_3s_ease-in-out_infinite]
                          transition-all duration-1000
                        "
                        style={{
                          filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
                        }}
                      />
                      
                      {/* Additional glow effects */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-white/30 to-purple-400/20 rounded-3xl blur-2xl animate-[glow_2s_ease-in-out_infinite_alternate]" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                      <p className="text-gray-400">No image available</p>
                    </div>
                  )}
                </div>

                {/* Fullscreen Toggle Button */}
                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 bg-white/20 backdrop-blur-sm rounded-full p-2"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>

                {/* Navigation Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/20 backdrop-blur-sm rounded-full px-6 py-3">
                  <Button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-white/20 disabled:opacity-30"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    onClick={togglePlay}
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    onClick={nextSlide}
                    disabled={currentSlide >= slides.length - 1}
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-white/20 disabled:opacity-30"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/20">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
              <p className="text-white text-xl">No slides generated yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Extended Follow-up Section - Hidden in fullscreen */}
      {!isFullscreen && !isLoading && slides.length > 0 && (
        <div className="relative">
          {/* Beveled extension */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-3xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]" />
          
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)] p-8">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Continue the Story</h3>
                  <p className="text-gray-600">Ask for more details or explore another aspect...</p>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Textarea
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="What would you like to explore next?"
                      className="
                        bg-white/60 backdrop-blur-sm border-2 border-gray-300/50 
                        text-gray-800 placeholder-gray-500 resize-none 
                        focus:ring-2 focus:ring-blue-400 focus:border-transparent
                        rounded-2xl p-4 min-h-[100px]
                        shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
                      "
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleFollowUp}
                    disabled={!followUpQuestion.trim()}
                    className="
                      bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                      text-white border-0 self-end rounded-2xl px-8 py-4
                      shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.8)]
                      hover:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.9)]
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaMode;
