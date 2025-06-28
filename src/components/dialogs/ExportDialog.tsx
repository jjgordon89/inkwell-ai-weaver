
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download } from 'lucide-react';
import { useImportExport } from '@/hooks/useImportExport';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportDialog = ({ open, onOpenChange }: ExportDialogProps) => {
  const { exportProject, isExporting, exportPresets } = useImportExport();
  const [selectedPreset, setSelectedPreset] = useState(exportPresets[0]?.id || 'json');

  const handleExport = () => {
    exportProject();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Format</CardTitle>
              <CardDescription>
                Choose how you want to export your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPreset} onValueChange={setSelectedPreset}>
                {exportPresets.map((preset) => (
                  <div key={preset.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={preset.id} id={preset.id} />
                    <Label htmlFor={preset.id} className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {preset.description}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
