
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
    <div className="w-full max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-8">
        {/* Enhanced Gradient Orb */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 orb-glow animate-pulse mx-auto shadow-2xl" />
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-t from-transparent to-white/30 mx-auto" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Good evening
          </h1>
          <h2 className="text-2xl font-medium text-slate-300">
            How can I <span className="text-emerald-400 font-semibold">visualize</span> your ideas?
          </h2>
        </div>
      </div>

      {/* Query Input with Enhanced Controls */}
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="relative">
          <Textarea
            placeholder="How can Visual AI help you today?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[120px] resize-none pr-20 pb-20 bg-card/60 backdrop-blur-sm border-border/30 focus:border-emerald-400/50 focus:ring-emerald-400/25 text-lg placeholder:text-muted-foreground/70"
            disabled={isLoading}
          />
          
          {/* Enhanced Controls Row */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Enhanced Style Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 text-sm bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 text-slate-200">
                    <Palette className="w-4 h-4 mr-2 text-purple-400" />
                    <span className="text-purple-300">{artStyles.find(s => s.value === artStyle)?.label}</span>
                    <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 bg-slate-900/95 backdrop-blur-sm border-slate-700/50">
                  {artStyles.map((style) => (
                    <DropdownMenuItem 
                      key={style.value}
                      onClick={() => setArtStyle(style.value)}
                      className="flex flex-col items-start p-4 hover:bg-slate-800/50 text-slate-200"
                    >
                      <div className="font-medium text-purple-300">{style.label}</div>
                      <div className="text-xs text-slate-400">{style.description}</div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Enhanced Voiceover Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 text-sm bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 text-slate-200">
                    {voiceoverEnabled ? (
                      <Volume2 className="w-4 h-4 mr-2 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 mr-2 text-red-400" />
                    )}
                    <span className={voiceoverEnabled ? 'text-emerald-300' : 'text-red-300'}>
                      {voiceoverEnabled ? 'Audio On' : 'Audio Off'}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44 bg-slate-900/95 backdrop-blur-sm border-slate-700/50">
                  <DropdownMenuItem 
                    onClick={() => onVoiceoverToggle(true)}
                    className="flex items-center p-3 hover:bg-slate-800/50 text-slate-200"
                  >
                    <Volume2 className="w-4 h-4 mr-3 text-emerald-400" />
                    <span className="text-emerald-300">Audio On</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onVoiceoverToggle(false)}
                    className="flex items-center p-3 hover:bg-slate-800/50 text-slate-200"
                  >
                    <VolumeX className="w-4 h-4 mr-3 text-red-400" />
                    <span className="text-red-300">Audio Off</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Enhanced Send Button */}
            <Button 
              size="icon" 
              className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
              onClick={handleSubmit}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-5 h-5 text-white" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Helper Text */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">
              Visual AI with{' '}
              <span className={voiceoverEnabled ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                {voiceoverEnabled ? 'Voiceover' : 'Silent Mode'}
              </span>
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Use <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-xs text-slate-300">shift + return</kbd> for new line
          </div>
        </div>
      </div>

      {/* Enhanced Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
        {suggestions.map((suggestion, index) => (
          <Card
            key={index}
            className="p-4 cursor-pointer hover:bg-slate-800/30 transition-all duration-200 border border-slate-700/30 bg-slate-900/20 backdrop-blur-sm hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
            onClick={() => setQuery(suggestion)}
          >
            <p className="text-sm text-left text-slate-200">{suggestion}</p>
          </Card>
        ))}
      </div>

      {/* Enhanced Refresh Prompts */}
      <div className="text-center">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-emerald-400 hover:bg-slate-800/30 transition-colors">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh prompts
        </Button>
      </div>

      {/* Enhanced Footer */}
      <p className="text-xs text-slate-500 text-center">
        Visual AI can make mistakes. Please <span className="text-emerald-400">double-check</span> responses.
      </p>
    </div>
  );
};

export default QuerySection;
