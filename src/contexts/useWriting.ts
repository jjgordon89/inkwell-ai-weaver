import { useContext } from 'react';
import { WritingContext } from './WritingContext.types';

export const useWriting = () => {
  const context = useContext(WritingContext);
  if (!context) {
    throw new Error('useWriting must be used within a WritingProvider');
  }
  return context;
};
