
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
    "Explain quantum computing in simple terms",
    "How does photosynthesis work?",
    "Show me the water cycle process",
    "What causes climate change?",
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
    <div className="w-full max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center max-w-4xl mx-auto leading-tight tracking-tight">
            Discover the <span className="inline-block">📸</span> stories
            <br />
            behind top <span className="text-red-500">★</span> notch{" "}
            <span className="border-2 border-foreground rounded-full px-4 py-1 inline-block">design</span>.
          </h1>
        </div>
      </div>

      {/* Query Input with Controls */}
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="relative">
          <Textarea
            placeholder="How can Visual AI help you today?"
            value={query}
            onChange={handleQueryChange}
            onFocus={handleQueryFocus}
            onKeyDown={handleKeyPress}
            className="min-h-[100px] resize-none pr-20 pb-16 bg-card/50 border-border/20 placeholder:text-foreground"
            disabled={isLoading}
          />
          
          {/* Controls Row */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Style Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    <Palette className="w-3 h-3 mr-1" />
                    {artStyles.find(s => s.value === artStyle)?.label}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-popover border-border">
                  {artStyles.map((style) => (
                    <DropdownMenuItem 
                      key={style.value}
                      onClick={() => setArtStyle(style.value)}
                      className="flex flex-col items-start p-3"
                    >
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Voiceover Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    {voiceoverEnabled ? (
                      <Volume2 className="w-3 h-3 mr-1" />
                    ) : (
                      <VolumeX className="w-3 h-3 mr-1" />
                    )}
                    {voiceoverEnabled ? 'Audio On' : 'Audio Off'}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 bg-popover border-border">
                  <DropdownMenuItem 
                    onClick={() => onVoiceoverToggle(true)}
                    className="flex items-center p-3"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Audio On
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onVoiceoverToggle(false)}
                    className="flex items-center p-3"
                  >
                    <VolumeX className="w-4 h-4 mr-2" />
                    Audio Off
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Send Button */}
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8"
              onClick={handleSubmit}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-foreground">Visual AI with {voiceoverEnabled ? 'Voiceover' : 'Silent Mode'}</span>
          </div>
          <div className="text-xs">
            Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">shift + return</kbd> for new line
          </div>
        </div>
      </div>

      {/* Animated Suggestion Cards */}
      {showSuggestions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className={`p-3 cursor-pointer hover:bg-accent/50 transition-all duration-300 border border-border/20 bg-card/50 animate-fade-in`}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
              onClick={() => {
                setQuery(suggestion);
                setShowSuggestions(false);
              }}
            >
              <p className="text-sm text-left">{suggestion}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Refresh Prompts */}
      {!showSuggestions && (
        <div className="text-center animate-fade-in">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setQuery('');
              setShowSuggestions(true);
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Show suggestions
          </Button>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center">
        Visual AI can make mistakes. Please double-check responses.
      </p>
    </div>
  );
};

export default QuerySection;
