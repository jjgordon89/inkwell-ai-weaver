
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/useDatabase';

interface PrivacySettingsState {
  analytics: boolean;
  crashReporting: boolean;
  dataCollection: boolean;
  cloudSync: boolean;
}

export const usePrivacySettings = () => {
  const { toast } = useToast();
  const { getSetting, setSetting, isInitialized } = useDatabase();
  const [settings, setSettings] = useState<PrivacySettingsState>({
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
          cloudSync: cloud !== 'false'
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

  const updateSetting = (key: keyof PrivacySettingsState, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    loading,
    handleSave,
    updateSetting
  };
};
