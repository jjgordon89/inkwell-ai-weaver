import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Moon, Sun, Type, Eye, Save, GraduationCap, BookOpen, BookText, Sparkles } from 'lucide-react';

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
  // Structure-specific preferences
  academicStyleGuide: 'apa' | 'mla' | 'chicago' | 'custom';
  memoirIncludeTimeline: boolean;
  nonfictionCitationStyle: 'inline' | 'footnotes' | 'endnotes';
  enableStructureAI: boolean;
  defaultStructureType: 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction';
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
  spellCheck: true,
  academicStyleGuide: 'apa',
  memoirIncludeTimeline: false,
  nonfictionCitationStyle: 'inline',
  enableStructureAI: false,
  defaultStructureType: 'novel'
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

        {/* Document Structure */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Document Structure
          </h3>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Default Structure Type
            </Label>
            <Select
              value={settings.defaultStructureType}
              onValueChange={(value: string) => updateSetting('defaultStructureType', value as 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novel">Novel</SelectItem>
                <SelectItem value="screenplay">Screenplay</SelectItem>
                <SelectItem value="poetry">Poetry</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="memoir">Memoir</SelectItem>
                <SelectItem value="nonfiction">Nonfiction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-structure-ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Enable Structure-Aware AI
            </Label>
            <Switch
              id="enable-structure-ai"
              checked={settings.enableStructureAI}
              onCheckedChange={(checked) => updateSetting('enableStructureAI', checked)}
            />
          </div>

          {/* Academic Settings */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Academic Style Guide
            </Label>
            <Select
              value={settings.academicStyleGuide}
              onValueChange={(value: string) => updateSetting('academicStyleGuide', value as 'apa' | 'mla' | 'chicago' | 'custom')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apa">APA Style</SelectItem>
                <SelectItem value="mla">MLA Style</SelectItem>
                <SelectItem value="chicago">Chicago Style</SelectItem>
                <SelectItem value="custom">Custom Style</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Memoir Settings */}
          <div className="flex items-center justify-between">
            <Label htmlFor="memoir-timeline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Include Timeline in Memoir Structure
            </Label>
            <Switch
              id="memoir-timeline"
              checked={settings.memoirIncludeTimeline}
              onCheckedChange={(checked) => updateSetting('memoirIncludeTimeline', checked)}
            />
          </div>

          {/* Nonfiction Settings */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              Nonfiction Citation Style
            </Label>
            <Select
              value={settings.nonfictionCitationStyle}
              onValueChange={(value: string) => updateSetting('nonfictionCitationStyle', value as 'inline' | 'footnotes' | 'endnotes')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline">Inline Citations</SelectItem>
                <SelectItem value="footnotes">Footnotes</SelectItem>
                <SelectItem value="endnotes">Endnotes</SelectItem>
              </SelectContent>
            </Select>
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
