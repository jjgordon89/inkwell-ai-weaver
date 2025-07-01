import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useAppToast } from "@/hooks/useAppToast";
import { useFormValidation } from "@/hooks/useFormValidation";
import { projectSchema } from "@/utils/validationUtils";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ProjectTemplateSelector from "@/components/templates/ProjectTemplateSelector";
import DocumentStructureCustomizer, { DocumentStructureSettings } from "@/components/templates/DocumentStructureCustomizer";
import { useProjectCreation } from "@/hooks/useProjectCreation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Wand2, Layers } from "lucide-react";
import { UnifiedProjectTemplate } from "@/types/unified-templates";
import { useState, useEffect } from "react";

// Create a project creation schema that excludes status since it's set on the backend
const createProjectSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(100, "Project name cannot exceed 100 characters"),
  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  structure: z.enum(['novel', 'screenplay', 'research', 'poetry']),
  wordCountTarget: z.number()
    .int("Word count target must be a whole number")
    .nonnegative("Word count target must be a positive number")
    .optional(),
  // Document structure settings
  chapterCount: z.number().int().min(1).optional(),
  scenesPerChapter: z.number().int().min(1).optional(),
  actCount: z.number().int().min(1).optional(),
  poemCount: z.number().int().min(1).optional(),
  researchSections: z.number().int().min(1).optional(),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

