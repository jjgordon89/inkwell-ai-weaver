
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X, Lightbulb } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Writing Studio',
    description: 'Let\'s take a quick tour to help you get started with your writing project.'
  },
  {
    id: 'binder',
    title: 'Document Binder',
    description: 'Organize your manuscript, chapters, and research documents in this hierarchical structure.',
    target: '[data-tour="binder"]',
    position: 'right'
  },
  {
    id: 'views',
    title: 'Multiple Views',
    description: 'Switch between Editor, Corkboard, Outline, Timeline, and Research views to work the way you prefer.',
    target: '[data-tour="views"]',
    position: 'bottom'
  },
  {
    id: 'editor',
    title: 'Writing Editor',
    description: 'Your main writing space with auto-save, word count, and distraction-free writing.',
    target: '[data-tour="editor"]',
    position: 'left'
  },
  {
    id: 'inspector',
    title: 'Inspector Panel',
    description: 'View and edit document metadata, character information, and story structure.',
    target: '[data-tour="inspector"]',
    position: 'left'
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Use Ctrl+N for new document, Ctrl+E for editor, Ctrl+K for search, and more!'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Step {currentStep + 1} of {tourSteps.length}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {currentTourStep.description}
          </p>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
          
          <div className="text-center">
            <Button variant="link" size="sm" onClick={handleSkip}>
              Skip tour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;
