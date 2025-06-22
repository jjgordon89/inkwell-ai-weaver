
import { useState, useCallback, useRef, useEffect } from 'react';

interface TransitionState {
  isVisible: boolean;
  opacity: number;
  scale: number;
  translateY: number;
}

export const useSmoothTransitions = (duration: number = 300) => {
  const [state, setState] = useState<TransitionState>({
    isVisible: false,
    opacity: 0,
    scale: 0.95,
    translateY: 10
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();

  const show = useCallback((delay: number = 0) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState({
        isVisible: true,
        opacity: 1,
        scale: 1,
        translateY: 0
      });
    }, delay);
  }, []);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({
      isVisible: false,
      opacity: 0,
      scale: 0.95,
      translateY: 10
    });
  }, []);

  const toggle = useCallback(() => {
    if (state.isVisible) {
      hide();
    } else {
      show();
    }
  }, [state.isVisible, show, hide]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    show,
    hide,
    toggle,
    style: {
      opacity: state.opacity,
      transform: `scale(${state.scale}) translateY(${state.translateY}px)`,
      transition: `all ${duration}ms ease-out`
    }
  };
};
