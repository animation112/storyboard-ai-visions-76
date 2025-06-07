
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowUp, Star } from 'lucide-react';

interface QuerySectionProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

const QuerySection: React.FC<QuerySectionProps> = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const exampleQueries = [
    "How might we solve world hunger?",
    "How can we make flying cars safe?",
    "How to teach cats to use smartphones?",
    "How might we colonize Mars?"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Visual AI Explainer
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Transform any impossible problem into an engaging visual explanation with AI-generated animations and storytelling
        </p>
      </div>

      <Card className="relative bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <div className="p-6 space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe an impossible problem you'd like me to solve visually..."
            className="min-h-32 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Press Enter to submit, Shift+Enter for new line
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={!query.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ArrowUp className="w-4 h-4" />
                  <span>Explain Visually</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-300 flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Try these examples:</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exampleQueries.map((example, index) => (
            <Card 
              key={index}
              className="p-4 bg-gray-800/30 border-gray-700 hover:bg-gray-700/30 cursor-pointer transition-all duration-200 hover:border-gray-600"
              onClick={() => setQuery(example)}
            >
              <p className="text-gray-300 text-sm">{example}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuerySection;
