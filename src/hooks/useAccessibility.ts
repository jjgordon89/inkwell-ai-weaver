
import { useEffect, useState } from 'react';

export const useAccessibility = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);

    // Apply accessibility settings
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }
    
    if (prefersHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    document.documentElement.classList.toggle('high-contrast', newValue);
  };

  const adjustFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    const sizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem'
    };
    document.documentElement.style.setProperty('--base-font-size', sizeMap[size]);
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return {
    highContrast,
    reducedMotion,
    fontSize,
    toggleHighContrast,
    adjustFontSize,
    announceToScreenReader
  };
};
