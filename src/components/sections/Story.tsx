
import React, { useState } from 'react';
import { FileText, BookOpen, Zap, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SmartWritingFeatures from './story/SmartWritingFeatures';
import DocumentOutline from './story/DocumentOutline';
import SmartNavigationPanel from './story/SmartNavigationPanel';
import SmartContentManagement from './SmartContentManagement';

const Story = () => {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="writing" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="writing" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart Writing
          </TabsTrigger>
          <TabsTrigger value="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Outline
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="content-management" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Content Mgmt
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="writing" className="flex-1">
          <SmartWritingFeatures />
        </TabsContent>
        
        <TabsContent value="outline" className="flex-1">
          <DocumentOutline />
        </TabsContent>
        
        <TabsContent value="navigation" className="flex-1">
          <SmartNavigationPanel />
        </TabsContent>
        
        <TabsContent value="content-management" className="flex-1">
          <SmartContentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Story;
