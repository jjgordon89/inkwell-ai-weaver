import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Download,
  Upload,
  File,
  Package,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useImportExport } from '@/hooks/useImportExport';
import { Badge } from '@/components/ui/badge';

interface ProjectExporterProps {
  projectId?: string;
  className?: string;
}

const ProjectExporter: React.FC<ProjectExporterProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const { toast } = useToast();
  const { 
    exportProject, 
    exportAllProjects, 
    importProject,
    isExporting,
    isImporting,
    exportProgress,
    importProgress
  } = useImportExport();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    projectName?: string;
    projectId?: string;
    message?: string;
  } | null>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
    }
  };
  
  // Handle project import
  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a project file to import.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await importProject(selectedFile);
      
      setImportResult({
        success: true,
        projectName: result.projectName,
        projectId: result.projectId,
        message: `Successfully imported "${result.projectName}"`
      });
      
      toast({
        title: "Project imported successfully",
        description: `Imported project: ${result.projectName}`,
      });
      
      // Reset file input
      const fileInput = document.getElementById('project-import') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      });
      
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Handle single project export
  const handleExportCurrentProject = async () => {
    if (!projectId) {
      toast({
        title: "No project selected",
        description: "Please select a project to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a basic preset for export
      const preset = {
        id: 'project-export',
        name: 'Project Export',
        format: 'json'
      };
      
      await exportProject(preset, [projectId]);
      
      toast({
        title: "Project exported successfully",
        description: "Your project has been downloaded as a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Handle all projects export
  const handleExportAll = async () => {
    try {
      await exportAllProjects();
      
      toast({
        title: "All projects exported successfully",
        description: "Your projects have been downloaded as a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Project Import & Export
        </CardTitle>
        <CardDescription>
          Import and export your writing projects
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Import Project</h3>
          
          <div className="flex flex-col gap-2">
            <input
              id="project-import"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('project-import')?.click()}
                className="flex items-center gap-2"
              >
                <File className="h-4 w-4" />
                Select File
              </Button>
              
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
            
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
            
            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Importing...</span>
                  <span className="text-sm">{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}
            
            {importResult && (
              <Alert variant={importResult.success ? "default" : "destructive"}>
                {importResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{importResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{importResult.message}</AlertDescription>
                {importResult.success && importResult.projectName && (
                  <div className="mt-2">
                    <Badge variant="outline">{importResult.projectName}</Badge>
                  </div>
                )}
              </Alert>
            )}
          </div>
        </div>
        
        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Export</h3>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleExportCurrentProject}
              disabled={isExporting || !projectId}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Current Project
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportAll}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Export All Projects
            </Button>
          </div>
          
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Exporting...</span>
                <span className="text-sm">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Exported projects are saved as JSON files and contain all project content, settings, and structure.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProjectExporter;
