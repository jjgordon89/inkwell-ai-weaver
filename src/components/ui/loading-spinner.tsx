import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  color?: 'primary' | 'secondary' | 'accent';
}

/**
 * LoadingSpinner component provides a consistent loading indicator
 * that can be used throughout the application.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className = '',
  color = 'primary'
}) => {
  // Size mappings
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  // Color mappings
  const colorMap = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    accent: 'border-accent'
  };

  // Spinner element
  const spinner = (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div 
        className={`animate-spin rounded-full border-b-2 ${sizeMap[size]} ${colorMap[color]}`}
        role="status"
        aria-label={text}
      ></div>
      {text && <p className="text-muted-foreground" aria-live="polite">{text}</p>}
    </div>
  );

  // Return fullscreen version if requested
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
