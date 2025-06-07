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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(false);
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
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsTransitioning(false);
      }, 150);
    } else {
      setIsPlaying(false);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsTransitioning(false);
      }, 150);
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
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Clean Header */}
      <div className="flex items-center justify-between p-8 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wide">Tutorial:</div>
          {!isLoading && slides.length > 0 && (
            <div className="text-gray-500 text-sm flex items-center space-x-2">
              <span>{currentSlide + 1} of {slides.length}</span>
              {voiceoverEnabled && isAudioPlaying && <Volume2 className="w-4 h-4 text-blue-500" />}
            </div>
          )}
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {isLoading ? (
            <div className="text-center space-y-8">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Creating your visual story{voiceoverEnabled ? ' with voiceover' : ''}...
                </h2>
                <p className="text-gray-600">
                  Generating images{voiceoverEnabled ? ' and audio' : ''} - this may take a moment
                </p>
              </div>
            </div>
          ) : slides.length > 0 ? (
            <div className="space-y-8">
              {/* Title Section */}
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {slides[currentSlide]?.title}
                </h1>
              </div>

              {/* Image Card */}
              <div className={`relative transition-all duration-500 ease-out ${
                isTransitioning ? 'opacity-70 scale-95' : 'opacity-100 scale-100'
              } ${showContent ? 'animate-fade-in' : 'opacity-0'}`}>
                <Card className="overflow-hidden bg-white shadow-lg border border-gray-200">
                  <div className="aspect-video relative">
                    {slides[currentSlide]?.imageUrl ? (
                      <img 
                        src={slides[currentSlide].imageUrl} 
                        alt={slides[currentSlide].title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-400">No image available</p>
                      </div>
                    )}
                    
                    {/* Navigation Controls Overlay */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-black/60 backdrop-blur-sm rounded-full px-6 py-3">
                      <Button
                        onClick={() => {
                          if (currentSlide > 0) {
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setCurrentSlide(currentSlide - 1);
                              setIsTransitioning(false);
                            }, 150);
                          }
                        }}
                        disabled={currentSlide === 0}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 disabled:opacity-30"
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      {voiceoverEnabled && (
                        <Button
                          onClick={() => {
                            setIsMuted(!isMuted);
                            if (!isMuted) {
                              if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                                audioRef.current = null;
                              }
                              setIsAudioPlaying(false);
                            } else if (isPlaying && voiceoverEnabled) {
                              // Restart audio logic here
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => {
                          if (currentSlide < slides.length - 1) {
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setCurrentSlide(currentSlide + 1);
                              setIsTransitioning(false);
                            }, 150);
                          } else {
                            setIsPlaying(false);
                          }
                        }}
                        disabled={currentSlide >= slides.length - 1}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 disabled:opacity-30"
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Explanation Text */}
              <div className={`text-center transition-all duration-500 delay-200 ease-out ${
                showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  {slides[currentSlide]?.voiceoverScript}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl text-gray-500">No slides generated yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Section */}
      {!isLoading && slides.length > 0 && (
        <div className={`p-8 bg-white/80 backdrop-blur-sm border-t border-gray-200 transition-all duration-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Continue the story</h3>
                <div className="flex space-x-4">
                  <Textarea
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (followUpQuestion.trim()) {
                          if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                            audioRef.current = null;
                          }
                          setIsAudioPlaying(false);
                          onFollowUp(followUpQuestion);
                          setFollowUpQuestion('');
                        }
                      }
                    }}
                    placeholder="Ask for more details or explore another aspect..."
                    className="flex-1 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <Button 
                    onClick={() => {
                      if (followUpQuestion.trim()) {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                          audioRef.current = null;
                        }
                        setIsAudioPlaying(false);
                        onFollowUp(followUpQuestion);
                        setFollowUpQuestion('');
                      }
                    }}
                    disabled={!followUpQuestion.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 self-end"
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
