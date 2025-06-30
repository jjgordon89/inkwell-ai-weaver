import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, Bot, Palette, Shield, User, Bell, ArrowLeft, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import DatabaseSettings from '@/components/settings/DatabaseSettings';
import AISettingsPanel from '@/components/settings/AISettingsPanel';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import WritingSettingsPanel from '@/components/settings/WritingSettingsPanel';

const SettingsPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/projects">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <Tabs defaultValue="writing" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="writing" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            Writing
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="writing" className="mt-6">
          <WritingSettingsPanel />
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <DatabaseSettings />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AISettingsPanel />
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
