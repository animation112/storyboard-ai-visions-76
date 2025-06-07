
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, X } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  commentary: string;
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

  useEffect(() => {
    if (slides.length > 0 && !isLoading) {
      // Auto-start presentation when slides are loaded
      setIsPlaying(true);
    }
  }, [slides, isLoading]);

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

  const handleFollowUp = () => {
    if (followUpQuestion.trim()) {
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

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      {/* Close button */}
      <Button
        onClick={onClose}
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Cinema Screen */}
      <div className="w-full max-w-6xl mx-auto">
        <Card className="relative bg-gray-900 border-gray-700 shadow-2xl shadow-white/10">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-white text-xl">Generating visual explanation...</p>
                </div>
              </div>
            ) : slides.length > 0 ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-6 max-w-4xl">
                  {slides[currentSlide]?.imageUrl && (
                    <div className="mb-6">
                      <img 
                        src={slides[currentSlide].imageUrl} 
                        alt={slides[currentSlide].title}
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {slides[currentSlide]?.title}
                  </h2>
                  <div className="text-lg text-gray-300 leading-relaxed">
                    {slides[currentSlide]?.content}
                  </div>
                  {slides[currentSlide]?.commentary && (
                    <div className="text-base text-gray-400 italic mt-4 border-l-4 border-blue-500 pl-4">
                      {slides[currentSlide].commentary}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white text-xl">No slides generated yet</p>
              </div>
            )}

            {/* Navigation arrows */}
            {!isLoading && slides.length > 0 && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide >= slides.length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-30"
                >
                  →
                </button>
              </>
            )}
          </div>

          {/* Slide indicator */}
          {!isLoading && slides.length > 0 && (
            <div className="flex justify-center space-x-2 p-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Follow-up questions section */}
        {!isLoading && slides.length > 0 && (
          <div className="mt-6">
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold text-white">Ask a follow-up question</h3>
                <div className="flex space-x-3">
                  <Textarea
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask for more details, clarification, or explore a different aspect..."
                    className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none"
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
        )}
      </div>
    </div>
  );
};

export default CinemaMode;
