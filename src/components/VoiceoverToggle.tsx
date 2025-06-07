
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceoverToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const VoiceoverToggle: React.FC<VoiceoverToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
      {isEnabled ? (
        <Volume2 className="w-5 h-5 text-green-400" />
      ) : (
        <VolumeX className="w-5 h-5 text-gray-400" />
      )}
      <span className="text-white text-sm font-medium">
        {isEnabled ? 'Voiceover Enabled' : 'Text Only Mode'}
      </span>
      <Switch
        checked={isEnabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-green-600"
      />
    </div>
  );
};

export default VoiceoverToggle;
