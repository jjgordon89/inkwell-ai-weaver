
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormValidation } from '@/hooks/useFormValidation';
import { validationRules } from '@/utils/validation';

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
  const {
    setField,
    setFieldTouched,
    getFieldError,
    isFieldInvalid
  } = useFormValidation({
    maxTokens: {
      value: maxTokens,
      rules: [
        validationRules.required('Max tokens is required'),
        validationRules.positiveNumber('Max tokens must be a positive number'),
        validationRules.range(1, 10000, 'Max tokens must be between 1 and 10,000')
      ]
    },
    temperature: {
      value: temperature,
      rules: [
        validationRules.required('Temperature is required'),
        validationRules.number('Temperature must be a valid number'),
        validationRules.range(0, 2, 'Temperature must be between 0.0 and 2.0')
      ]
    }
  });

  const handleMaxTokensChange = (value: string) => {
    setMaxTokens(value);
    setField('maxTokens', value);
  };

  const handleTemperatureChange = (value: string) => {
    setTemperature(value);
    setField('temperature', value);
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
              min="1"
              max="10000"
              value={maxTokens}
              onChange={(e) => handleMaxTokensChange(e.target.value)}
              onBlur={() => setFieldTouched('maxTokens')}
              placeholder="1000"
              className={isFieldInvalid('maxTokens') ? "border-red-500" : ""}
            />
            {getFieldError('maxTokens') && (
              <p className="text-xs text-red-500">{getFieldError('maxTokens')}</p>
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
              onChange={(e) => handleTemperatureChange(e.target.value)}
              onBlur={() => setFieldTouched('temperature')}
              placeholder="0.7"
              className={isFieldInvalid('temperature') ? "border-red-500" : ""}
            />
            {getFieldError('temperature') && (
              <p className="text-xs text-red-500">{getFieldError('temperature')}</p>
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
