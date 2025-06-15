
export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
  features: string[];
}

export interface ManuscriptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'novel' | 'short-story' | 'screenplay' | 'academic' | 'business';
  formatting: {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    paragraphSpacing: number;
    chapterBreak: boolean;
    pageNumbers: boolean;
    headerFooter: boolean;
  };
}

export interface SubmissionFormat {
  id: string;
  name: string;
  publisher?: string;
  requirements: {
    wordCount?: { min: number; max: number };
    fontFamily: string;
    fontSize: number;
    spacing: 'single' | 'double' | '1.5';
    margins: { top: number; bottom: number; left: number; right: number };
    pageNumbers: boolean;
    titlePage: boolean;
    synopsis: boolean;
    authorBio: boolean;
  };
}

export interface PrintLayout {
  id: string;
  name: string;
  pageSize: 'A4' | 'Letter' | '6x9' | '5x8' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; bottom: number; left: number; right: number; inner: number; outer: number };
  gutterSize: number;
  bleedArea: number;
  chapters: {
    startOnRightPage: boolean;
    pageBreakBefore: boolean;
    dropCap: boolean;
  };
}

export interface ExportOptions {
  format: ExportFormat;
  template?: ManuscriptTemplate;
  submissionFormat?: SubmissionFormat;
  printLayout?: PrintLayout;
  includeMetadata: boolean;
  includeTableOfContents: boolean;
  includePageNumbers: boolean;
  customStyles?: string;
}
