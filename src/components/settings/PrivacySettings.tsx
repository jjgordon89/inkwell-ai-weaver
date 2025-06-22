
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, Database, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/useDatabase';

const PrivacySettings = () => {
  const { toast } = useToast();
  const { getSetting, setSetting, isInitialized, exportSettings } = useDatabase();
  const [settings, setSettings] = useState({
    analytics: false,
    crashReporting: false,
    dataCollection: false,
    cloudSync: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!isInitialized) return;
      
      try {
        const [analytics, crash, data, cloud] = await Promise.all([
          getSetting('privacy_analytics'),
          getSetting('privacy_crash_reporting'),
          getSetting('privacy_data_collection'),
          getSetting('privacy_cloud_sync')
        ]);

        setSettings({
          analytics: analytics === 'true',
          crashReporting: crash === 'true',
          dataCollection: data === 'true',
          cloudSync: cloud !== 'false' // default to true
        });
      } catch (error) {
        console.error('Failed to load privacy settings:', error);
      }
    };

    loadSettings();
  }, [isInitialized, getSetting]);

  const handleSave = async () => {
    if (!isInitialized) {
      toast({
        title: "Error",
        description: "Database not initialized",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        setSetting('privacy_analytics', settings.analytics.toString(), 'privacy'),
        setSetting('privacy_crash_reporting', settings.crashReporting.toString(), 'privacy'),
        setSetting('privacy_data_collection', settings.dataCollection.toString(), 'privacy'),
        setSetting('privacy_cloud_sync', settings.cloudSync.toString(), 'privacy')
      ]);

      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
        // Clear localStorage as well
        localStorage.clear();
        
        // Reload the page to reset everything
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

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control your data privacy and usage preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your privacy is important to us. All data is stored locally in your browser and never sent to external servers unless explicitly enabled.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Usage Analytics</Label>
                  <p className="text-xs text-muted-foreground">Help improve the app with anonymous usage data</p>
                </div>
              </div>
              <Switch
                checked={settings.analytics}
                onCheckedChange={(checked) => updateSetting('analytics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Crash Reporting</Label>
                  <p className="text-xs text-muted-foreground">Automatically report crashes to help fix bugs</p>
                </div>
              </div>
              <Switch
                checked={settings.crashReporting}
                onCheckedChange={(checked) => updateSetting('crashReporting', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Data Collection</Label>
                  <p className="text-xs text-muted-foreground">Allow collection of feature usage data</p>
                </div>
              </div>
              <Switch
                checked={settings.dataCollection}
                onCheckedChange={(checked) => updateSetting('dataCollection', checked)}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default PrivacySettings;
