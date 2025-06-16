import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Download, 
  Upload, 
  Settings, 
  Palette, 
  FileText, 
  Brain, 
  Shield,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';

const DatabaseSettings: React.FC = () => {
  const { 
    isInitialized, 
    settings, 
    loading, 
    error,
    getSetting,
    setSetting,
    getSettingsByCategory,
    deleteSetting,
    updateMultipleSettings,
    exportSettings,
    importSettings,
    clearError 
  } = useDatabase();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('appearance');
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [importData, setImportData] = useState('');

  // Load settings when database is ready
  useEffect(() => {
    if (isInitialized && !loading) {
      loadCategorySettings(activeTab);
    }
  }, [isInitialized, loading, activeTab]);

  const loadCategorySettings = async (category: string) => {
    try {
      const categorySettings = await getSettingsByCategory(category);
      const settingsMap: Record<string, string> = {};
      
      categorySettings.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });
      
      setLocalSettings(settingsMap);
      setHasChanges(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      const settingsToUpdate = Object.entries(localSettings).map(([key, value]) => ({
        key,
        value,
        category: activeTab
      }));

      await updateMultipleSettings(settingsToUpdate);
      setHasChanges(false);
      
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportSettings();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inkwell-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Settings exported successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to export settings",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    try {
      await importSettings(importData);
      setImportData('');
      await loadCategorySettings(activeTab);
      
      toast({
        title: "Success",
        description: "Settings imported successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to import settings",
        variant: "destructive"
      });
    }
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select 
          value={localSettings.theme || 'system'} 
          onValueChange={(value) => handleSettingChange('theme', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="font_family">Font Family</Label>
        <Select 
          value={localSettings.font_family || 'Inter'} 
          onValueChange={(value) => handleSettingChange('font_family', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
            <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
            <SelectItem value="Lato">Lato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="font_size">Font Size</Label>
        <Input
          id="font_size"
          type="number"
          min="10"
          max="24"
          value={localSettings.font_size || '14'}
          onChange={(e) => handleSettingChange('font_size', e.target.value)}
        />
      </div>
    </div>
  );

  const renderEditorSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="auto_save"
          checked={localSettings.auto_save === 'true'}
          onCheckedChange={(checked) => handleSettingChange('auto_save', checked.toString())}
        />
        <Label htmlFor="auto_save">Enable Auto Save</Label>
      </div>

      {localSettings.auto_save === 'true' && (
        <div className="space-y-2">
          <Label htmlFor="auto_save_interval">Auto Save Interval (ms)</Label>
          <Input
            id="auto_save_interval"
            type="number"
            min="5000"
            max="300000"
            step="5000"
            value={localSettings.auto_save_interval || '30000'}
            onChange={(e) => handleSettingChange('auto_save_interval', e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Current: {Math.round((parseInt(localSettings.auto_save_interval || '30000') / 1000))} seconds
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="editor_theme">Editor Theme</Label>
        <Select 
          value={localSettings.editor_theme || 'default'} 
          onValueChange={(value) => handleSettingChange('editor_theme', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select editor theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="high-contrast">High Contrast</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="default_ai_provider">Default AI Provider</Label>
        <Select 
          value={localSettings.default_ai_provider || 'OpenAI'} 
          onValueChange={(value) => handleSettingChange('default_ai_provider', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select AI provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OpenAI">OpenAI</SelectItem>
            <SelectItem value="Google Gemini">Google Gemini</SelectItem>
            <SelectItem value="Groq">Groq</SelectItem>
            <SelectItem value="OpenRouter">OpenRouter</SelectItem>
            <SelectItem value="Ollama">Ollama</SelectItem>
            <SelectItem value="LM Studio">LM Studio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ai_cache_enabled"
          checked={localSettings.ai_cache_enabled === 'true'}
          onCheckedChange={(checked) => handleSettingChange('ai_cache_enabled', checked.toString())}
        />
        <Label htmlFor="ai_cache_enabled">Enable AI Response Caching</Label>
      </div>

      {localSettings.ai_cache_enabled === 'true' && (
        <div className="space-y-2">
          <Label htmlFor="ai_cache_expiry">Cache Expiry (ms)</Label>
          <Input
            id="ai_cache_expiry"
            type="number"
            min="60000"
            max="86400000"
            step="300000"
            value={localSettings.ai_cache_expiry || '3600000'}
            onChange={(e) => handleSettingChange('ai_cache_expiry', e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Current: {Math.round((parseInt(localSettings.ai_cache_expiry || '3600000') / 60000))} minutes
          </p>
        </div>
      )}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="analytics_enabled"
          checked={localSettings.analytics_enabled === 'true'}
          onCheckedChange={(checked) => handleSettingChange('analytics_enabled', checked.toString())}
        />
        <Label htmlFor="analytics_enabled">Enable Analytics</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="crash_reporting"
          checked={localSettings.crash_reporting === 'true'}
          onCheckedChange={(checked) => handleSettingChange('crash_reporting', checked.toString())}
        />
        <Label htmlFor="crash_reporting">Enable Crash Reporting</Label>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your privacy is important. All data is stored locally in your browser and never sent to external servers unless explicitly enabled.
        </AlertDescription>
      </Alert>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Database className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Initializing database...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Settings
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Unsaved Changes
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Manage your application settings stored in the local SQLite database.
        </CardDescription>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={isInitialized ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
            {isInitialized ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {settings.length} settings stored
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="link" onClick={clearError} className="ml-2 p-0 h-auto">
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            {renderAppearanceSettings()}
          </TabsContent>

          <TabsContent value="editor">
            {renderEditorSettings()}
          </TabsContent>

          <TabsContent value="ai">
            {renderAISettings()}
          </TabsContent>

          <TabsContent value="privacy">
            {renderPrivacySettings()}
          </TabsContent>
        </Tabs>

        {hasChanges && (
          <div className="flex justify-end">
            <Button onClick={saveSettings} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}

        {/* Import/Export Section */}
        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-semibold">Import/Export Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Export Settings</Label>
              <Button onClick={handleExport} variant="outline" className="w-full flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to JSON
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Import Settings</Label>
              <div className="space-y-2">
                <textarea
                  placeholder="Paste JSON settings here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-20 p-2 border rounded resize-none text-sm"
                />
                <Button 
                  onClick={handleImport} 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  disabled={!importData.trim()}
                >
                  <Upload className="h-4 w-4" />
                  Import from JSON
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSettings;
