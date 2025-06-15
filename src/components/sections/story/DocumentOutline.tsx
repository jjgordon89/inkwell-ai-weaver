
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Layout, Grid3X3, Timeline, Plus, Filter } from 'lucide-react';
import { useDocumentOutline } from '@/hooks/outline/useDocumentOutline';
import HierarchyView from './outline/HierarchyView';
import CorkboardView from './outline/CorkboardView';
import TimelineView from './outline/TimelineView';
import OutlineItemForm from './outline/OutlineItemForm';
import OutlineStats from './outline/OutlineStats';

const DocumentOutline = () => {
  const {
    outlineStructure,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
    getHierarchicalStructure,
    getFilteredItems
  } = useDocumentOutline();

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const handleAddItem = (itemData: any) => {
    addItem(itemData);
    setIsAddingItem(false);
  };

  const getViewIcon = (mode: string) => {
    switch (mode) {
      case 'hierarchy': return <Layout className="h-4 w-4" />;
      case 'corkboard': return <Grid3X3 className="h-4 w-4" />;
      case 'timeline': return <Timeline className="h-4 w-4" />;
      default: return <Layout className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Document Outline
        </CardTitle>
        <CardDescription>
          Organize your story with hierarchical chapters and scenes in multiple visual formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddingItem(true)}
              disabled={isAddingItem}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="needs-revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'hierarchy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('hierarchy')}
            >
              <Layout className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'corkboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('corkboard')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              <Timeline className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <OutlineStats structure={outlineStructure} />

        {/* Add/Edit Form */}
        {isAddingItem && (
          <OutlineItemForm
            onSubmit={handleAddItem}
            onCancel={() => setIsAddingItem(false)}
            existingChapters={outlineStructure.items.filter(item => item.type === 'chapter')}
          />
        )}

        {/* Views */}
        <div className="min-h-[400px]">
          {viewMode === 'hierarchy' && (
            <HierarchyView
              structure={getHierarchicalStructure()}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onMove={moveItem}
              onEdit={setEditingItem}
            />
          )}
          
          {viewMode === 'corkboard' && (
            <CorkboardView
              items={getFilteredItems()}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onMove={moveItem}
              onEdit={setEditingItem}
            />
          )}
          
          {viewMode === 'timeline' && (
            <TimelineView
              items={getFilteredItems()}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onEdit={setEditingItem}
            />
          )}
        </div>

        {outlineStructure.items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No outline items yet</p>
            <p className="text-sm">Start organizing your story by adding chapters and scenes above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentOutline;
