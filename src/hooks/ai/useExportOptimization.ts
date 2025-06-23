
import { useState, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';

export interface ExportOptimization {
  id: string;
  format: 'pdf' | 'epub' | 'docx' | 'html' | 'print';
  category: 'formatting' | 'structure' | 'content' | 'metadata';
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  affectedDocuments: string[];
  autoFixable: boolean;
}

export interface FormatRequirement {
  format: string;
  requirements: {
    maxWordsPerChapter?: number;
    requiredMetadata: string[];
    formattingRules: string[];
    structureRules: string[];
  };
}

export const useExportOptimization = () => {
  const { state } = useProject();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizations, setOptimizations] = useState<ExportOptimization[]>([]);

  const formatRequirements: FormatRequirement[] = [
    {
      format: 'epub',
      requirements: {
        maxWordsPerChapter: 5000,
        requiredMetadata: ['title', 'author', 'description'],
        formattingRules: ['No manual page breaks', 'Consistent heading styles'],
        structureRules: ['Chapter-based structure', 'Table of contents']
      }
    },
    {
      format: 'print',
      requirements: {
        requiredMetadata: ['title', 'author', 'copyright'],
        formattingRules: ['Consistent margins', 'Print-safe fonts', 'Page numbering'],
        structureRules: ['Chapter breaks on new pages', 'Proper front matter']
      }
    },
    {
      format: 'docx',
      requirements: {
        requiredMetadata: ['title', 'author'],
        formattingRules: ['Heading styles', 'Consistent spacing'],
        structureRules: ['Outline structure', 'Track changes compatibility']
      }
    }
  ];

  const analyzeForExport = useCallback(async (targetFormat: string) => {
    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const formatReq = formatRequirements.find(req => req.format === targetFormat);
      if (!formatReq) return;
      
      const newOptimizations: ExportOptimization[] = [];
      const manuscripts = state.flatDocuments.filter(doc => 
        doc.type === 'chapter' || doc.type === 'scene'
      );
      
      // Analyze chapter lengths
      if (formatReq.requirements.maxWordsPerChapter) {
        manuscripts.forEach(doc => {
          if (doc.wordCount > formatReq.requirements.maxWordsPerChapter!) {
            newOptimizations.push({
              id: `length-${doc.id}`,
              format: targetFormat as any,
              category: 'structure',
              issue: `Chapter "${doc.title}" is too long (${doc.wordCount} words)`,
              suggestion: `Consider breaking into smaller chapters or scenes. Recommended max: ${formatReq.requirements.maxWordsPerChapter} words.`,
              priority: 'medium',
              affectedDocuments: [doc.id],
              autoFixable: false
            });
          }
        });
      }
      
      // Check for required metadata
      formatReq.requirements.requiredMetadata.forEach(metadata => {
        if (!hasRequiredMetadata(metadata)) {
          newOptimizations.push({
            id: `metadata-${metadata}`,
            format: targetFormat as any,
            category: 'metadata',
            issue: `Missing required ${metadata} for ${targetFormat} export`,
            suggestion: `Add ${metadata} in project settings for proper ${targetFormat} export.`,
            priority: 'high',
            affectedDocuments: [],
            autoFixable: false
          });
        }
      });
      
      // Analyze structure issues
      if (targetFormat === 'epub' || targetFormat === 'print') {
        const hasProperStructure = manuscripts.every(doc => 
          doc.type === 'chapter' || doc.parentId
        );
        
        if (!hasProperStructure) {
          newOptimizations.push({
            id: 'structure-hierarchy',
            format: targetFormat as any,
            category: 'structure',
            issue: 'Inconsistent document hierarchy',
            suggestion: 'Organize content into clear chapter structure for better export formatting.',
            priority: 'medium',
            affectedDocuments: manuscripts.map(doc => doc.id),
            autoFixable: false
          });
        }
      }
      
      // Check for formatting consistency
      manuscripts.forEach(doc => {
        if (doc.content) {
          const issues = analyzeFormattingIssues(doc.content, targetFormat);
          issues.forEach((issue, index) => {
            newOptimizations.push({
              id: `format-${doc.id}-${index}`,
              format: targetFormat as any,
              category: 'formatting',
              issue: `Formatting issue in "${doc.title}": ${issue.problem}`,
              suggestion: issue.solution,
              priority: issue.priority,
              affectedDocuments: [doc.id],
              autoFixable: issue.autoFixable
            });
          });
        }
      });
      
      setOptimizations(newOptimizations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }));
    } catch (error) {
      console.error('Failed to analyze export optimization:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.flatDocuments]);

  const applyOptimization = useCallback((optimizationId: string) => {
    setOptimizations(prev => prev.filter(opt => opt.id !== optimizationId));
  }, []);

  const getOptimizationsByCategory = useCallback((category: ExportOptimization['category']) => {
    return optimizations.filter(opt => opt.category === category);
  }, [optimizations]);

  return {
    optimizations,
    isAnalyzing,
    analyzeForExport,
    applyOptimization,
    getOptimizationsByCategory,
    formatRequirements
  };
};

function hasRequiredMetadata(metadata: string): boolean {
  // In a real implementation, this would check project metadata
  return false; // Simplified for demo
}

function analyzeFormattingIssues(content: string, format: string) {
  const issues: Array<{
    problem: string;
    solution: string;
    priority: 'high' | 'medium' | 'low';
    autoFixable: boolean;
  }> = [];
  
  // Check for inconsistent quotes
  const smartQuotes = content.match(/[""'']/g);
  const straightQuotes = content.match(/['"]/g);
  
  if (smartQuotes && straightQuotes) {
    issues.push({
      problem: 'Mixed quote styles (smart and straight quotes)',
      solution: 'Use consistent quote style throughout. Smart quotes recommended for print.',
      priority: 'medium',
      autoFixable: true
    });
  }
  
  // Check for multiple spaces
  if (content.includes('  ')) {
    issues.push({
      problem: 'Multiple consecutive spaces found',
      solution: 'Replace multiple spaces with single spaces for clean formatting.',
      priority: 'low',
      autoFixable: true
    });
  }
  
  // Check for manual line breaks
  if (content.includes('\n\n\n')) {
    issues.push({
      problem: 'Multiple manual line breaks',
      solution: 'Use proper paragraph spacing instead of multiple line breaks.',
      priority: 'medium',
      autoFixable: true
    });
  }
  
  return issues;
}
