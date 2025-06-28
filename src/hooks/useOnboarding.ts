
import { useState } from 'react';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    // Could store completion in localStorage
    localStorage.setItem('onboarding-completed', 'true');
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    startOnboarding
  };
};
