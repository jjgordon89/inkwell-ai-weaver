
import { useEffect } from 'react';

interface EditorKeyboardHandlerProps {
  onUndo: () => void;
  onRedo: () => void;
}

const EditorKeyboardHandler: React.FC<EditorKeyboardHandlerProps> = ({
  onUndo,
  onRedo
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        onRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo]);

  return null;
};

export default EditorKeyboardHandler;
