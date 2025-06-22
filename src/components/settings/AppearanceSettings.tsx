
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Palette, Monitor, Sun, Moon } from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';

const AppearanceSettings = () => {
  const { getSetting, setSetting } = useDatabase();
  const { toast } = useToast();
  const [theme, setTheme] = useState('system');
  const [fontSize, setFontSize] = useState([14]);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const [themeValue, fontSizeValue, fontFamilyValue, compactValue] = await Promise.all([
        getSetting('theme'),
        getSetting('font_size'),
        getSetting('font_family'),
        getSetting('compact_mode')
      ]);

      if (themeValue) setTheme(themeValue);
      if (fontSizeValue) setFontSize([parseInt(fontSizeValue, 10)]);
      if (fontFamilyValue) setFontFamily(fontFamilyValue);
      if (compactValue) setCompactMode(compactValue === 'true');
    };

    loadSettings();
  }, [getSetting]);

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        setSetting('theme', theme, 'appearance'),
        setSetting('font_size', fontSize[0].toString(), 'appearance'),
        setSetting('font_family', fontFamily, 'appearance'),
        setSetting('compact_mode', compactMode.toString(), 'appearance')
      ]);

      toast({
        title: "Settings Saved",
        description: "Your appearance preferences have been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance Settings
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your writing environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Font Size: {fontSize[0]}px</Label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              max={24}
              min={10}
              step={1}
              className="flex-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
            <Label htmlFor="compact-mode">Compact Mode</Label>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save Appearance Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
