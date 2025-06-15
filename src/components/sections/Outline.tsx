
import React from 'react';
import DocumentOutline from './story/DocumentOutline';

const Outline = () => {
  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Document Outline</h2>
      </div>

      <div className="flex-grow overflow-auto">
        <DocumentOutline />
      </div>
    </div>
  );
};

export default Outline;
