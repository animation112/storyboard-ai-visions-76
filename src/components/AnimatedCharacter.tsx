
import React, { useEffect, useRef } from 'react';

interface AnimatedCharacterProps {
  isActive: boolean;
  position: { x: number; y: number };
  message?: string;
}

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ isActive, position, message }) => {
  const characterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (characterRef.current) {
      characterRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
  }, [position]);

  return (
    <div
      ref={characterRef}
      className={`fixed w-16 h-16 transition-all duration-1000 ease-in-out z-40 ${
        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
      style={{ 
        left: 0, 
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      {/* Animated circle character with gradient */}
      <div className="relative">
        <div 
          className="w-16 h-16 rounded-full shadow-lg animate-pulse"
          style={{
            background: 'linear-gradient(180deg, #312e81 0%, #581c87 50%, #000000 100%)'
          }}
        >
          {/* Eyes */}
          <div className="absolute top-4 left-3 w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-4 right-3 w-2 h-2 bg-white rounded-full" />
          
          {/* Mouth */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-3 border-b-2 border-white rounded-full" />
        </div>

        {/* Speech bubble */}
        {message && isActive && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs p-2 rounded-lg shadow-lg whitespace-nowrap max-w-48 text-center">
            {message}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
          </div>
        )}

        {/* Floating effect with gradient colors */}
        <div 
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: 'linear-gradient(180deg, rgba(49, 46, 129, 0.2) 0%, rgba(88, 28, 135, 0.2) 50%, rgba(0, 0, 0, 0.2) 100%)'
          }}
        />
      </div>
    </div>
  );
};

export default AnimatedCharacter;
