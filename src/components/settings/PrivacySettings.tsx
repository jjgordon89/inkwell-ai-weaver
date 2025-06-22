
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, Database } from 'lucide-react';
import PrivacyToggle from './privacy/PrivacyToggleSection';
import DataManagementSection from './privacy/DataManagementSection';
import { usePrivacySettings } from './privacy/usePrivacySettings';

const PrivacySettings = () => {
  const { settings, loading, handleSave, updateSetting } = usePrivacySettings();

  const privacyOptions = [
    {
      key: 'analytics' as const,
      icon: Eye,
      title: 'Usage Analytics',
      description: 'Help improve the app with anonymous usage data'
    },
    {
      key: 'crashReporting' as const,
      icon: Database,
      title: 'Crash Reporting',
      description: 'Automatically report crashes to help fix bugs'
    },
    {
      key: 'dataCollection' as const,
      icon: Shield,
      title: 'Data Collection',
      description: 'Allow collection of feature usage data'
    }
  ];

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
            {privacyOptions.map((option) => (
              <PrivacyToggle
                key={option.key}
                icon={option.icon}
                title={option.title}
                description={option.description}
                checked={settings[option.key]}
                onCheckedChange={(checked) => updateSetting(option.key, checked)}
              />
            ))}
          </div>

          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </CardContent>
      </Card>

      <DataManagementSection />
    </div>
  );
};

export default PrivacySettings;
