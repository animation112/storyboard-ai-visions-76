
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    } else if (isPlaying && voiceoverEnabled) {
      playCurrentSlideAudio();
    }
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
      {/* Header Controls */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent relative z-10">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">Visual AI Explainer</h1>
          {!isLoading && slides.length > 0 && (
            <div className="text-gray-300 flex items-center space-x-2">
              <span>{currentSlide + 1} of {slides.length}</span>
              {voiceoverEnabled && isAudioPlaying && <Volume2 className="w-4 h-4 text-green-400" />}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Cinema Screen */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-7xl">
          {isLoading ? (
            <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-white text-2xl font-medium">
                  Creating your visual story{voiceoverEnabled ? ' with voiceover' : ''}...
                </p>
                <p className="text-gray-400">
                  Generating images{voiceoverEnabled ? ' and audio' : ''} - this may take a moment
                </p>
              </div>
            </div>
          ) : slides.length > 0 ? (
            <Card className="aspect-video bg-gradient-to-br from-gray-900 to-black border-gray-700 shadow-2xl rounded-2xl overflow-hidden">
              <div className="h-full relative">
                {/* Slide Content */}
                <div className="h-full flex">
                  {/* Image Section */}
                  <div className="flex-1 flex items-center justify-center p-8">
                    {slides[currentSlide]?.imageUrl ? (
                      <img 
                        src={slides[currentSlide].imageUrl} 
                        alt={slides[currentSlide].title}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                        <p className="text-gray-400">No image available</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Section */}
                  <div className="flex-1 p-8 flex flex-col justify-center">
                    <div className="space-y-6">
                      <h2 className="text-4xl font-bold text-white leading-tight">
                        {slides[currentSlide]?.title}
                      </h2>
                      
                      {/* Show detailed explanation text only when voiceover is disabled OR as the main content */}
                      {voiceoverEnabled ? (
                        // When voiceover is enabled, show the voiceover script as text content
                        <div className="space-y-4">
                          <p className="text-xl text-gray-300 leading-relaxed">
                            {slides[currentSlide]?.voiceoverScript}
                          </p>
                        </div>
                      ) : (
                        // When voiceover is disabled, show detailed explanation
                        <div className="space-y-4">
                          <p className="text-xl text-gray-300 leading-relaxed">
                            {slides[currentSlide]?.voiceoverScript}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
                  <Button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    onClick={togglePlay}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  {voiceoverEnabled && (
                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  )}
                  
                  <Button
                    onClick={nextSlide}
                    disabled={currentSlide >= slides.length - 1}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          ) : (
            <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
              <p className="text-white text-xl">No slides generated yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Section */}
      {!isLoading && slides.length > 0 && (
        <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Continue the story</h3>
                <div className="flex space-x-4">
                  <Textarea
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask for more details or explore another aspect..."
                    className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <Button 
                    onClick={handleFollowUp}
                    disabled={!followUpQuestion.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 self-end"
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
