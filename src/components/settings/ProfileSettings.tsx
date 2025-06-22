
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/useDatabase';

const ProfileSettings = () => {
  const { toast } = useToast();
  const { getSetting, setSetting, isInitialized } = useDatabase();
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Passionate writer exploring new worlds through words.',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isInitialized) return;
      
      try {
        const [name, email, bio, avatar] = await Promise.all([
          getSetting('profile_name'),
          getSetting('profile_email'),
          getSetting('profile_bio'),
          getSetting('profile_avatar')
        ]);

        setProfile({
          name: name || 'John Doe',
          email: email || 'john.doe@example.com',
          bio: bio || 'Passionate writer exploring new worlds through words.',
          avatar: avatar || ''
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
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
        setSetting('profile_name', profile.name, 'profile'),
        setSetting('profile_email', profile.email, 'profile'),
        setSetting('profile_bio', profile.bio, 'profile'),
        setSetting('profile_avatar', profile.avatar, 'profile')
      ]);

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Manage your personal information and writing profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-lg">
              {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            <Edit3 className="h-4 w-4 mr-2" />
            Change Avatar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        <Button onClick={handleSave} className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
