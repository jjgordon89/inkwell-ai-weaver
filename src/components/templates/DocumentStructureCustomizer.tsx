import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Film, 
  GraduationCap, 
  Sparkles, 
  Layers, 
  AlertTriangle,
  Check,
  Save,
  Settings,
  Star,
  Trash2,
  Info,
  FileText
} from 'lucide-react';
import { UnifiedProjectTemplate } from '@/types/unified-templates';
import DocumentTreeVisualizer from './DocumentTreeVisualizer';
import { 
  validateStructureSettings, 
  getStructureValidationWarnings, 
  getStructurePerformanceLevel, 
  calculateTotalDocumentNodes 
} from '@/utils/documentStructureValidation';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Type for document structure settings
export interface DocumentStructureSettings {
  chapterCount: number;
  scenesPerChapter: number;
  actCount: number;
  poemCount: number;
  researchSections: number;
  academicSections: number;
  memoirChapters: number;
  nonfictionSections: number;
}

export interface StructurePreset {
  id: string;
  name: string;
  structure: 'novel' | 'screenplay' | 'research' | 'poetry';
  settings: DocumentStructureSettings;
  isDefault?: boolean;
}

interface DocumentStructureCustomizerProps {
  structure: 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction';
  template: UnifiedProjectTemplate | null;
  settings: DocumentStructureSettings;
  onChange: (settings: DocumentStructureSettings) => void;
}

const STRUCTURE_ICONS = {
  novel: BookOpen,
  screenplay: Film,
  research: GraduationCap,
  poetry: Sparkles,
  academic: GraduationCap,
  memoir: BookOpen,
  nonfiction: FileText,
};