const NewProjectPage = () => {
  const navigate = useNavigate();
  const createProjectMutation = useProjectCreation();
  const { showToast } = useAppToast();
  const [selectedTemplate, setSelectedTemplate] = useState<UnifiedProjectTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState<'template' | 'structure' | 'details'>('template');
  
  // Document structure settings
  const [structureSettings, setStructureSettings] = useState<DocumentStructureSettings>({
    chapterCount: 10,
    scenesPerChapter: 3,
    actCount: 3,
    poemCount: 10,
    researchSections: 5
  });

  // Initialize form with our custom validation hook
  const form = useFormValidation({
    initialValues: {
      name: "",
      description: "",
      structure: "novel" as const,
      wordCountTarget: undefined as number | undefined,
      chapterCount: 10,
      scenesPerChapter: 3,
      actCount: 3,
      poemCount: 10,
      researchSections: 5,
    },
    schema: createProjectSchema,
  });

  // Update form with structure settings when they change
  useEffect(() => {
    form.setValue('chapterCount', structureSettings.chapterCount);
    form.setValue('scenesPerChapter', structureSettings.scenesPerChapter);
    form.setValue('actCount', structureSettings.actCount);
    form.setValue('poemCount', structureSettings.poemCount);
    form.setValue('researchSections', structureSettings.researchSections);
  }, [structureSettings, form]);

  // Form submission handler
  const handleSubmit = async (values: CreateProjectFormValues) => {
    try {
      // Show loading toast
      showToast({
        title: "Creating project",
        description: "Please wait while your project is being created...",
      });
      
      // Use the createProject mutation to create the project with the new structure
      await createProjectMutation.mutateAsync({
        project: {
          name: values.name,
          description: values.description ?? "", // Use empty string as fallback
          structure: values.structure,
          wordCountTarget: values.wordCountTarget,
          template: selectedTemplate?.id, // Pass template ID
        },
        templateId: selectedTemplate?.id, // Pass template ID separately for document generation
        structureSettings: structureSettings
      });
      
      // Show success toast
      showToast({
        title: "Success",
        description: "Project created successfully!",
        variant: "default"
      });
      
      // Navigate back to projects page on success
      navigate("/projects");
    } catch (error) {
      console.error("Failed to create project:", error);
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create the project",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = (template: UnifiedProjectTemplate) => {
    setSelectedTemplate(template);
    // Auto-fill form with template defaults
    form.setValue('structure', template.structure);
    if (template.defaultSettings.wordCountTarget) {
      form.setValue('wordCountTarget', template.defaultSettings.wordCountTarget);
    }
    
    // Initialize structure settings from template
    setStructureSettings({
      chapterCount: template.defaultSettings.chapterCount || 10,
      scenesPerChapter: template.defaultSettings.scenesPerChapter || 3,
      actCount: template.defaultSettings.actCount || 3,
      poemCount: template.defaultSettings.poemCount || 10,
      researchSections: template.defaultSettings.researchSections || 5,
    });
    
    // Move to structure step
    setCurrentStep('structure');
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setCurrentStep('structure');
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/projects")}
            aria-label="Back to Projects"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground">
              {currentStep === 'template' 
                ? 'Choose a template to get started quickly' 
                : 'Enter your project details'}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === 'template' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <Wand2 className="h-4 w-4" />
            </div>
            <div className={`w-16 h-1 rounded ${
              currentStep === 'structure' || currentStep === 'details' ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === 'structure' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <Layers className="h-4 w-4" />
            </div>
            <div className={`w-16 h-1 rounded ${
              currentStep === 'details' ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === 'details' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Template Selection Step */}
        {currentStep === 'template' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Choose a Template
              </CardTitle>
              <CardDescription>
                Start with a pre-configured template or create a blank project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectTemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateSelect={handleTemplateSelect}
              />
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleSkipTemplate}>
                  Skip Template
                </Button>
                {selectedTemplate && (
                  <Button onClick={() => setCurrentStep('structure')}>
                    Continue with {selectedTemplate.name}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Structure Customization Step */}
        {currentStep === 'structure' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Customize Document Structure
              </CardTitle>
              <CardDescription>
                Customize how your document will be organized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentStructureCustomizer
                structure={form.values.structure || 'novel'}
                template={selectedTemplate}
                settings={structureSettings}
                onChange={setStructureSettings}
              />
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('template')}
                >
                  Back to Templates
                </Button>
                <Button onClick={() => setCurrentStep('details')}>
                  Continue to Project Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Details Step */}
        {currentStep === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Project Details
              </CardTitle>
              {selectedTemplate && (
                <CardDescription>
                  Using template: <strong>{selectedTemplate.name}</strong>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormItem>
                  <FormLabel htmlFor="name">Project Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Enter project name"
                      aria-required="true"
                      {...form.getFieldProps("name")}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a descriptive name for your project.
                  </FormDescription>
                  {form.errors.name && form.touched.name && (
                    <FormMessage>{form.errors.name}</FormMessage>
                  )}
                </FormItem>

                <FormItem>
                  <FormLabel htmlFor="description">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      placeholder="Describe your project"
                      className="resize-none"
                      {...form.getFieldProps("description")}
                    />
                  </FormControl>
                  <FormDescription>
                    Add a brief description to help remember the project's purpose.
                  </FormDescription>
                  {form.errors.description && form.touched.description && (
                    <FormMessage>{form.errors.description}</FormMessage>
                  )}
                </FormItem>
                
                <FormItem>
                  <FormLabel htmlFor="structure">Project Type</FormLabel>
                  <Select
                    value={form.values.structure as string}
                    onValueChange={(value) => form.setValue("structure", value as CreateProjectFormValues["structure"])}
                  >
                    <FormControl>
                      <SelectTrigger id="structure">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="novel">Novel</SelectItem>
                      <SelectItem value="screenplay">Screenplay</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="poetry">Poetry</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of project you want to create.
                  </FormDescription>
                  {form.errors.structure && form.touched.structure && (
                    <FormMessage>{form.errors.structure}</FormMessage>
                  )}
                </FormItem>

                <FormItem>
                  <FormLabel htmlFor="wordCountTarget">Word Count Target (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      id="wordCountTarget"
                      type="number"
                      placeholder="e.g., 50000"
                      {...form.getFieldProps("wordCountTarget")}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        form.setValue("wordCountTarget", value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Set a word count goal for your project.
                  </FormDescription>
                  {form.errors.wordCountTarget && form.touched.wordCountTarget && (
                    <FormMessage>{form.errors.wordCountTarget}</FormMessage>
                  )}
                </FormItem>

                <div className="flex justify-between space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep('structure')}
                    disabled={form.isSubmitting}
                  >
                    Back to Structure
                  </Button>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/projects")}
                      disabled={form.isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={form.isSubmitting}>
                      {form.isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" text="" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Project"
                      )}
                    </Button>
                  </div>
                </div>
                
                {form.errors.form && (
                  <div className="text-red-500 text-sm mt-2">{form.errors.form}</div>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewProjectPage;
