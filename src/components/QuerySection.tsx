
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUp, Sparkles, Volume2, VolumeX, Palette, ChevronDown, RefreshCw } from 'lucide-react';

interface QuerySectionProps {
  onSubmit: (query: string, artStyle?: string) => void;
  isLoading: boolean;
  voiceoverEnabled: boolean;
  onVoiceoverToggle: (enabled: boolean) => void;
}

const QuerySection: React.FC<QuerySectionProps> = ({ 
  onSubmit, 
  isLoading, 
  voiceoverEnabled, 
  onVoiceoverToggle 
}) => {
  const [query, setQuery] = useState('');
  const [artStyle, setArtStyle] = useState('cute-minimal-watercolor');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSubmit(query.trim(), artStyle);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim()) {
      setShowSuggestions(false);
    }
  };

  const handleQueryFocus = () => {
    if (query.trim()) {
      setShowSuggestions(false);
    }
  };

  const suggestions = [
    "Explain how rockets work 🚀",
    "Show me how photosynthesis works 🌱", 
    "What is artificial intelligence? 🤖",
    "How do rainbows form? 🌈",
  ];

  const artStyles = [
    {
      value: 'cute-minimal-watercolor',
      label: 'Cute Minimal',
      description: 'Fun watercolor illustrations'
    },
    {
      value: 'dark-surreal',
      label: 'Dark Surreal',
      description: 'Conceptual symbolic art'
    },
    {
      value: 'atmospheric-gradient-grain',
      label: 'Atmospheric',
      description: 'Dreamy gradient textures'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Query Input with Controls */}
      <div className="w-full space-y-4">
        <div className="relative">
          <Textarea
            placeholder="What would you like to learn about today? ✨"
            value={query}
            onChange={handleQueryChange}
            onFocus={handleQueryFocus}
            onKeyDown={handleKeyPress}
            className="min-h-[120px] resize-none pr-20 pb-16 bg-white border-2 border-border rounded-2xl text-lg shadow-playful focus:shadow-lg transition-all"
            disabled={isLoading}
          />
          
          {/* Controls Row */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Style Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-9 text-sm rounded-full shadow-cute">
                    <Palette className="w-4 h-4 mr-2" />
                    {artStyles.find(s => s.value === artStyle)?.label}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white border-2 border-border rounded-xl shadow-playful">
                  {artStyles.map((style) => (
                    <DropdownMenuItem 
                      key={style.value}
                      onClick={() => setArtStyle(style.value)}
                      className="flex flex-col items-start p-3 rounded-lg hover:bg-muted"
                    >
                      <div className="font-medium text-foreground">{style.label}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Voiceover Toggle */}
              <Button 
                variant={voiceoverEnabled ? "default" : "outline"} 
                size="sm" 
                className="h-9 text-sm rounded-full shadow-cute"
                onClick={() => onVoiceoverToggle(!voiceoverEnabled)}
              >
                {voiceoverEnabled ? (
                  <Volume2 className="w-4 h-4 mr-2" />
                ) : (
                  <VolumeX className="w-4 h-4 mr-2" />
                )}
                {voiceoverEnabled ? 'Audio On' : 'Audio Off'}
              </Button>
            </div>

            {/* Send Button */}
            <Button 
              size="sm"
              className="h-10 w-16 button-gradient rounded-full shadow-playful hover:shadow-lg transition-all font-semibold"
              onClick={handleSubmit}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Big Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="button-gradient text-white font-semibold text-lg px-8 py-6 rounded-full shadow-playful hover:shadow-lg transition-all animate-bounce-gentle"
            onClick={handleSubmit}
            disabled={isLoading || !query.trim()}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            GET STARTED
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-primary text-primary font-semibold text-lg px-8 py-6 rounded-full shadow-cute hover:bg-primary hover:text-white transition-all"
            onClick={() => {
              setQuery('');
              setShowSuggestions(true);
            }}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            I ALREADY HAVE AN IDEA
          </Button>
        </div>
      </div>

      {/* Animated Suggestion Cards */}
      {showSuggestions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className={`p-4 cursor-pointer hover:bg-accent/20 transition-all duration-300 border-2 border-border bg-white rounded-2xl shadow-cute hover:shadow-playful animate-fade-in`}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
              onClick={() => {
                setQuery(suggestion);
                setShowSuggestions(false);
              }}
            >
              <p className="text-sm text-left font-medium text-foreground">{suggestion}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Visual AI can make mistakes. Please double-check responses.
      </p>
    </div>
  );
};

export default QuerySection;
