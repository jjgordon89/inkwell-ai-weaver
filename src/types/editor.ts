import { ContentFormat } from "./document";

/**
 * Interface for rich text editor props
 */
export interface RichTextEditorProps {
  /**
   * The current content value
   */
  value: string;
  
  /**
   * Callback function when content changes
   */
  onChange: (value: string) => void;
  
  /**
   * Optional placeholder text
   */
  placeholder?: string;
  
  /**
   * Content format (rich text, markdown, etc)
   */
  format?: ContentFormat;
  
  /**
   * Is the editor in read-only mode
   */
  readOnly?: boolean;
  
  /**
   * Editor height
   */
  height?: string | number;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Label for the editor
   */
  label?: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Callback function on blur event
   */
  onBlur?: () => void;
  
  /**
   * ID attribute for the editor
   */
  id?: string;
  
  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
  
  /**
   * Additional toolbar buttons
   */
  extraControls?: Array<{
    format: string;
    icon?: React.ReactNode;
    title?: string;
    action?: () => void;
  }>;
  
  /**
   * Callback when editor is focused
   */
  onFocus?: () => void;
  
  /**
   * Autofocus the editor on mount
   */
  autoFocus?: boolean;
  
  /**
   * Toolbar visibility
   */
  showToolbar?: boolean;
  
  /**
   * Editor theme
   */
  theme?: 'snow' | 'bubble' | 'minimal';
  
  /**
   * Sanitize content on change
   */
  sanitize?: boolean;
  
  /**
   * Maximum content length
   */
  maxLength?: number;
  
  /**
   * Display character count
   */
  showCharCount?: boolean;
  
  /**
   * Callback for key events
   */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  
  /**
   * Custom toolbar configuration
   */
  toolbarConfig?: Record<string, unknown>;
  
  /**
   * Custom upload handler for images
   */
  imageUploadHandler?: (file: File) => Promise<string>;
  
  /**
   * Accessibility features
   */
  accessibility?: {
    highContrast?: boolean;
    largerText?: boolean;
    keyboardNavigation?: boolean;
  };
}

/**
 * Selection range in text
 */
export interface TextSelection {
  index: number;
  length: number;
  text: string;
}

/**
 * Text formatting options
 */
export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  link?: string;
  code?: boolean;
  script?: 'sub' | 'super' | null;
  list?: 'bullet' | 'ordered' | null;
  header?: 1 | 2 | 3 | 4 | 5 | 6 | null;
  align?: 'left' | 'center' | 'right' | 'justify' | null;
  direction?: 'rtl' | null;
  indent?: number | null;
  background?: string | null;
  color?: string | null;
  font?: string | null;
  size?: 'small' | 'large' | 'huge' | null;
}

/**
 * Interface for editor component methods
 */
export interface EditorMethods {
  focus: () => void;
  blur: () => void;
  getSelection: () => TextSelection | null;
  setSelection: (index: number, length: number) => void;
  getContents: () => string;
  getLength: () => number;
  getFormat: () => TextFormat;
  setFormat: (format: TextFormat) => void;
}
