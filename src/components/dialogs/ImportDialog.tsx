
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useImportExport } from '@/hooks/useImportExport';
import type { ImportOptions } from '@/types/templates';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportDialog = ({ open, onOpenChange }: ImportDialogProps) => {
  const { isImporting, importDocument } = useImportExport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    format: 'txt',
    preserveFormatting: true,
    splitChapters: false,
    createOutline: true
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect format from file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && ['docx', 'txt', 'md', 'pdf', 'rtf'].includes(extension)) {
        setImportOptions(prev => ({ 
          ...prev, 
          format: extension as ImportOptions['format']
        }));
      }
    }
  };

  const handleImport = async () => {
    if (selectedFile) {
      await importDocument(selectedFile, importOptions);
      onOpenChange(false);
      setSelectedFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Document</DialogTitle>
          <DialogDescription>
            Import existing documents into your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Selection */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {selectedFile ? (
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">Click to select a file</p>
                      <p className="text-sm text-muted-foreground">
                        Supports: TXT, DOCX, MD, PDF, RTF
                      </p>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.docx,.md,.pdf,.rtf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Import Options */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Import Options
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select 
                      value={importOptions.format} 
                      onValueChange={(value: ImportOptions['format']) => 
                        setImportOptions(prev => ({ ...prev, format: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="txt">Plain Text</SelectItem>
                        <SelectItem value="docx">Word Document</SelectItem>
                        <SelectItem value="md">Markdown</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="rtf">Rich Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preserve-formatting">Preserve Formatting</Label>
                    <Switch
                      id="preserve-formatting"
                      checked={importOptions.preserveFormatting}
                      onCheckedChange={(checked) => 
                        setImportOptions(prev => ({ ...prev, preserveFormatting: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="split-chapters">Split into Chapters</Label>
                    <Switch
                      id="split-chapters"
                      checked={importOptions.splitChapters}
                      onCheckedChange={(checked) => 
                        setImportOptions(prev => ({ ...prev, splitChapters: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="create-outline">Create Outline</Label>
                    <Switch
                      id="create-outline"
                      checked={importOptions.createOutline}
                      onCheckedChange={(checked) => 
                        setImportOptions(prev => ({ ...prev, createOutline: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Document'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
