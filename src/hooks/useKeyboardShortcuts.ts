
import { useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const { dispatch } = useProject();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        const newDoc = {
          id: crypto.randomUUID(),
          title: 'New Document',
          type: 'document' as const,
          status: 'not-started' as const,
          wordCount: 0,
          labels: [],
          createdAt: new Date(),
          lastModified: new Date(),
          position: 0
        };
        dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
      },
      description: 'Create new document'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        // Auto-save is already handled, just show feedback
        console.log('Document saved');
      },
      description: 'Save document'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => {
        dispatch({ 
          type: 'SET_ACTIVE_VIEW', 
          payload: { id: 'editor', name: 'Editor', type: 'editor' } 
        });
      },
      description: 'Switch to Editor view'
    },
    {
      key: 'o',
      ctrlKey: true,
      action: () => {
        dispatch({ 
          type: 'SET_ACTIVE_VIEW', 
          payload: { id: 'outline', name: 'Outline', type: 'outline' } 
        });
      },
      description: 'Switch to Outline view'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search'
    },
    {
      key: '/',
      action: () => {
        // Show keyboard shortcuts help
        console.log('Keyboard shortcuts help');
      },
      description: 'Show keyboard shortcuts'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.shiftKey === event.shiftKey &&
        !!s.altKey === event.altKey &&
        !!s.metaKey === event.metaKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return { shortcuts };
};
