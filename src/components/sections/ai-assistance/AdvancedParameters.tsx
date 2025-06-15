
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdvancedParametersProps {
  maxTokens: string;
  setMaxTokens: (value: string) => void;
  temperature: string;
  setTemperature: (value: string) => void;
}

const AdvancedParameters = ({
  maxTokens,
  setMaxTokens,
  temperature,
  setTemperature
}: AdvancedParametersProps) => {
  const isValidTemperature = () => {
    const temp = parseFloat(temperature);
    return !isNaN(temp) && temp >= 0 && temp <= 2;
  };

  const isValidMaxTokens = () => {
    const tokens = parseInt(maxTokens);
    return !isNaN(tokens) && tokens > 0 && tokens <= 10000;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Parameters</CardTitle>
        <CardDescription>
          Fine-tune AI model behavior for your specific needs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max-tokens">Max Tokens</Label>
            <Input
              id="max-tokens"
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              placeholder="1000"
              className={!isValidMaxTokens() ? "border-red-500" : ""}
            />
            {!isValidMaxTokens() && (
              <p className="text-xs text-red-500">Must be between 1 and 10,000</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="0.7"
              className={!isValidTemperature() ? "border-red-500" : ""}
            />
            {!isValidTemperature() && (
              <p className="text-xs text-red-500">Must be between 0.0 and 2.0</p>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Max Tokens: Maximum length of AI responses (1-10,000)</p>
          <p>• Temperature: Controls creativity (0 = focused, 2 = creative)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedParameters;
