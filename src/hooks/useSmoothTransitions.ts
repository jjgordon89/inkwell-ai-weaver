
import { useState, useCallback, useRef, useEffect } from 'react';

interface TransitionState {
  isVisible: boolean;
  isAnimating: boolean;
  opacity: number;
}

export const useSmoothTransitions = (initialVisible = false) => {
  const [state, setState] = useState<TransitionState>({
    isVisible: initialVisible,
    isAnimating: false,
    opacity: initialVisible ? 1 : 0
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();

  const show = useCallback((delay = 0) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const startAnimation = () => {
      setState(prev => ({ ...prev, isVisible: true, isAnimating: true }));
      
      const animate = (startTime: number) => {
        const progress = Math.min((Date.now() - startTime) / 200, 1);
        const opacity = progress;
        
        setState(prev => ({ ...prev, opacity }));
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(() => animate(startTime));
        } else {
          setState(prev => ({ ...prev, isAnimating: false }));
        }
      };
      
      animationRef.current = requestAnimationFrame(() => animate(Date.now()));
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
  }, []);

  const hide = useCallback((delay = 0) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const startAnimation = () => {
      setState(prev => ({ ...prev, isAnimating: true }));
      
      const animate = (startTime: number) => {
        const progress = Math.min((Date.now() - startTime) / 150, 1);
        const opacity = 1 - progress;
        
        setState(prev => ({ ...prev, opacity }));
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(() => animate(startTime));
        } else {
          setState(prev => ({ ...prev, isVisible: false, isAnimating: false, opacity: 0 }));
        }
      };
      
      animationRef.current = requestAnimationFrame(() => animate(Date.now()));
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
  }, []);

  const toggle = useCallback((forceState?: boolean) => {
    const newVisible = forceState !== undefined ? forceState : !state.isVisible;
    if (newVisible) {
      show();
    } else {
      hide();
    }
  }, [state.isVisible, show, hide]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return {
    ...state,
    show,
    hide,
    toggle
  };
};
