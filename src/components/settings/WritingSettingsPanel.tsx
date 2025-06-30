import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Moon, Sun, Type, Eye, Save } from 'lucide-react';

interface WritingSettingsProps {
  onSettingsChange?: (settings: WritingSettings) => void;
  className?: string;
}

export interface WritingSettings {
  darkMode: boolean;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  autoSave: boolean;
  autoSaveInterval: number;
  showWordCount: boolean;
  showOutline: boolean;
  focusMode: boolean;
  spellCheck: boolean;
}

const defaultSettings: WritingSettings = {
  darkMode: false,
  fontSize: 16,
  fontFamily: 'Inter',
  lineHeight: 1.6,
  autoSave: true,
  autoSaveInterval: 30,
  showWordCount: true,
  showOutline: true,
  focusMode: false,
  spellCheck: true
};

const WritingSettingsPanel: React.FC<WritingSettingsProps> = ({
  onSettingsChange,
  className = ''
}) => {
  const [settings, setSettings] = useState<WritingSettings>(defaultSettings);

  const updateSetting = <K extends keyof WritingSettings>(
    key: K,
    value: WritingSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'system-ui', label: 'System' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Monaco', label: 'Monaco' }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Writing Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Appearance
          </h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex items-center gap-2">
              {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Family
            </Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => updateSetting('fontFamily', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size: {settings.fontSize}px</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSetting('fontSize', value)}
              min={12}
              max={24}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Line Height: {settings.lineHeight}</Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={([value]) => updateSetting('lineHeight', value)}
              min={1.2}
              max={2.0}
              step={0.1}
              className="py-2"
            />
          </div>
        </div>

        <Separator />

        {/* Editor Features */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Editor Features</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-save">Auto Save</Label>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSetting('autoSave', checked)}
            />
          </div>

          {settings.autoSave && (
            <div className="space-y-2 pl-4">
              <Label>Auto Save Interval: {settings.autoSaveInterval}s</Label>
              <Slider
                value={[settings.autoSaveInterval]}
                onValueChange={([value]) => updateSetting('autoSaveInterval', value)}
                min={10}
                max={300}
                step={10}
                className="py-2"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="word-count">Show Word Count</Label>
            <Switch
              id="word-count"
              checked={settings.showWordCount}
              onCheckedChange={(checked) => updateSetting('showWordCount', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="outline">Show Outline</Label>
            <Switch
              id="outline"
              checked={settings.showOutline}
              onCheckedChange={(checked) => updateSetting('showOutline', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="focus-mode">Focus Mode</Label>
            <Switch
              id="focus-mode"
              checked={settings.focusMode}
              onCheckedChange={(checked) => updateSetting('focusMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="spell-check">Spell Check</Label>
            <Switch
              id="spell-check"
              checked={settings.spellCheck}
              onCheckedChange={(checked) => updateSetting('spellCheck', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Save Settings */}
        <Button onClick={() => onSettingsChange?.(settings)} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default WritingSettingsPanel;
