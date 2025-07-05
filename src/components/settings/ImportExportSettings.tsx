import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileCog, 
  ArrowRightLeft, 
  Folder, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useImportExport } from '@/hooks/useImportExport';

const ImportExportSettings = () => {
  const { toast } = useToast();
  const { 
    exportProject, 
    exportAllProjects, 
    importProject,
    isExporting,
    isImporting,
    exportProgress,
    importProgress,
    exportPresets
  } = useImportExport();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
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
      toast({
        title: "Project imported successfully",
        description: `Imported project: ${result.projectName}`,
      });
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('project-import') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Handle single project export
  const handleExportProject = async () => {
    try {
      // Use the first export preset as default
      const defaultPreset = exportPresets[0];
      await exportProject(defaultPreset);
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
        description: "Your projects have been downloaded as a ZIP file.",
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Import & Export
          </CardTitle>
          <CardDescription>
            Import and export your projects to share or backup your work
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Import Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Project
            </h3>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Information</AlertTitle>
              <AlertDescription>
                You can import projects in JSON format. The imported project will be added to your existing projects.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-import">Select Project File</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="project-import"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('project-import')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Folder className="h-4 w-4" />
                    Browse Files
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </div>
                </div>
              </div>
              
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Importing...</span>
                    <span className="text-sm">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}
              
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                className="w-full"
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Import Project
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Projects
            </h3>
            
            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Exporting...</span>
                  <span className="text-sm">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleExportProject}
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                <FileJson className="mr-2 h-4 w-4" />
                Export Current Project
              </Button>
              
              <Button
                onClick={handleExportAll}
                disabled={isExporting}
                variant="default"
                className="w-full"
              >
                <FileCog className="mr-2 h-4 w-4" />
                Export All Projects
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExportSettings;
