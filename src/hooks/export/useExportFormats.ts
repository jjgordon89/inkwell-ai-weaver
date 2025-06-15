
import { useState } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from "@/hooks/use-toast";
import type { ExportFormat, ExportOptions, ManuscriptTemplate, SubmissionFormat, PrintLayout } from './types';

export const useExportFormats = () => {
  const { state } = useWriting();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const availableFormats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF',
      extension: 'pdf',
      description: 'Portable Document Format - Perfect for sharing and printing',
      features: ['Print-ready', 'Universal compatibility', 'Preserves formatting']
    },
    {
      id: 'epub',
      name: 'EPUB',
      extension: 'epub',
      description: 'Electronic Publication - Standard e-book format',
      features: ['E-reader compatible', 'Reflowable text', 'Metadata support']
    },
    {
      id: 'docx',
      name: 'DOCX',
      extension: 'docx',
      description: 'Microsoft Word Document - Industry standard for manuscripts',
      features: ['Editable', 'Track changes', 'Comments support']
    },
    {
      id: 'html',
      name: 'HTML',
      extension: 'html',
      description: 'Web format - Great for online publishing',
      features: ['Web-ready', 'Interactive elements', 'Search engine friendly']
    }
  ];

  const manuscriptTemplates: ManuscriptTemplate[] = [
    {
      id: 'standard-novel',
      name: 'Standard Novel',
      description: 'Traditional novel formatting with standard margins and spacing',
      category: 'novel',
      formatting: {
        fontSize: 12,
        fontFamily: 'Times New Roman',
        lineHeight: 2.0,
        marginTop: 1,
        marginBottom: 1,
        marginLeft: 1.25,
        marginRight: 1.25,
        paragraphSpacing: 0,
        chapterBreak: true,
        pageNumbers: true,
        headerFooter: true
      }
    },
    {
      id: 'short-story',
      name: 'Short Story',
      description: 'Compact formatting suitable for short fiction',
      category: 'short-story',
      formatting: {
        fontSize: 12,
        fontFamily: 'Times New Roman',
        lineHeight: 2.0,
        marginTop: 1,
        marginBottom: 1,
        marginLeft: 1,
        marginRight: 1,
        paragraphSpacing: 0,
        chapterBreak: false,
        pageNumbers: true,
        headerFooter: false
      }
    },
    {
      id: 'screenplay',
      name: 'Screenplay',
      description: 'Industry-standard screenplay formatting',
      category: 'screenplay',
      formatting: {
        fontSize: 12,
        fontFamily: 'Courier New',
        lineHeight: 1.0,
        marginTop: 1,
        marginBottom: 1,
        marginLeft: 1.5,
        marginRight: 1,
        paragraphSpacing: 0,
        chapterBreak: false,
        pageNumbers: true,
        headerFooter: false
      }
    }
  ];

  const submissionFormats: SubmissionFormat[] = [
    {
      id: 'standard-submission',
      name: 'Standard Submission',
      description: 'Generic submission format accepted by most publishers',
      requirements: {
        fontFamily: 'Times New Roman',
        fontSize: 12,
        spacing: 'double',
        margins: { top: 1, bottom: 1, left: 1, right: 1 },
        pageNumbers: true,
        titlePage: true,
        synopsis: false,
        authorBio: false
      }
    },
    {
      id: 'agent-submission',
      name: 'Literary Agent',
      description: 'Format preferred by literary agents',
      requirements: {
        wordCount: { min: 50000, max: 120000 },
        fontFamily: 'Times New Roman',
        fontSize: 12,
        spacing: 'double',
        margins: { top: 1, bottom: 1, left: 1, right: 1 },
        pageNumbers: true,
        titlePage: true,
        synopsis: true,
        authorBio: true
      }
    },
    {
      id: 'magazine-submission',
      name: 'Magazine Submission',
      description: 'Format for short story submissions to magazines',
      requirements: {
        wordCount: { min: 1000, max: 15000 },
        fontFamily: 'Times New Roman',
        fontSize: 12,
        spacing: 'double',
        margins: { top: 1, bottom: 1, left: 1, right: 1 },
        pageNumbers: true,
        titlePage: false,
        synopsis: false,
        authorBio: true
      }
    }
  ];

  const printLayouts: PrintLayout[] = [
    {
      id: 'trade-paperback',
      name: 'Trade Paperback (6x9)',
      pageSize: '6x9',
      orientation: 'portrait',
      margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75, inner: 1, outer: 0.75 },
      gutterSize: 0.25,
      bleedArea: 0.125,
      chapters: {
        startOnRightPage: true,
        pageBreakBefore: true,
        dropCap: false
      }
    },
    {
      id: 'mass-market',
      name: 'Mass Market (5x8)',
      pageSize: '5x8',
      orientation: 'portrait',
      margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5, inner: 0.75, outer: 0.5 },
      gutterSize: 0.25,
      bleedArea: 0.125,
      chapters: {
        startOnRightPage: true,
        pageBreakBefore: true,
        dropCap: true
      }
    },
    {
      id: 'hardcover',
      name: 'Hardcover Premium',
      pageSize: '6x9',
      orientation: 'portrait',
      margins: { top: 1, bottom: 1, left: 1, right: 1, inner: 1.25, outer: 1 },
      gutterSize: 0.5,
      bleedArea: 0.125,
      chapters: {
        startOnRightPage: true,
        pageBreakBefore: true,
        dropCap: true
      }
    }
  ];

  const exportDocument = async (options: ExportOptions) => {
    if (!state.currentDocument) {
      toast({
        title: "No Document",
        description: "Please select a document to export",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, this would call appropriate export APIs
      console.log('Exporting with options:', options);
      console.log('Document content:', state.currentDocument.content);

      // Create a mock download for demonstration
      const blob = new Blob([state.currentDocument.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.currentDocument.title}.${options.format.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Document exported as ${options.format.name}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const validateSubmissionRequirements = (format: SubmissionFormat): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];

    if (!state.currentDocument) {
      issues.push("No document selected");
      return { valid: false, issues };
    }

    const wordCount = state.currentDocument.wordCount;

    if (format.requirements.wordCount) {
      if (wordCount < format.requirements.wordCount.min) {
        issues.push(`Word count too low: ${wordCount} (minimum: ${format.requirements.wordCount.min})`);
      }
      if (wordCount > format.requirements.wordCount.max) {
        issues.push(`Word count too high: ${wordCount} (maximum: ${format.requirements.wordCount.max})`);
      }
    }

    return { valid: issues.length === 0, issues };
  };

  return {
    availableFormats,
    manuscriptTemplates,
    submissionFormats,
    printLayouts,
    isExporting,
    exportDocument,
    validateSubmissionRequirements
  };
};
