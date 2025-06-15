
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Download, FileText, Printer, Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useExportFormats } from '@/hooks/export/useExportFormats';
import type { ExportOptions, ExportFormat, ManuscriptTemplate, SubmissionFormat, PrintLayout } from '@/hooks/export/types';

const ExportPublishing = () => {
  const { state } = useWriting();
  const { 
    availableFormats, 
    manuscriptTemplates, 
    submissionFormats, 
    printLayouts,
    isExporting,
    exportDocument,
    validateSubmissionRequirements
  } = useExportFormats();

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(availableFormats[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<ManuscriptTemplate | null>(null);
  const [selectedSubmissionFormat, setSelectedSubmissionFormat] = useState<SubmissionFormat | null>(null);
  const [selectedPrintLayout, setSelectedPrintLayout] = useState<PrintLayout | null>(null);
  const [exportOptions, setExportOptions] = useState<Partial<ExportOptions>>({
    includeMetadata: true,
    includeTableOfContents: false,
    includePageNumbers: true
  });

  const handleExport = () => {
    const options: ExportOptions = {
      format: selectedFormat,
      template: selectedTemplate || undefined,
      submissionFormat: selectedSubmissionFormat || undefined,
      printLayout: selectedPrintLayout || undefined,
      includeMetadata: exportOptions.includeMetadata || false,
      includeTableOfContents: exportOptions.includeTableOfContents || false,
      includePageNumbers: exportOptions.includePageNumbers || false
    };

    exportDocument(options);
  };

  const submissionValidation = selectedSubmissionFormat 
    ? validateSubmissionRequirements(selectedSubmissionFormat)
    : null;

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Download className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Export & Publishing</h2>
        </div>
        {state.currentDocument && (
          <Badge variant="outline" className="text-sm">
            {state.currentDocument.title}
          </Badge>
        )}
      </div>

      <div className="flex-grow overflow-auto">
        <Tabs defaultValue="formats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="formats">Export Formats</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
            <TabsTrigger value="print">Print Layout</TabsTrigger>
          </TabsList>

          <TabsContent value="formats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export Formats
                </CardTitle>
                <CardDescription>
                  Choose your preferred export format and options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableFormats.map((format) => (
                    <Card 
                      key={format.id}
                      className={`cursor-pointer transition-colors ${
                        selectedFormat.id === format.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedFormat(format)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{format.name}</h4>
                          <Badge variant="secondary">{format.extension}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {format.description}
                        </p>
                        <div className="space-y-1">
                          {format.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Export Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="metadata"
                        checked={exportOptions.includeMetadata}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeMetadata: checked }))
                        }
                      />
                      <Label htmlFor="metadata">Include Metadata</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="toc"
                        checked={exportOptions.includeTableOfContents}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeTableOfContents: checked }))
                        }
                      />
                      <Label htmlFor="toc">Table of Contents</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pages"
                        checked={exportOptions.includePageNumbers}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includePageNumbers: checked }))
                        }
                      />
                      <Label htmlFor="pages">Page Numbers</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manuscript Templates
                </CardTitle>
                <CardDescription>
                  Professional formatting templates for different types of writing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select 
                  value={selectedTemplate?.id || ""} 
                  onValueChange={(value) => {
                    const template = manuscriptTemplates.find(t => t.id === value);
                    setSelectedTemplate(template || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {manuscriptTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTemplate && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{selectedTemplate.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedTemplate.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Font:</span> {selectedTemplate.formatting.fontFamily}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {selectedTemplate.formatting.fontSize}pt
                        </div>
                        <div>
                          <span className="font-medium">Line Height:</span> {selectedTemplate.formatting.lineHeight}
                        </div>
                        <div>
                          <span className="font-medium">Margins:</span> {selectedTemplate.formatting.marginTop}"
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submission" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submission Formats
                </CardTitle>
                <CardDescription>
                  Industry-standard formats for publishers and agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select 
                  value={selectedSubmissionFormat?.id || ""} 
                  onValueChange={(value) => {
                    const format = submissionFormats.find(f => f.id === value);
                    setSelectedSubmissionFormat(format || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select submission format" />
                  </SelectTrigger>
                  <SelectContent>
                    {submissionFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedSubmissionFormat && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{selectedSubmissionFormat.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedSubmissionFormat.description}
                      </p>
                      
                      {submissionValidation && (
                        <div className="mb-4">
                          <div className={`flex items-center gap-2 p-3 rounded-lg ${
                            submissionValidation.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {submissionValidation.valid ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {submissionValidation.valid ? 'Meets requirements' : 'Requirements not met'}
                            </span>
                          </div>
                          {!submissionValidation.valid && (
                            <ul className="mt-2 space-y-1">
                              {submissionValidation.issues.map((issue, index) => (
                                <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Font:</span> {selectedSubmissionFormat.requirements.fontFamily}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {selectedSubmissionFormat.requirements.fontSize}pt
                        </div>
                        <div>
                          <span className="font-medium">Spacing:</span> {selectedSubmissionFormat.requirements.spacing}
                        </div>
                        <div>
                          <span className="font-medium">Page Numbers:</span> {selectedSubmissionFormat.requirements.pageNumbers ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="print" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Print Layout
                </CardTitle>
                <CardDescription>
                  Professional print-ready layouts for physical books
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select 
                  value={selectedPrintLayout?.id || ""} 
                  onValueChange={(value) => {
                    const layout = printLayouts.find(l => l.id === value);
                    setSelectedPrintLayout(layout || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select print layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {printLayouts.map((layout) => (
                      <SelectItem key={layout.id} value={layout.id}>
                        {layout.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPrintLayout && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{selectedPrintLayout.name}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium">Page Size:</span> {selectedPrintLayout.pageSize}
                        </div>
                        <div>
                          <span className="font-medium">Orientation:</span> {selectedPrintLayout.orientation}
                        </div>
                        <div>
                          <span className="font-medium">Gutter:</span> {selectedPrintLayout.gutterSize}"
                        </div>
                        <div>
                          <span className="font-medium">Bleed:</span> {selectedPrintLayout.bleedArea}"
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium">Chapter Settings:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            {selectedPrintLayout.chapters.startOnRightPage ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            Start on right page
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedPrintLayout.chapters.dropCap ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            Drop cap
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Ready to Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Export as {selectedFormat.name}
                    {selectedTemplate && ` with ${selectedTemplate.name} template`}
                    {selectedSubmissionFormat && ` for ${selectedSubmissionFormat.name}`}
                  </p>
                </div>
                <Button 
                  onClick={handleExport}
                  disabled={isExporting || !state.currentDocument}
                  size="lg"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Document
                    </>
                  )}
                </Button>
              </div>
              
              {isExporting && (
                <div className="mt-4">
                  <Progress value={65} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Processing document...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportPublishing;
