
import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDocumentOutline } from '@/hooks/outline/useDocumentOutline';

const ChapterManagement = () => {
  const { addItem, updateItem, deleteItem, outlineStructure } = useDocumentOutline();
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAddChapter = () => {
    if (!chapterTitle.trim()) return;

    const newPosition = outlineStructure.items.filter(item => item.type === 'chapter').length;
    
    addItem({
      type: 'chapter',
      title: chapterTitle,
      description: '',
      status: 'not-started',
      position: newPosition,
      wordCount: 0,
      estimatedWordCount: 2000,
      content: ''
    });

    setChapterTitle('');
    setIsAddingChapter(false);
  };

  const handleEditChapter = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      setEditTitle(chapter.title);
      setEditingChapter(chapterId);
    }
  };

  const handleUpdateChapter = () => {
    if (!editTitle.trim() || !editingChapter) return;

    updateItem(editingChapter, { title: editTitle });
    setEditingChapter(null);
    setEditTitle('');
  };

  const handleDeleteChapter = (chapterId: string) => {
    deleteItem(chapterId);
  };

  const chapters = outlineStructure.items
    .filter(item => item.type === 'chapter')
    .sort((a, b) => a.position - b.position);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Chapter Management</h3>
        </div>
        
        <Dialog open={isAddingChapter} onOpenChange={setIsAddingChapter}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Chapter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chapter Title</label>
                <Input
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Enter chapter title..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddChapter()}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddChapter} className="flex-1">
                  Create Chapter
                </Button>
                <Button variant="outline" onClick={() => setIsAddingChapter(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Chapters list */}
      <div className="space-y-2">
        {chapters.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chapters created yet</p>
            <p className="text-xs">Click "Add Chapter" to get started</p>
          </div>
        ) : (
          chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Chapter {index + 1}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditChapter(chapter.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{chapter.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteChapter(chapter.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <h4 className="font-medium text-sm mb-1">{chapter.title}</h4>
              <div className="text-xs text-muted-foreground">
                {chapter.wordCount || 0} words
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Chapter Dialog */}
      <Dialog open={!!editingChapter} onOpenChange={() => setEditingChapter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chapter Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter chapter title..."
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateChapter()}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateChapter} className="flex-1">
                Update Chapter
              </Button>
              <Button variant="outline" onClick={() => setEditingChapter(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChapterManagement;
