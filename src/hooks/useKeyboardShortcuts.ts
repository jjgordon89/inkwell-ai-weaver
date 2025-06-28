
import { useEffect } from 'react';

export const useKeyboardShortcuts = () => {
  const shortcuts = {
    save: 'Ctrl+S',
    undo: 'Ctrl+Z',
    redo: 'Ctrl+Y',
    newDocument: 'Ctrl+N',
    search: 'Ctrl+F'
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            // Handle save
            console.log('Save shortcut triggered');
            break;
          case 'z':
            if (!event.shiftKey) {
              event.preventDefault();
              console.log('Undo shortcut triggered');
            }
            break;
          case 'y':
            event.preventDefault();
            console.log('Redo shortcut triggered');
            break;
          case 'n':
            event.preventDefault();
            console.log('New document shortcut triggered');
            break;
          case 'f':
            event.preventDefault();
            console.log('Search shortcut triggered');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { shortcuts };
};
