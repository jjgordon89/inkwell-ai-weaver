
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, MessageSquare, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/useDatabase';

const NotificationSettings = () => {
  const { toast } = useToast();
  const { getSetting, setSetting, isInitialized } = useDatabase();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    writingReminders: true,
    milestoneAlerts: true,
    collaborationUpdates: false,
    reminderTime: '09:00'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!isInitialized) return;
      
      try {
        const [email, push, writing, milestone, collaboration, time] = await Promise.all([
          getSetting('notifications_email'),
          getSetting('notifications_push'),
          getSetting('notifications_writing_reminders'),
          getSetting('notifications_milestone_alerts'),
          getSetting('notifications_collaboration'),
          getSetting('notifications_reminder_time')
        ]);

        setSettings({
          emailNotifications: email === 'true',
          pushNotifications: push === 'true',
          writingReminders: writing !== 'false', // default to true
          milestoneAlerts: milestone !== 'false', // default to true
          collaborationUpdates: collaboration === 'true',
          reminderTime: time || '09:00'
        });
      } catch (error) {
        console.error('Failed to load notification settings:', error);
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
        setSetting('notifications_email', settings.emailNotifications.toString(), 'notifications'),
        setSetting('notifications_push', settings.pushNotifications.toString(), 'notifications'),
        setSetting('notifications_writing_reminders', settings.writingReminders.toString(), 'notifications'),
        setSetting('notifications_milestone_alerts', settings.milestoneAlerts.toString(), 'notifications'),
        setSetting('notifications_collaboration', settings.collaborationUpdates.toString(), 'notifications'),
        setSetting('notifications_reminder_time', settings.reminderTime, 'notifications')
      ]);

      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Browser push notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Writing Reminders</Label>
                <p className="text-xs text-muted-foreground">Daily writing goal reminders</p>
              </div>
            </div>
            <Switch
              checked={settings.writingReminders}
              onCheckedChange={(checked) => updateSetting('writingReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Milestone Alerts</Label>
                <p className="text-xs text-muted-foreground">Word count and achievement notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.milestoneAlerts}
              onCheckedChange={(checked) => updateSetting('milestoneAlerts', checked)}
            />
          </div>
        </div>

        {settings.writingReminders && (
          <div className="space-y-2">
            <Label>Daily Reminder Time</Label>
            <Select value={settings.reminderTime} onValueChange={(value) => updateSetting('reminderTime', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
                <SelectItem value="19:00">7:00 PM</SelectItem>
                <SelectItem value="20:00">8:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleSave} className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
