
import { useState, useEffect, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWriting } from '@/contexts/WritingContext';

export interface DynamicOutlineItem {
  id: string;
  title: string;
  type: 'chapter' | 'scene' | 'plot-point' | 'character-arc';
  level: number;
  wordCount: number;
  status: 'completed' | 'in-progress' | 'planned';
  aiGenerated: boolean;
  confidence: number;
  relatedElements: string[];
  summary?: string;
  suggestedPosition?: number;
}

export const useDynamicOutline = () => {
  const { state: projectState } = useProject();
  const { state: writingState } = useWriting();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicOutline, setDynamicOutline] = useState<DynamicOutlineItem[]>([]);

  const generateDynamicOutline = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const outline: DynamicOutlineItem[] = [];
      
      // Analyze existing documents for structure
      const manuscriptDocs = projectState.flatDocuments
        .filter(doc => doc.content && (doc.type === 'chapter' || doc.type === 'scene'))
        .sort((a, b) => a.position - b.position);

      manuscriptDocs.forEach((doc, index) => {
        // Determine if this is a chapter or scene based on word count and structure
        const isChapter = doc.type === 'chapter' || doc.wordCount > 2000;
        
        outline.push({
          id: doc.id,
          title: doc.title,
          type: isChapter ? 'chapter' : 'scene',
          level: isChapter ? 1 : 2,
          wordCount: doc.wordCount,
          status: doc.status === 'final' ? 'completed' : 
                  doc.status === 'draft' || doc.status === 'first-draft' ? 'in-progress' : 'planned',
          aiGenerated: false,
          confidence: 1.0,
          relatedElements: [],
          summary: doc.synopsis || doc.content?.slice(0, 200) + '...'
        });
      });

      // Generate AI suggestions for missing structure
      const totalWordCount = outline.reduce((sum, item) => sum + item.wordCount, 0);
      const averageChapterLength = totalWordCount / outline.filter(item => item.type === 'chapter').length || 2500;

      // Suggest new chapters if gaps are detected
      if (outline.length > 0) {
        const chapters = outline.filter(item => item.type === 'chapter');
        
        chapters.forEach((chapter, index) => {
          const nextChapter = chapters[index + 1];
          
          if (nextChapter && chapter.wordCount < averageChapterLength * 0.5) {
            // Suggest expanding this chapter
            outline.push({
              id: `suggested-expand-${chapter.id}`,
              title: `Expand: ${chapter.title}`,
              type: 'plot-point',
              level: 2,
              wordCount: 0,
              status: 'planned',
              aiGenerated: true,
              confidence: 0.7,
              relatedElements: [chapter.id],
              summary: 'AI suggests expanding this chapter with additional scenes or character development.',
              suggestedPosition: index + 1
            });
          }
        });
      }

      // Suggest character arcs based on character analysis
      writingState.characters.forEach(character => {
        const characterMentions = manuscriptDocs.filter(doc => 
          doc.content?.toLowerCase().includes(character.name.toLowerCase())
        ).length;
        
        if (characterMentions > 2) {
          outline.push({
            id: `arc-${character.id}`,
            title: `${character.name}'s Character Arc`,
            type: 'character-arc',
            level: 1,
            wordCount: 0,
            status: 'in-progress',
            aiGenerated: true,
            confidence: 0.8,
            relatedElements: manuscriptDocs
              .filter(doc => doc.content?.toLowerCase().includes(character.name.toLowerCase()))
              .map(doc => doc.id),
            summary: `Track ${character.name}'s development throughout the story.`
          });
        }
      });

      setDynamicOutline(outline.sort((a, b) => {
        if (a.suggestedPosition !== undefined && b.suggestedPosition !== undefined) {
          return a.suggestedPosition - b.suggestedPosition;
        }
        if (a.type === 'character-arc' && b.type !== 'character-arc') return 1;
        if (b.type === 'character-arc' && a.type !== 'character-arc') return -1;
        return a.level - b.level;
      }));
      
    } catch (error) {
      console.error('Failed to generate dynamic outline:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const outlineStats = useMemo(() => {
    const completed = dynamicOutline.filter(item => item.status === 'completed').length;
    const inProgress = dynamicOutline.filter(item => item.status === 'in-progress').length;
    const planned = dynamicOutline.filter(item => item.status === 'planned').length;
    const totalWords = dynamicOutline.reduce((sum, item) => sum + item.wordCount, 0);
    const aiSuggestions = dynamicOutline.filter(item => item.aiGenerated).length;
    
    return {
      completed,
      inProgress,
      planned,
      total: dynamicOutline.length,
      totalWords,
      aiSuggestions,
      completionPercentage: dynamicOutline.length > 0 ? (completed / dynamicOutline.length) * 100 : 0
    };
  }, [dynamicOutline]);

  // Auto-generate outline when documents change
  useEffect(() => {
    if (projectState.flatDocuments.length > 0 && dynamicOutline.length === 0) {
      generateDynamicOutline();
    }
  }, [projectState.flatDocuments.length]);

  const acceptSuggestion = (itemId: string) => {
    setDynamicOutline(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, aiGenerated: false, confidence: 1.0 }
        : item
    ));
  };

  const rejectSuggestion = (itemId: string) => {
    setDynamicOutline(prev => prev.filter(item => item.id !== itemId));
  };

  return {
    dynamicOutline,
    outlineStats,
    isGenerating,
    generateDynamicOutline,
    acceptSuggestion,
    rejectSuggestion
  };
};
