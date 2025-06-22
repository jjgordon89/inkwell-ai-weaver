
import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Settings, Palette, Type, Keyboard } from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const AccessibilityMenu = () => {
  const { highContrast, fontSize, toggleHighContrast, adjustFontSize } = useAccessibility();
  const { shortcuts } = useKeyboardShortcuts();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Accessibility settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={toggleHighContrast}>
          <Palette className="h-4 w-4 mr-2" />
          {highContrast ? 'Disable' : 'Enable'} High Contrast
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => adjustFontSize('small')}>
          <Type className="h-4 w-4 mr-2" />
          Small Font {fontSize === 'small' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => adjustFontSize('medium')}>
          <Type className="h-4 w-4 mr-2" />
          Medium Font {fontSize === 'medium' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => adjustFontSize('large')}>
          <Type className="h-4 w-4 mr-2" />
          Large Font {fontSize === 'large' && '✓'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Keyboard className="h-4 w-4 mr-2" />
          Keyboard Shortcuts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccessibilityMenu;
