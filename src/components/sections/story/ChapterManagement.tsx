
import React, { useState } from 'react';
import { Plus, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDocumentOutline } from '@/hooks/outline/useDocumentOutline';
import type { Chapter } from '@/hooks/outline/types';

const ChapterManagement = () => {
  const { outlineStructure, addItem, updateItem, deleteItem } = useDocumentOutline();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const chapters = outlineStructure.items
    .filter(item => item.type === 'chapter')
    .sort((a, b) => a.position - b.position);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingChapter) {
      updateItem(editingChapter.id, {
        title: formData.title,
        description: formData.description
      });
    } else {
      addItem({
        type: 'chapter',
        title: formData.title,
        description: formData.description,
        status: 'not-started',
        position: chapters.length,
        wordCount: 0
      });
    }

    setFormData({ title: '', description: '' });
    setEditingChapter(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (chapter: any) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      description: chapter.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (chapterId: string) => {
    deleteItem(chapterId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'needs-revision': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          Chapters
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => {
              setEditingChapter(null);
              setFormData({ title: '', description: '' });
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Chapter Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter chapter title..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the chapter..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingChapter ? 'Update' : 'Create'} Chapter
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {chapters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No chapters yet</p>
            <p className="text-sm">Create your first chapter to get started</p>
          </div>
        ) : (
          chapters.map((chapter) => (
            <Card key={chapter.id} className="border border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{chapter.title}</CardTitle>
                    {chapter.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(chapter)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(chapter.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(chapter.status)} text-white`}
                    >
                      {chapter.status.replace('-', ' ')}
                    </Badge>
                    <span className="text-muted-foreground">
                      {chapter.wordCount || 0} words
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    Chapter {chapter.position + 1}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ChapterManagement;
