
import { useState, useCallback, useRef, useEffect } from 'react';
import type { TypingState } from './types';

export const useTypingActivityTracker = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(Date.now());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTypingActivity = useCallback(() => {
    setIsTyping(true);
    setLastTypingTime(Date.now());
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000); // 3 seconds of inactivity = stopped typing
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    lastTypingTime,
    handleTypingActivity
  };
};
