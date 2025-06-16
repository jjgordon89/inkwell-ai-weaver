import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import database from '@/lib/database';

export const DatabaseTest: React.FC = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testKey, setTestKey] = useState('test_setting');
  const [testValue, setTestValue] = useState('test_value');
  const [retrievedValue, setRetrievedValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        setIsLoading(true);
        await database.initialize();
        setIsDbReady(true);
        setSuccess('Database initialized successfully!');
      } catch (err) {
        setError(`Failed to initialize database: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    initDb();
  }, []);

  const handleSetSetting = async () => {
    if (!isDbReady) return;
    
    try {
      setError(null);
      setSuccess(null);
      await database.setSetting(testKey, testValue, 'test');
      setSuccess(`Setting '${testKey}' saved successfully!`);
    } catch (err) {
      setError(`Failed to save setting: ${err}`);
    }
  };

  const handleGetSetting = async () => {
    if (!isDbReady) return;
    
    try {
      setError(null);
      setSuccess(null);
      const value = await database.getSetting(testKey);
      setRetrievedValue(value);
      setSuccess(`Setting '${testKey}' retrieved successfully!`);
    } catch (err) {
      setError(`Failed to get setting: ${err}`);
    }
  };

  const handleClearData = async () => {
    if (!isDbReady) return;
    
    try {
      setError(null);
      setSuccess(null);
      await database.deleteSetting(testKey);
      setRetrievedValue(null);
      setSuccess(`Setting '${testKey}' deleted successfully!`);
    } catch (err) {
      setError(`Failed to delete setting: ${err}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading database...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>SQLite Database Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="test-key">Test Key</Label>
          <Input
            id="test-key"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            placeholder="Enter test key"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-value">Test Value</Label>
          <Input
            id="test-value"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            placeholder="Enter test value"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSetSetting} disabled={!isDbReady}>
            Save Setting
          </Button>
          <Button onClick={handleGetSetting} disabled={!isDbReady} variant="outline">
            Get Setting
          </Button>
        </div>

        {retrievedValue !== null && (
          <div className="p-2 bg-muted rounded">
            <strong>Retrieved Value:</strong> {retrievedValue}
          </div>
        )}

        <Button onClick={handleClearData} disabled={!isDbReady} variant="destructive" size="sm">
          Clear Test Data
        </Button>

        <div className="text-xs text-muted-foreground">
          Status: {isDbReady ? 'Database Ready ✓' : 'Database Not Ready ✗'}
        </div>
      </CardContent>
    </Card>
  );
};
