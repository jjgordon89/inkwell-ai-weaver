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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Create a project creation schema that extends the base schema
const createProjectSchema = projectSchema.extend({
  structure: z.enum(['novel', 'screenplay', 'research', 'poetry']).default('novel'),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

const NewProjectPage = () => {
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();
  const { showToast } = useAppToast();

  // Initialize form with our custom validation hook
  const form = useFormValidation({
    initialValues: {
      name: "",
      description: "",
      structure: "novel" as const,
      status: "draft" as const, // Add default status
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
        structure: values.structure
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

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Project</CardTitle>
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

            <div className="flex justify-end space-x-4">
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
            
            {form.errors.form && (
              <div className="text-red-500 text-sm mt-2">{form.errors.form}</div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProjectPage;
