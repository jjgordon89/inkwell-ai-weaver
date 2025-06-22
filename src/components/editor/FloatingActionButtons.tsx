
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Zap } from 'lucide-react';

interface CursorPosition {
  x: number;
  y: number;
}

interface FloatingActionButtonsProps {
  show: boolean;
  position: CursorPosition;
  onContinue: () => void;
  onImprove: () => void;
}

const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  show,
  position,
  onContinue,
  onImprove
}) => {
  if (!show) return null;

  return (
    <div
      className="absolute z-40 flex items-center gap-1 bg-background/90 backdrop-blur-sm border rounded-lg p-1 shadow-lg"
      style={{
        left: Math.min(position.x, window.innerWidth - 200),
        top: Math.max(position.y - 40, 10)
      }}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={onContinue}
        className="h-6 px-2 text-xs"
        title="Continue writing"
      >
        <Zap className="h-3 w-3 mr-1" />
        Continue
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onImprove}
        className="h-6 px-2 text-xs"
        title="Improve previous text"
      >
        <Wand2 className="h-3 w-3 mr-1" />
        Improve
      </Button>
    </div>
  );
};

export default FloatingActionButtons;
