import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useAppToast } from "@/hooks/useAppToast";
import { useFormValidation } from "@/hooks/useFormValidation";
import { projectSchema } from "@/utils/validationUtils";
import { useCreateProject } from "@/hooks/queries/useProjectQueries";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ProjectTemplateSelector from "@/components/templates/ProjectTemplateSelector";
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
import { ArrowLeft, BookOpen, Wand2 } from "lucide-react";
import { ProjectTemplate } from "@/types/templates";
import { useState } from "react";

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
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

const NewProjectPage = () => {
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();
  const { showToast } = useAppToast();
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState<'template' | 'details'>('template');

  // Initialize form with our custom validation hook
  const form = useFormValidation({
    initialValues: {
      name: "",
      description: "",
      structure: "novel" as const,
      wordCountTarget: undefined as number | undefined,
    },
    schema: createProjectSchema,
  });

  // Form submission handler
  const handleSubmit = async (values: CreateProjectFormValues) => {
    try {
      // Show loading toast
      showToast({
        title: "Creating project",
        description: "Please wait while your project is being created...",
      });
      
      // Use the createProject mutation to create the project
      await createProjectMutation.mutateAsync({
        name: values.name,
        description: values.description ?? "", // Use empty string as fallback
        structure: values.structure,
        wordCountTarget: values.wordCountTarget,
        template: selectedTemplate?.id,
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

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    // Auto-fill form with template defaults
    form.setValue('structure', template.structure);
    if (template.defaultSettings.wordCountTarget) {
      form.setValue('wordCountTarget', template.defaultSettings.wordCountTarget);
    }
    setCurrentStep('details');
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setCurrentStep('details');
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
                  <Button onClick={() => setCurrentStep('details')}>
                    Continue with {selectedTemplate.name}
                  </Button>
                )}
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
                    onClick={() => setCurrentStep('template')}
                    disabled={form.isSubmitting}
                  >
                    Back to Templates
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
