
import { useState, useEffect, useCallback } from 'react';

export interface UserPreference {
  id: string;
  category: 'style' | 'genre' | 'assistance' | 'frequency';
  key: string;
  value: any;
  confidence: number;
  updatedAt: Date;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('writing-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  // Save to localStorage when preferences change
  useEffect(() => {
    localStorage.setItem('writing-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = useCallback((
    category: UserPreference['category'], 
    key: string, 
    value: any, 
    confidence: number
  ) => {
    setPreferences(prev => {
      const existing = prev.find(p => p.category === category && p.key === key);
      
      if (existing) {
        return prev.map(p => 
          p.id === existing.id 
            ? { 
                ...p, 
                value, 
                confidence: Math.min(1.0, confidence + existing.confidence * 0.1), 
                updatedAt: new Date() 
              }
            : p
        );
      } else {
        return [...prev, {
          id: `${category}-${key}-${Date.now()}`,
          category,
          key,
          value,
          confidence,
          updatedAt: new Date()
        }];
      }
    });
  }, []);

  const getPreference = useCallback((category: UserPreference['category'], key: string) => {
    return preferences.find(p => p.category === category && p.key === key);
  }, [preferences]);

  const getPreferencesByCategory = useCallback((category: UserPreference['category']) => {
    return preferences.filter(p => p.category === category);
  }, [preferences]);

  return {
    preferences,
    updatePreference,
    getPreference,
    getPreferencesByCategory
  };
};
