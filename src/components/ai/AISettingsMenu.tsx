import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bot, 
  Globe, 
  Brain, 
  Sliders, 
  TestTube, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Key,
  ChevronRight
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useAISettings } from '@/contexts/AISettingsContext';
import AISettingsModal from './AISettingsModal';

interface AISettingsMenuProps {
  trigger?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

const AISettingsMenu: React.FC<AISettingsMenuProps> = ({ 
  trigger, 
  side = "right", 
  align = "start" 
}) => {
  const { openSettings, isSettingsOpen, closeSettings, defaultTab } = useAISettings();
  
  const { 
    selectedProvider, 
    selectedModel, 
    availableProviders,
    isCurrentProviderConfigured,
  } = useAI();

  const isConfigured = isCurrentProviderConfigured();

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <Settings className="h-4 w-4 mr-2" />
      AI Settings
      {!isConfigured && (
        <Badge variant="destructive" className="ml-auto text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Setup Required
        </Badge>
      )}
      {isConfigured && (
        <Badge variant="secondary" className="ml-auto text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      )}
    </Button>
  );

  const handleQuickAction = (tab: string) => {
    openSettings(tab);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || defaultTrigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-80" 
          side={side} 
          align={align}
          sideOffset={5}
        >
          <DropdownMenuLabel className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Configuration
          </DropdownMenuLabel>
          
          {/* Quick Status */}
          <div className="px-2 py-2 border-b">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              {isConfigured ? (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Setup Required
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Provider:</span>
              <span className="font-medium">{selectedProvider}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-medium text-xs">{selectedModel}</span>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Quick Actions */}
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Globe className="h-4 w-4 mr-2" />
                Provider Settings
                <ChevronRight className="h-4 w-4 ml-auto" />
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {availableProviders.map((provider) => (
                    <DropdownMenuItem
                      key={provider.name}
                      onClick={() => handleQuickAction('provider')}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{provider.name}</span>
                        {provider.name === selectedProvider && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuItem onClick={() => handleQuickAction('model')}>
              <Brain className="h-4 w-4 mr-2" />
              Model Selection
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleQuickAction('advanced')}>
              <Sliders className="h-4 w-4 mr-2" />
              Advanced Parameters
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Testing & Utilities */}
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleQuickAction('test')}>
              <TestTube className="h-4 w-4 mr-2" />
              Test Configuration
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleQuickAction('overview')}>
              <Bot className="h-4 w-4 mr-2" />
              Configuration Status
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Main Settings */}
          <DropdownMenuItem onClick={() => openSettings('overview')}>
            <Settings className="h-4 w-4 mr-2" />
            Open Full Settings
          </DropdownMenuItem>

          {!isConfigured && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => openSettings('provider')}
                className="text-amber-600 focus:text-amber-700"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Quick Setup Required
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings Modal */}
      <AISettingsModal 
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        defaultTab={defaultTab}
      />
    </>
  );
};

export default AISettingsMenu;
