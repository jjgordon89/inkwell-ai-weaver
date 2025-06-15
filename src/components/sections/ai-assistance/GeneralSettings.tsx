
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from 'lucide-react';

interface GeneralSettingsProps {
  autoSuggest: boolean;
  setAutoSuggest: (value: boolean) => void;
  realTimeProcessing: boolean;
  setRealTimeProcessing: (value: boolean) => void;
}

const GeneralSettings = ({
  autoSuggest,
  setAutoSuggest,
  realTimeProcessing,
  setRealTimeProcessing
}: GeneralSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          General Settings
        </CardTitle>
        <CardDescription>
          Configure how AI assistance behaves in your writing workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-suggest">Auto Suggestions</Label>
            <p className="text-sm text-muted-foreground">
              Automatically show suggestions when text is selected
            </p>
          </div>
          <Switch
            id="auto-suggest"
            checked={autoSuggest}
            onCheckedChange={setAutoSuggest}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="real-time">Real-time Processing</Label>
            <p className="text-sm text-muted-foreground">
              Process text as you type (experimental)
            </p>
          </div>
          <Switch
            id="real-time"
            checked={realTimeProcessing}
            onCheckedChange={setRealTimeProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
