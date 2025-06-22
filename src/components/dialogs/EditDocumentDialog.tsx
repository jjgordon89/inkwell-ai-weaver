
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { DocumentNode } from '@/types/document';

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentNode | null;
  onSave: (updates: Partial<DocumentNode>) => void;
}

interface FormData {
  title: string;
  synopsis: string;
  status: DocumentNode['status'];
  targetWordCount?: number;
}

const EditDocumentDialog = ({ open, onOpenChange, document, onSave }: EditDocumentDialogProps) => {
  const form = useForm<FormData>({
    defaultValues: {
      title: document?.title || '',
      synopsis: document?.synopsis || '',
      status: document?.status || 'not-started',
      targetWordCount: document?.targetWordCount || undefined,
    },
  });

  // Reset form when document changes
  React.useEffect(() => {
    if (document) {
      form.reset({
        title: document.title,
        synopsis: document.synopsis || '',
        status: document.status,
        targetWordCount: document.targetWordCount || undefined,
      });
    }
  }, [document, form]);

  const onSubmit = (data: FormData) => {
    if (!document) return;
    
    const updates: Partial<DocumentNode> = {
      title: data.title,
      synopsis: data.synopsis,
      status: data.status,
      targetWordCount: data.targetWordCount || undefined,
    };
    
    onSave(updates);
    onOpenChange(false);
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {document.type === 'folder' ? 'Folder' : 'Document'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="synopsis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Synopsis</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description or summary..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="first-draft">First Draft</SelectItem>
                      <SelectItem value="revised">Revised</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {document.type !== 'folder' && (
              <FormField
                control={form.control}
                name="targetWordCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Word Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Optional target word count..."
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentDialog;
