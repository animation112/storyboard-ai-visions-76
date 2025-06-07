
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, Sparkles, Volume2, VolumeX, Palette } from 'lucide-react';

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
    "Explain how photosynthesis works",
    "How do computers process information?",
    "What causes the northern lights?",
    "How does the human immune system work?",
    "Explain quantum entanglement simply"
  ];

  const artStyles = [
    {
      value: 'cute-minimal-watercolor',
      label: 'Cute Minimal',
      description: 'Fun cat stories with watercolor illustrations'
    },
    {
      value: 'dark-surreal',
      label: 'Conceptual Commentary',
      description: 'Social commentary through symbolic illustrations'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/20 rounded-full border border-blue-500/30">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-blue-300 font-medium">AI Visual Explainer</span>
        </div>
        
        <h1 className="text-5xl font-bold text-white leading-tight">
          Turn complex topics into
          <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            visual stories
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Get AI-generated visual explanations with illustrations and detailed explanations 
          that make any concept easy to understand
        </p>
      </div>

      {/* Options Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Voiceover Toggle */}
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-3">
                {voiceoverEnabled ? (
                  <Volume2 className="w-6 h-6 text-green-400" />
                ) : (
                  <VolumeX className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <h3 className="text-white font-medium">
                    {voiceoverEnabled ? 'Voiceover Enabled' : 'Voiceover Disabled'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {voiceoverEnabled 
                      ? 'Audio narration included' 
                      : 'Text explanations only'
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={() => onVoiceoverToggle(!voiceoverEnabled)}
                variant={voiceoverEnabled ? "default" : "outline"}
                className={voiceoverEnabled 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
                }
              >
                {voiceoverEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Art Style Selector */}
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-3">
                <Palette className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-white font-medium">Visual Style</h3>
                  <p className="text-sm text-gray-400">
                    Choose illustration style
                  </p>
                </div>
              </div>
              <Select value={artStyle} onValueChange={setArtStyle}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {artStyles.map((style) => (
                    <SelectItem 
                      key={style.value} 
                      value={style.value}
                      className="text-white hover:bg-gray-700"
                    >
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-gray-400">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Query Input */}
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700 shadow-2xl">
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-lg font-medium text-white block">
              What would you like explained?
            </label>
            <div className="relative">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to explain anything... 'How does gravity work?' or 'Explain machine learning'"
                className="min-h-[120px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 text-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={handleSubmit}
                disabled={!query.trim() || isLoading}
                className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-full w-12 h-12 p-0"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(suggestion)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">AI-Generated Visuals</h3>
          <p className="text-gray-400 text-sm">
            Custom illustrations created for your specific topic
          </p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
            <Palette className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Multiple Styles</h3>
          <p className="text-gray-400 text-sm">
            Choose between cute minimal or dark surreal visual styles
          </p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
            {voiceoverEnabled ? (
              <Volume2 className="w-6 h-6 text-green-400" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-white">
            {voiceoverEnabled ? 'Audio Narration' : 'Detailed Text'}
          </h3>
          <p className="text-gray-400 text-sm">
            {voiceoverEnabled ? 'AI-generated voice narration' : 'Comprehensive text explanations'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuerySection;
