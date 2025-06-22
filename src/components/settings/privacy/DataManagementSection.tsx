
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/useDatabase';

const DataManagementSection = () => {
  const { toast } = useToast();
  const { exportSettings } = useDatabase();

  const handleExportData = async () => {
    try {
      const data = await exportSettings();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `privacy-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Export Started",
        description: "Your data export has been downloaded."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleDeleteData = async () => {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      try {
        localStorage.clear();
        window.location.reload();
        
        toast({
          title: "Data Deletion Initiated",
          description: "Your data deletion request has been processed.",
          variant: "destructive"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete data",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Export or delete your personal data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleExportData} variant="outline" className="w-full flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export My Data
        </Button>
        
        <Button onClick={handleDeleteData} variant="destructive" className="w-full flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Delete All Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataManagementSection;
