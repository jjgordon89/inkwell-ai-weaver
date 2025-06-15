
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from 'lucide-react';

interface ConfigurationActionsProps {
  onSave: () => void;
  onReset: () => void;
}

const ConfigurationActions = ({ onSave, onReset }: ConfigurationActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onReset} className="flex-1">
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset to Defaults
      </Button>
      <Button onClick={onSave} className="flex-1">
        <Save className="h-4 w-4 mr-2" />
        Save Configuration
      </Button>
    </div>
  );
};

export default ConfigurationActions;
