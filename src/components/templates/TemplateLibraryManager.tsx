import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Film, 
  GraduationCap, 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Wand2,
  Save,
  X,
  Eye
} from 'lucide-react';
import { UnifiedProjectTemplate, CreateTemplateInput } from '@/types/unified-templates';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { sanitizeString } from '@/utils/stringUtils';

interface TemplateLibraryManagerProps {
  onTemplateSelect?: (template: UnifiedProjectTemplate) => void;
  selectedTemplate?: UnifiedProjectTemplate | null;
  className?: string;
}

interface AITemplateRequest {
  description: string;
  genre?: string;
  tone?: string;
  structure: 'novel' | 'screenplay' | 'research' | 'poetry';
  length?: string;
  targetAudience?: string;
}

const STRUCTURE_ICONS = {
  novel: BookOpen,
  screenplay: Film,
  research: GraduationCap,
  poetry: Sparkles,
};

const STRUCTURE_LABELS = {
  novel: 'Novel',
  screenplay: 'Screenplay',
  research: 'Research',
  poetry: 'Poetry',
};

const TemplateLibraryManager: React.FC<TemplateLibraryManagerProps> = ({
  onTemplateSelect,
  selectedTemplate,
  className = '',
}) => {
  // State management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<UnifiedProjectTemplate | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<UnifiedProjectTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStructure, setFilterStructure] = useState<string>('all');
  
  const [editingTemplate, setEditingTemplate] = useState<UnifiedProjectTemplate | null>(null);
  const [aiRequest, setAiRequest] = useState<AITemplateRequest>({
    description: '',
    structure: 'novel',
  });
  const [generatedTemplate, setGeneratedTemplate] = useState<Partial<UnifiedProjectTemplate> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state for manual template creation
  const [newTemplate, setNewTemplate] = useState<Partial<UnifiedProjectTemplate>>({
    name: '',
    description: '',
    structure: 'novel',
    icon: '📝',
    features: [],
    defaultSettings: {},
  });

  const { toast } = useToast();
  const {
    getAllTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isLoading,
    error,
  } = useProjectTemplates();

  const [templates, setTemplates] = useState<UnifiedProjectTemplate[]>([]);

  const loadTemplates = useCallback(async () => {
    try {
      const fetchedTemplates = await getAllTemplates();
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    }
  }, [getAllTemplates, toast]);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Filter templates based on search and structure
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStructure = filterStructure === 'all' || template.structure === filterStructure;
    return matchesSearch && matchesStructure;
  });

  // AI Template Generation
  const generateAITemplate = async () => {
    if (!aiRequest.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a description for your project',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation (replace with actual AI API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generated: Partial<UnifiedProjectTemplate> = {
        name: `AI Generated: ${aiRequest.description.slice(0, 30)}...`,
        description: `A ${aiRequest.structure} project${aiRequest.genre ? ` in the ${aiRequest.genre} genre` : ''}${aiRequest.tone ? ` with a ${aiRequest.tone} tone` : ''}. ${aiRequest.description}`,
        structure: aiRequest.structure,
        icon: STRUCTURE_ICONS[aiRequest.structure]?.name || '📝',
        features: [
          'AI-generated structure',
          'Optimized for your genre',
          'Customizable framework',
          ...(aiRequest.structure === 'novel' ? ['Chapter organization', 'Character development'] : []),
          ...(aiRequest.structure === 'screenplay' ? ['Scene structure', 'Dialogue formatting'] : []),
          ...(aiRequest.structure === 'research' ? ['Citation management', 'Data organization'] : []),
          ...(aiRequest.structure === 'poetry' ? ['Verse structure', 'Rhythm analysis'] : []),
        ],
        defaultSettings: {
          wordCountTarget: aiRequest.structure === 'novel' ? 80000 : 
                          aiRequest.structure === 'screenplay' ? 25000 :
                          aiRequest.structure === 'research' ? 15000 : 5000,
          genre: aiRequest.genre,
          writingStyle: aiRequest.tone,
          // Add structure-specific defaults
          chapterCount: aiRequest.structure === 'novel' ? 12 : undefined,
          scenesPerChapter: aiRequest.structure === 'novel' ? 3 : undefined,
          actCount: aiRequest.structure === 'screenplay' ? 3 : undefined,
          poemCount: aiRequest.structure === 'poetry' ? 10 : undefined,
          researchSections: aiRequest.structure === 'research' ? 5 : undefined,
        },
      };

      setGeneratedTemplate(generated);
      toast({
        title: 'Success',
        description: 'AI template generated successfully!',
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGeneratedTemplate = async () => {
    if (!generatedTemplate || !generatedTemplate.name) {
      toast({
        title: 'Error',
        description: 'Generated template is incomplete',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Sanitize all string inputs before saving
      const sanitizedTemplate: CreateTemplateInput = {
        ...generatedTemplate,
        name: sanitizeString(generatedTemplate.name),
        description: sanitizeString(generatedTemplate.description ?? ""),
        features: generatedTemplate.features?.map(feature => sanitizeString(feature)) || [],
        defaultSettings: {
          ...generatedTemplate.defaultSettings,
          genre: generatedTemplate.defaultSettings?.genre ? sanitizeString(generatedTemplate.defaultSettings.genre) : undefined,
          writingStyle: generatedTemplate.defaultSettings?.writingStyle ? sanitizeString(generatedTemplate.defaultSettings.writingStyle) : undefined,
        }
      } as CreateTemplateInput;

      const template = await createTemplate(sanitizedTemplate);
      if (template) {
        setTemplates(prev => [...prev, template]);
        toast({
          title: 'Success',
          description: 'Template saved to library!',
        });
        setIsAIDialogOpen(false);
        setGeneratedTemplate(null);
        setAiRequest({ description: '', structure: 'novel' });
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: 'Error',
        description: `Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Template name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Sanitize all string inputs before saving
      const sanitizedTemplate: CreateTemplateInput = {
        ...newTemplate,
        name: sanitizeString(newTemplate.name),
        description: sanitizeString(newTemplate.description ?? ""),
        features: newTemplate.features?.map(feature => sanitizeString(feature)) || [],
        defaultSettings: {
          ...newTemplate.defaultSettings,
          genre: newTemplate.defaultSettings?.genre ? sanitizeString(newTemplate.defaultSettings.genre) : undefined,
          writingStyle: newTemplate.defaultSettings?.writingStyle ? sanitizeString(newTemplate.defaultSettings.writingStyle) : undefined,
        }
      } as CreateTemplateInput;

      const template = await createTemplate(sanitizedTemplate);
      if (template) {
        setTemplates(prev => [...prev, template]);
        toast({
          title: 'Success',
          description: 'Template created successfully!',
        });
        setIsCreateDialogOpen(false);
        setNewTemplate({
          name: '',
          description: '',
          structure: 'novel',
          icon: '📝',
          features: [],
          defaultSettings: {},
        });
      }
    } catch (error) {
      console.error('Failed to create template:', error);
      toast({
        title: 'Error',
        description: `Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = (template: UnifiedProjectTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate(templateToDelete.id);
      setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
      toast({
        title: 'Success',
        description: 'Template deleted successfully!',
      });
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast({
        title: 'Error',
        description: `Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const renderTemplateCard = (template: UnifiedProjectTemplate) => {
    const Icon = STRUCTURE_ICONS[template.structure as keyof typeof STRUCTURE_ICONS] || BookOpen;
    const isSelected = selectedTemplate?.id === template.id;

    return (
      <Card 
        key={template.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected 
            ? 'ring-2 ring-primary border-primary' 
            : 'border-border hover:border-primary/50'
        }`}
        onClick={() => onTemplateSelect?.(template)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTemplateSelect?.(template);
          }
        }}
        role="button"
        aria-label={`Select template: ${template.name}`}
        aria-selected={isSelected}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewTemplate(template);
                  setIsPreviewDialogOpen(true);
                }}
                aria-label={`Preview ${template.name}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTemplate(template);
                  setNewTemplate(template);
                  setIsCreateDialogOpen(true);
                }}
                aria-label={`Edit ${template.name}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTemplate(template);
                }}
                aria-label={`Delete ${template.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {template.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="capitalize">
                {STRUCTURE_LABELS[template.structure as keyof typeof STRUCTURE_LABELS]}
              </Badge>
              {template.defaultSettings.wordCountTarget && (
                <span className="text-sm text-muted-foreground">
                  {template.defaultSettings.wordCountTarget.toLocaleString()} words
                </span>
              )}
            </div>
            {template.features && template.features.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.features.slice(0, 3).map((feature: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {template.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.features.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading templates..." />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search templates"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterStructure} onValueChange={setFilterStructure}>
            <SelectTrigger className="w-40" aria-label="Filter by project type">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="novel">Novel</SelectItem>
              <SelectItem value="screenplay">Screenplay</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="poetry">Poetry</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => setIsAIDialogOpen(true)}
            className="flex items-center gap-2"
            aria-label="Generate AI template"
          >
            <Wand2 className="h-4 w-4" />
            AI Template
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
            aria-label="Create new template"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(renderTemplateCard)}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12" aria-live="polite">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterStructure !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first template'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => setIsAIDialogOpen(true)} 
              variant="outline"
              aria-label="Generate a template with AI"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              aria-label="Create a new template manually"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>
      )}

      {/* AI Template Generation Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Generate Template with AI
            </DialogTitle>
            <DialogDescription>
              Describe your project and let AI create a customized template for you
            </DialogDescription>
          </DialogHeader>
          
          {!generatedTemplate ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="projectDescription" className="text-sm font-medium">Project Description</label>
                <Textarea
                  id="projectDescription"
                  placeholder="Describe your project idea, themes, or requirements..."
                  value={aiRequest.description}
                  onChange={(e) => setAiRequest(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  aria-required="true"
                  aria-invalid={!aiRequest.description.trim()}
                />
                {!aiRequest.description.trim() && <p className="text-sm text-destructive mt-1">Description is required</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectType" className="text-sm font-medium">Project Type</label>
                  <Select 
                    value={aiRequest.structure} 
                    onValueChange={(value) => setAiRequest(prev => ({ ...prev, structure: value as 'novel' | 'screenplay' | 'research' | 'poetry' }))}
                  >
                    <SelectTrigger id="projectType" aria-label="Project type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novel">Novel</SelectItem>
                      <SelectItem value="screenplay">Screenplay</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="poetry">Poetry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="projectGenre" className="text-sm font-medium">Genre (Optional)</label>
                  <Input
                    id="projectGenre"
                    placeholder="e.g., Fantasy, Sci-Fi, Romance"
                    value={aiRequest.genre || ''}
                    onChange={(e) => setAiRequest(prev => ({ ...prev, genre: e.target.value }))}
                    aria-label="Project genre"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectTone" className="text-sm font-medium">Tone (Optional)</label>
                  <Input
                    id="projectTone"
                    placeholder="e.g., Dark, Humorous, Serious"
                    value={aiRequest.tone || ''}
                    onChange={(e) => setAiRequest(prev => ({ ...prev, tone: e.target.value }))}
                    aria-label="Project tone"
                  />
                </div>
                
                <div>
                  <label htmlFor="targetAudience" className="text-sm font-medium">Target Audience (Optional)</label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Young Adult, Adult, Academic"
                    value={aiRequest.targetAudience || ''}
                    onChange={(e) => setAiRequest(prev => ({ ...prev, targetAudience: e.target.value }))}
                    aria-label="Target audience"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Generated Template Preview</h3>
                <div className="space-y-2">
                  <div>
                    <strong>Name:</strong> {generatedTemplate.name}
                  </div>
                  <div>
                    <strong>Description:</strong> {generatedTemplate.description}
                  </div>
                  <div>
                    <strong>Features:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {generatedTemplate.features?.map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                You can edit this template after saving it to your library.
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIDialogOpen(false)}>
              Cancel
            </Button>
            {!generatedTemplate ? (
              <Button onClick={generateAITemplate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Template
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setGeneratedTemplate(null)}
                >
                  Regenerate
                </Button>
                <Button onClick={saveGeneratedTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Update your template settings' : 'Create a reusable template for future projects'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="templateName" className="text-sm font-medium">Template Name</label>
              <Input
                id="templateName"
                placeholder="Enter template name"
                value={newTemplate.name || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                aria-required="true"
                aria-invalid={!newTemplate.name?.trim()}
              />
              {!newTemplate.name?.trim() && <p className="text-sm text-destructive mt-1">Name is required</p>}
            </div>
            
            <div>
              <label htmlFor="templateDescription" className="text-sm font-medium">Description</label>
              <Textarea
                id="templateDescription"
                placeholder="Describe this template"
                value={newTemplate.description || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                aria-label="Template description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="templateStructure" className="text-sm font-medium">Project Type</label>
                <Select 
                  value={newTemplate.structure} 
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, structure: value as 'novel' | 'screenplay' | 'research' | 'poetry' }))}
                >
                  <SelectTrigger id="templateStructure" aria-label="Project type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novel">Novel</SelectItem>
                    <SelectItem value="screenplay">Screenplay</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="poetry">Poetry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="wordCountTarget" className="text-sm font-medium">Default Word Count Target</label>
                <Input
                  id="wordCountTarget"
                  type="number"
                  placeholder="e.g., 80000"
                  value={newTemplate.defaultSettings?.wordCountTarget || ''}
                  onChange={(e) => setNewTemplate(prev => ({ 
                    ...prev, 
                    defaultSettings: { 
                      ...prev.defaultSettings, 
                      wordCountTarget: parseInt(e.target.value) || undefined 
                    }
                  }))}
                  min="0"
                  aria-label="Default word count target"
                />
              </div>
            </div>

            {/* Dynamic structure settings based on project type */}
            <div>
              <h4 className="text-sm font-medium mb-2">Document Structure Settings</h4>
              
              {newTemplate.structure === 'novel' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="chapterCount" className="text-sm font-medium">Number of Chapters</label>
                    <Input
                      id="chapterCount"
                      type="number"
                      placeholder="e.g., 10"
                      value={newTemplate.defaultSettings?.chapterCount || ''}
                      onChange={(e) => setNewTemplate(prev => ({ 
                        ...prev, 
                        defaultSettings: { 
                          ...prev.defaultSettings, 
                          chapterCount: parseInt(e.target.value) || undefined 
                        }
                      }))}
                      min="1"
                      aria-label="Number of chapters"
                    />
                  </div>
                  <div>
                    <label htmlFor="scenesPerChapter" className="text-sm font-medium">Scenes Per Chapter</label>
                    <Input
                      id="scenesPerChapter"
                      type="number"
                      placeholder="e.g., 3"
                      value={newTemplate.defaultSettings?.scenesPerChapter || ''}
                      onChange={(e) => setNewTemplate(prev => ({ 
                        ...prev, 
                        defaultSettings: { 
                          ...prev.defaultSettings, 
                          scenesPerChapter: parseInt(e.target.value) || undefined 
                        }
                      }))}
                      min="1"
                      aria-label="Scenes per chapter"
                    />
                  </div>
                </div>
              )}

              {newTemplate.structure === 'screenplay' && (
                <div>
                  <label htmlFor="actCount" className="text-sm font-medium">Number of Acts</label>
                  <Input
                    id="actCount"
                    type="number"
                    placeholder="e.g., 3"
                    value={newTemplate.defaultSettings?.actCount || ''}
                    onChange={(e) => setNewTemplate(prev => ({ 
                      ...prev, 
                      defaultSettings: { 
                        ...prev.defaultSettings, 
                        actCount: parseInt(e.target.value) || undefined 
                      }
                    }))}
                    min="1"
                    aria-label="Number of acts"
                  />
                </div>
              )}

              {newTemplate.structure === 'poetry' && (
                <div>
                  <label htmlFor="poemCount" className="text-sm font-medium">Number of Poems</label>
                  <Input
                    id="poemCount"
                    type="number"
                    placeholder="e.g., 10"
                    value={newTemplate.defaultSettings?.poemCount || ''}
                    onChange={(e) => setNewTemplate(prev => ({ 
                      ...prev, 
                      defaultSettings: { 
                        ...prev.defaultSettings, 
                        poemCount: parseInt(e.target.value) || undefined 
                      }
                    }))}
                    min="1"
                    aria-label="Number of poems"
                  />
                </div>
              )}

              {newTemplate.structure === 'research' && (
                <div>
                  <label htmlFor="researchSections" className="text-sm font-medium">Number of Research Sections</label>
                  <Input
                    id="researchSections"
                    type="number"
                    placeholder="e.g., 5"
                    value={newTemplate.defaultSettings?.researchSections || ''}
                    onChange={(e) => setNewTemplate(prev => ({ 
                      ...prev, 
                      defaultSettings: { 
                        ...prev.defaultSettings, 
                        researchSections: parseInt(e.target.value) || undefined 
                      }
                    }))}
                    min="1"
                    aria-label="Number of research sections"
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setEditingTemplate(null);
              setNewTemplate({
                name: '',
                description: '',
                structure: 'novel',
                features: [],
                defaultSettings: {},
              });
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate && (
                <>
                  {React.createElement(STRUCTURE_ICONS[previewTemplate.structure], { className: "h-5 w-5" })}
                  {previewTemplate.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Template preview and details
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {previewTemplate.description || 'No description provided'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <div className="flex flex-wrap gap-1">
                  {previewTemplate.features?.map((feature: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground">No features listed</span>}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Default Settings</h4>
                <div className="space-y-1 text-sm">
                  <div>Type: <Badge variant="secondary">{STRUCTURE_LABELS[previewTemplate.structure as keyof typeof STRUCTURE_LABELS]}</Badge></div>
                  {previewTemplate.defaultSettings.wordCountTarget && (
                    <div>Word Count Target: {previewTemplate.defaultSettings.wordCountTarget.toLocaleString()} words</div>
                  )}
                  {previewTemplate.defaultSettings.genre && (
                    <div>Genre: {previewTemplate.defaultSettings.genre}</div>
                  )}
                  {previewTemplate.defaultSettings.writingStyle && (
                    <div>Writing Style: {previewTemplate.defaultSettings.writingStyle}</div>
                  )}
                  
                  {/* Document structure settings */}
                  {previewTemplate.structure === 'novel' && (
                    <>
                      {previewTemplate.defaultSettings.chapterCount && (
                        <div>Chapters: {previewTemplate.defaultSettings.chapterCount}</div>
                      )}
                      {previewTemplate.defaultSettings.scenesPerChapter && (
                        <div>Scenes per Chapter: {previewTemplate.defaultSettings.scenesPerChapter}</div>
                      )}
                    </>
                  )}
                  
                  {previewTemplate.structure === 'screenplay' && previewTemplate.defaultSettings.actCount && (
                    <div>Acts: {previewTemplate.defaultSettings.actCount}</div>
                  )}
                  
                  {previewTemplate.structure === 'poetry' && previewTemplate.defaultSettings.poemCount && (
                    <div>Poems: {previewTemplate.defaultSettings.poemCount}</div>
                  )}
                  
                  {previewTemplate.structure === 'research' && previewTemplate.defaultSettings.researchSections && (
                    <div>Research Sections: {previewTemplate.defaultSettings.researchSections}</div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
            {previewTemplate && onTemplateSelect && (
              <Button onClick={() => {
                onTemplateSelect(previewTemplate);
                setIsPreviewDialogOpen(false);
              }}>
                Use This Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTemplateToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTemplate}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateLibraryManager;
