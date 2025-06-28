
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, Loader2 } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useImportExport } from '@/hooks/useImportExport';
import type { ExportPreset } from '@/types/templates';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportDialog = ({ open, onOpenChange }: ExportDialogProps) => {
  const { state } = useProject();
  const { exportPresets, isExporting, exportProject } = useImportExport();
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const exportableDocuments = state.flatDocuments.filter(doc => 
    doc.type !== 'folder' && doc.content && doc.content.length > 0
  );

  const handleDocumentToggle = (documentId: string, checked: boolean) => {
    setSelectedDocuments(prev => 
      checked 
        ? [...prev, documentId]
        : prev.filter(id => id !== documentId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedDocuments(checked ? exportableDocuments.map(doc => doc.id) : []);
  };

  const handleExport = async () => {
    if (selectedPreset) {
      await exportProject(selectedPreset, selectedDocuments.length > 0 ? selectedDocuments : undefined);
      onOpenChange(false);
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'epub': return 'bg-purple-100 text-purple-800';
      case 'docx': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>
            Choose a format and select documents to export
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Presets */}
          <div className="space-y-4">
            <h4 className="font-semibold">Export Formats</h4>
            <div className="space-y-3">
              {exportPresets.map((preset) => (
                <Card 
                  key={preset.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedPreset?.id === preset.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPreset(preset)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{preset.name}</CardTitle>
                      <Badge className={getFormatColor(preset.format)}>
                        {preset.format.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {preset.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Document Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Select Documents</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedDocuments.length === exportableDocuments.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">
                  Select All
                </label>
              </div>
            </div>
            
            <ScrollArea className="h-64 border rounded-lg p-3">
              <div className="space-y-2">
                {exportableDocuments.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No documents with content found</p>
                  </div>
                ) : (
                  exportableDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50"
                    >
                      <Checkbox
                        id={doc.id}
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={(checked) => handleDocumentToggle(doc.id, !!checked)}
                      />
                      <div className="flex-1 min-w-0">
                        <label 
                          htmlFor={doc.id}
                          className="text-sm font-medium cursor-pointer truncate block"
                        >
                          {doc.title}
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {doc.wordCount.toLocaleString()} words
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Export Button */}
        {selectedPreset && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{selectedPreset.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDocuments.length > 0 
                    ? `${selectedDocuments.length} document(s) selected`
                    : 'All documents will be exported'
                  }
                </p>
              </div>
              <Button 
                onClick={handleExport}
                disabled={isExporting || exportableDocuments.length === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
