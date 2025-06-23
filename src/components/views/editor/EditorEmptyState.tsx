
import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const EditorEmptyState: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
          <p className="text-muted-foreground">
            Select a document from the binder to start writing
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorEmptyState;
