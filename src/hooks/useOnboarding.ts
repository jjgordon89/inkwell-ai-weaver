
import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'writing-studio-onboarding-completed';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    const firstVisit = !hasCompletedOnboarding;
    
    setIsFirstVisit(firstVisit);
    setShowOnboarding(firstVisit);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    setIsFirstVisit(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
    setIsFirstVisit(true);
  };

  return {
    showOnboarding,
    isFirstVisit,
    completeOnboarding,
    resetOnboarding
  };
};