const DocumentStructureCustomizer: React.FC<DocumentStructureCustomizerProps> = ({
  structure,
  template,
  settings,
  onChange,
}) => {
  // Get the right icon based on structure type
  const StructureIcon = STRUCTURE_ICONS[structure] || Layers;
  
  // State for structure presets
  const [presets, setPresets] = useState<StructurePreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  
  // Validation state
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [performanceLevel, setPerformanceLevel] = useState<'good' | 'warning' | 'concern'>('good');
  const [totalNodes, setTotalNodes] = useState(0);
  
  // Default accordion open states
  const [openSections, setOpenSections] = useState({
    structure: true,
    preview: false,
    treeView: false,
    presets: false
  });
  
  // Performance badges
  const performanceBadges = {
    good: <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200">Good</Badge>,
    warning: <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200">Moderate</Badge>,
    concern: <Badge variant="outline" className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200">Heavy</Badge>
  };
  
  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('documentStructurePresets');
      if (savedPresets) {
        const parsedPresets = JSON.parse(savedPresets);
        // Filter presets to only show ones relevant to the current structure type
        const relevantPresets = parsedPresets.filter(
          (preset: StructurePreset) => preset.structure === structure
        );
        setPresets(relevantPresets);
      }
    } catch (error) {
      console.error('Failed to load document structure presets:', error);
    }
  }, [structure]);
  
  // Validate settings whenever they change
  useEffect(() => {
    // Validate the settings
    const validatedSettings = validateStructureSettings(settings);
    const warnings = getStructureValidationWarnings(validatedSettings);
    const perfLevel = getStructurePerformanceLevel(validatedSettings);
    const nodes = calculateTotalDocumentNodes(validatedSettings);
    
    setValidationWarnings(warnings);
    setPerformanceLevel(perfLevel);
    setTotalNodes(nodes);
  }, [settings]);
  
  // Handle input changes
  const handleInputChange = (field: keyof DocumentStructureSettings, value: number) => {
    // Ensure value is a number and within reasonable bounds
    const numValue = Math.max(1, Math.min(100, value));
    onChange({
      ...settings,
      [field]: numValue,
    });
  };

  // Reset to template defaults
  const resetToDefaults = useCallback(() => {
    if (template) {
      // Create a complete settings object with all properties
      const defaultSettings: DocumentStructureSettings = {
        chapterCount: template.defaultSettings.chapterCount || 10,
        scenesPerChapter: template.defaultSettings.scenesPerChapter || 3,
        actCount: template.defaultSettings.actCount || 3,
        poemCount: template.defaultSettings.poemCount || 10,
        researchSections: template.defaultSettings.researchSections || 5,
        academicSections: 6,
        memoirChapters: 8,
        nonfictionSections: 7,
      };
      onChange(defaultSettings);
    }
  }, [template, onChange]);

  // Initialize with template values when template changes
  useEffect(() => {
    if (template) {
      resetToDefaults();
    }
  }, [template, resetToDefaults]);
  
  // Save current settings as a preset
  const savePreset = () => {
    if (!presetName.trim()) return;
    
    try {
      // Create new preset
      const newPreset: StructurePreset = {
        id: Date.now().toString(),
        name: presetName.trim(),
        structure,
        settings: { ...settings }
      };
      
      // Add to presets list
      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);
      
      // Save to localStorage (including presets for other structure types)
      const savedPresets = localStorage.getItem('documentStructurePresets');
      let allPresets = [];
      if (savedPresets) {
        const parsedPresets = JSON.parse(savedPresets);
        // Filter out presets for the current structure type
        const otherPresets = parsedPresets.filter(
          (preset: StructurePreset) => preset.structure !== structure
        );
        allPresets = [...otherPresets, ...updatedPresets];
      } else {
        allPresets = updatedPresets;
      }
      
      localStorage.setItem('documentStructurePresets', JSON.stringify(allPresets));
      
      // Reset dialog state
      setPresetName('');
      setShowSavePresetDialog(false);
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  };
  
  // Load a preset
  const loadPreset = (preset: StructurePreset) => {
    onChange({ ...preset.settings });
  };
  
  // Delete a preset
  const deletePreset = (presetId: string) => {
    try {
      // Remove from local state
      const updatedPresets = presets.filter(preset => preset.id !== presetId);
      setPresets(updatedPresets);
      
      // Update localStorage
      const savedPresets = localStorage.getItem('documentStructurePresets');
      if (savedPresets) {
        const parsedPresets = JSON.parse(savedPresets);
        const updatedAllPresets = parsedPresets.filter(
          (preset: StructurePreset) => preset.id !== presetId
        );
        localStorage.setItem('documentStructurePresets', JSON.stringify(updatedAllPresets));
      }
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <StructureIcon className="h-5 w-5" />
          <CardTitle>Document Structure</CardTitle>
        </div>
        <CardDescription>
          Customize the structure of your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['structure']}>
          <AccordionItem value="structure">
            <AccordionTrigger>
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" /> 
                Structure Settings
                <div className="ml-auto flex items-center">
                  {performanceLevel !== 'good' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mr-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              performanceLevel === 'warning' ? 'text-yellow-500' : 'text-red-500'
                            }`} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Structure might impact performance</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 py-2">
                {template && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={resetToDefaults}
                      className="text-xs text-primary hover:underline"
                    >
                      Reset to template defaults
                    </button>
                  </div>
                )}
                
                {/* Performance Badge */}
                <div className="flex justify-end items-center mb-4">
                  <span className="text-xs text-muted-foreground mr-2">Performance Impact:</span>
                  {performanceBadges[performanceLevel]}
                </div>
                
                {/* Novel structure settings */}
                {structure === 'novel' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="chapterCount">Number of Chapters</Label>
                          <span className="text-sm text-muted-foreground">{settings.chapterCount}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Slider
                            id="chapterCount"
                            min={1}
                            max={50}
                            step={1}
                            value={[settings.chapterCount]}
                            onValueChange={(value) => handleInputChange('chapterCount', value[0])}
                            aria-label="Number of chapters"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            value={settings.chapterCount}
                            onChange={(e) => handleInputChange('chapterCount', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="scenesPerChapter">Scenes per Chapter</Label>
                          <span className="text-sm text-muted-foreground">{settings.scenesPerChapter}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Slider
                            id="scenesPerChapter"
                            min={1}
                            max={10}
                            step={1}
                            value={[settings.scenesPerChapter]}
                            onValueChange={(value) => handleInputChange('scenesPerChapter', value[0])}
                            aria-label="Scenes per chapter"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={settings.scenesPerChapter}
                            onChange={(e) => handleInputChange('scenesPerChapter', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This will create {settings.chapterCount} chapters with {settings.scenesPerChapter} scenes per chapter
                      ({settings.chapterCount * settings.scenesPerChapter} total scenes).
                    </div>
                  </>
                )}

                {/* Screenplay structure settings */}
                {structure === 'screenplay' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="actCount">Number of Acts</Label>
                          <span className="text-sm text-muted-foreground">{settings.actCount}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Slider
                            id="actCount"
                            min={1}
                            max={5}
                            step={1}
                            value={[settings.actCount]}
                            onValueChange={(value) => handleInputChange('actCount', value[0])}
                            aria-label="Number of acts"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            value={settings.actCount}
                            onChange={(e) => handleInputChange('actCount', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This will create a screenplay with {settings.actCount} acts, along with character profiles and setting descriptions.
                    </div>
                  </>
                )}

                {/* Poetry structure settings */}
                {structure === 'poetry' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="poemCount">Number of Poems</Label>
                          <span className="text-sm text-muted-foreground">{settings.poemCount}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Slider
                            id="poemCount"
                            min={1}
                            max={30}
                            step={1}
                            value={[settings.poemCount]}
                            onValueChange={(value) => handleInputChange('poemCount', value[0])}
                            aria-label="Number of poems"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={30}
                            value={settings.poemCount}
                            onChange={(e) => handleInputChange('poemCount', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This will create a collection with {settings.poemCount} poems, organized in a single volume.
                    </div>
                  </>
                )}

                {/* Research structure settings */}
                {structure === 'research' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="researchSections">Number of Research Sections</Label>
                          <span className="text-sm text-muted-foreground">{settings.researchSections}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Slider
                            id="researchSections"
                            min={1}
                            max={20}
                            step={1}
                            value={[settings.researchSections]}
                            onValueChange={(value) => handleInputChange('researchSections', value[0])}
                            aria-label="Number of research sections"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={settings.researchSections}
                            onChange={(e) => handleInputChange('researchSections', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This will create a research document with {settings.researchSections} main sections, along with reference management.
                    </div>
                  </>
                )}

                {/* Academic structure settings */}
                {structure === 'academic' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="academicSections">Number of Academic Sections</Label>
                          <span className="text-sm text-muted-foreground">{settings.academicSections}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Slider
                            id="academicSections"
                            min={1}
                            max={20}
                            step={1}
                            value={[settings.academicSections]}
                            onValueChange={(value) => handleInputChange('academicSections', value[0])}
                            aria-label="Number of academic sections"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={settings.academicSections}
                            onChange={(e) => handleInputChange('academicSections', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This will create an academic document with {settings.academicSections} main sections, along with methodology, literature review, and references.
                    </div>
                  </>
                )}
                
                {/* Memoir structure settings */}
                {structure === 'memoir' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="memoirChapters">Number of Memoir Chapters</Label>
                          <span className="text-sm text-muted-foreground">{settings.memoirChapters}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Slider
                            id="memoirChapters"
                            min={1}
                            max={50}
                            step={1}
                            value={[settings.memoirChapters]}
                            onValueChange={(value) => handleInputChange('memoirChapters', value[0])}
                            aria-label="Number of memoir chapters"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            value={settings.memoirChapters}
                            onChange={(e) => handleInputChange('memoirChapters', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This will create a memoir with {settings.memoirChapters} chapters, along with photos, timeline, and reflection sections.
                    </div>
                  </>
                )}
                
                {/* Nonfiction structure settings */}
                {structure === 'nonfiction' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="nonfictionSections">Number of Nonfiction Sections</Label>
                          <span className="text-sm text-muted-foreground">{settings.nonfictionSections}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Slider
                            id="nonfictionSections"
                            min={1}
                            max={25}
                            step={1}
                            value={[settings.nonfictionSections]}
                            onValueChange={(value) => handleInputChange('nonfictionSections', value[0])}
                            aria-label="Number of nonfiction sections"
                          />
                          <Input
                            type="number"
                            min={1}
                            max={25}
                            value={settings.nonfictionSections}
                            onChange={(e) => handleInputChange('nonfictionSections', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This will create a nonfiction book with {settings.nonfictionSections} main sections, each containing approximately 2 chapters, along with references and supplementary materials.
                    </div>
                  </>
                )}

                {/* Validation Warnings */}
                {validationWarnings.length > 0 && (
                  <Alert
                    role="alert"
                    variant="default"
                    className="mt-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                    data-testid="validation-warning"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {validationWarnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="preview">
            <AccordionTrigger>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" /> 
                Structure Preview
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-2">
                <div className="rounded-md border p-4 bg-muted/30">
                  <h4 className="font-medium mb-2">Document Structure Preview</h4>

                  {/* Novel Preview */}
                  {structure === 'novel' && (
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground mb-2">Your novel will include:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Front Matter (Title Page, Synopsis)</li>
                        <li><strong>{settings.chapterCount} Chapters</strong> with <strong>{settings.scenesPerChapter} scenes per chapter</strong></li>
                        <li>Character profiles section</li>
                        <li>Settings descriptions</li>
                        <li>Research notes</li>
                      </ul>
                      <div className="text-xs text-muted-foreground mt-2">
                        Total document nodes: ~{totalNodes}
                      </div>
                    </div>
                  )}

                  {/* Screenplay Preview */}
                  {structure === 'screenplay' && (
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground mb-2">Your screenplay will include:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Title Page and Synopsis</li>
                        <li><strong>{settings.actCount} Acts</strong> with scene breakdowns</li>
                        <li>Character profiles section</li>
                        <li>Locations descriptions</li>
                        <li>Dialog templates</li>
                      </ul>
                      <div className="text-xs text-muted-foreground mt-2">
                        Total document nodes: ~{totalNodes}
                      </div>
                    </div>
                  )}

                  {/* Poetry Preview */}
                  {structure === 'poetry' && (
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground mb-2">Your poetry collection will include:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Collection Title and Introduction</li>
                        <li><strong>{settings.poemCount} Poem templates</strong></li>
                        <li>Themes section</li>
                        <li>Style guides</li>
                        <li>Reference materials</li>
                      </ul>
                      <div className="text-xs text-muted-foreground mt-2">
                        Total document nodes: ~{totalNodes}
                      </div>
                    </div>
                  )}

                  {/* Research Preview */}
                  {structure === 'research' && (
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground mb-2">Your research document will include:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Abstract and Introduction</li>
                        <li><strong>{settings.researchSections} Research Sections</strong></li>
                        <li>Methodology framework</li>
                        <li>Data collection templates</li>
                        <li>Citations and references system</li>
                      </ul>
                      <div className="text-xs text-muted-foreground mt-2">
                        Total document nodes: ~{totalNodes}
                      </div>
                    </div>
                  )}

                  {/* Academic Preview */}
                  {structure === 'academic' && (
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground mb-2">Your academic paper will include:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Front Matter (Title Page, Abstract, Table of Contents)</li>
                        <li>Introduction and Literature Review</li>
                        <li><strong>{settings.academicSections} Academic Sections</strong> for main content</li>
                        <li>Methodology and Results</li>
                        <li>Discussion and Conclusion</li>
                        <li>References and Appendices</li>
                      </ul>
                      <div className="text-xs text-muted-foreground mt-2">
                        Total document nodes: ~{totalNodes}
                      </div>
                    </div>
                  )}

                  {/* Memoir Preview */}
                  {structure === 'memoir' && (
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground mb-2">Your memoir will include:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Front Matter (Title Page, Dedication, Preface)</li>
                        <li><strong>{settings.memoirChapters} Memoir Chapters</strong></li>
                        <li>Photos & Documents section</li>
                        <li>Timeline of key events</li>
                        <li>Reflections and Epilogue</li>
                      </ul>
                      <div className="text-xs text-muted-foreground mt-2">
                        Total document nodes: ~{totalNodes}
                      </div>
                    </div>
                  )}

                  {/* Nonfiction Preview */}
                  {structure === 'nonfiction' && (
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground mb-2">Your nonfiction book will include:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Front Matter (Title Page, Table of Contents, Introduction)</li>
                        <li><strong>{settings.nonfictionSections} Main Sections</strong> with approximately 2 chapters each</li>
                        <li>References and Bibliography</li>
                        <li>Glossary and Appendices</li>
                      </ul>
                      <div className="text-xs text-muted-foreground mt-2">
                        Total document nodes: ~{totalNodes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Tree Visualizer */}
          <AccordionItem value="treeView">
            <AccordionTrigger>
              <div className="flex items-center">
                <Layers className="h-4 w-4 mr-2" /> 
                Document Tree View
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-2">
                <DocumentTreeVisualizer
                  structure={structure}
                  settings={settings}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Structure Presets */}
          <AccordionItem value="presets">
            <AccordionTrigger>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2" /> 
                Structure Presets
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-2">
                {presets.length > 0 ? (
                  <div className="space-y-2">
                    {presets.map(preset => (
                      <div 
                        key={preset.id} 
                        className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-sm font-medium">{preset.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => loadPreset(preset)}
                                  className="h-7 w-7"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {structure === 'novel' && `${preset.settings.chapterCount} chapters, ${preset.settings.scenesPerChapter} scenes/chapter`}
                                  {structure === 'screenplay' && `${preset.settings.actCount} acts`}
                                  {structure === 'poetry' && `${preset.settings.poemCount} poems`}
                                  {structure === 'research' && `${preset.settings.researchSections} sections`}
                                  {structure === 'academic' && `${preset.settings.academicSections} sections`}
                                  {structure === 'memoir' && `${preset.settings.memoirChapters} chapters`}
                                  {structure === 'nonfiction' && `${preset.settings.nonfictionSections} sections`}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => loadPreset(preset)}
                            className="h-7 w-7"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deletePreset(preset.id)}
                            className="h-7 w-7 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No saved presets for {structure} structure type.
                  </div>
                )}
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => setShowSavePresetDialog(true)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Current Settings as Preset
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      {/* Save Preset Dialog */}
      <Dialog open={showSavePresetDialog} onOpenChange={setShowSavePresetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Structure Preset</DialogTitle>
            <DialogDescription>
              Save your current structure settings as a preset for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preset-name" className="text-right">
                Name
              </Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="col-span-3"
                placeholder="My custom structure"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSavePresetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={savePreset} disabled={!presetName.trim()}>
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DocumentStructureCustomizer;
