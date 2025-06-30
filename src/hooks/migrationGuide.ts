// Update these imports in any file that uses the WritingContext types:
// - Replace the import from '@/contexts/WritingContext' with '@/contexts/WritingContext.types'
// - Replace import of useWriting from '@/contexts/WritingContext' with '@/contexts/useWriting'

import { useWriting } from '@/contexts/useWriting';
import {
  WritingState,
  Document,
  Character,
  CharacterRelationship,
  StoryArc,
  WorldElement
} from '@/contexts/WritingContext.types';

// Example usage:
// const { state, dispatch, updateDocument } = useWriting();
// const { currentDocument, characters } = state;
