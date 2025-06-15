
import React, { useState } from 'react';
import { BookOpen, Plus, Search, ExternalLink, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useResearchReferences } from '@/hooks/worldbuilding/useResearchReferences';
import type { ResearchReference } from '@/hooks/worldbuilding/types';

const ResearchReferences = () => {
  const {
    references,
    selectedTags,
    setSelectedTags,
    addReference,
    updateReference,
    deleteReference,
    searchReferences,
    getAllTags
  } = useResearchReferences();

  const [isAddingReference, setIsAddingReference] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [referenceForm, setReferenceForm] = useState<Partial<ResearchReference>>({
    title: '',
    description: '',
    type: 'book',
    url: '',
    tags: [],
    relatedElements: [],
    importance: 'medium'
  });

  const handleAddReference = () => {
    if (referenceForm.title?.trim()) {
      addReference(referenceForm as Omit<ResearchReference, 'id' | 'dateAdded'>);
      setReferenceForm({
        title: '',
        description: '',
        type: 'book',
        url: '',
        tags: [],
        relatedElements: [],
        importance: 'medium'
      });
      setIsAddingReference(false);
    }
  };

  const handleAddTag = (newTag: string) => {
    if (newTag.trim() && !referenceForm.tags?.includes(newTag.trim())) {
      setReferenceForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setReferenceForm(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const displayedReferences = searchQuery 
    ? searchReferences(searchQuery) 
    : references;

  const getTypeIcon = (type: ResearchReference['type']) => {
    switch (type) {
      case 'book':
        return '📚';
      case 'article':
        return '📄';
      case 'website':
        return '🌐';
      case 'video':
        return '🎥';
      case 'note':
        return '📝';
      case 'image':
        return '🖼️';
      default:
        return '📁';
    }
  };

  const getImportanceColor = (importance: ResearchReference['importance']) => {
    switch (importance) {
      case 'high':
        return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
      case 'low':
        return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
    }
  };

  const allTags = getAllTags();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Research References
        </h3>
        <Button onClick={() => setIsAddingReference(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Reference
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search references..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Filter by Tags
          </h4>
          <div className="flex gap-2 flex-wrap">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
              >
                {tag}
              </Button>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}

      {isAddingReference && (
        <Card>
          <CardHeader>
            <CardTitle>Add Research Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Reference title..."
              value={referenceForm.title || ''}
              onChange={(e) => setReferenceForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Description..."
              value={referenceForm.description || ''}
              onChange={(e) => setReferenceForm(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={referenceForm.type || 'book'}
                onValueChange={(value: any) => setReferenceForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={referenceForm.importance || 'medium'}
                onValueChange={(value: any) => setReferenceForm(prev => ({ ...prev, importance: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Importance</SelectItem>
                  <SelectItem value="medium">Medium Importance</SelectItem>
                  <SelectItem value="low">Low Importance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="URL (optional)..."
              value={referenceForm.url || ''}
              onChange={(e) => setReferenceForm(prev => ({ ...prev, url: e.target.value }))}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {referenceForm.tags?.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tag and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddReference}>Add Reference</Button>
              <Button variant="outline" onClick={() => setIsAddingReference(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {displayedReferences.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Research References</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTags.length > 0
                ? 'No references match your current search or filters.'
                : 'Organize your research materials to keep track of inspiration and sources.'
              }
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <Button onClick={() => setIsAddingReference(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Reference
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {displayedReferences.map(reference => (
            <Card key={reference.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{getTypeIcon(reference.type)}</span>
                      {reference.title}
                      {reference.url && (
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </CardTitle>
                    <CardDescription>{reference.description}</CardDescription>
                  </div>
                  <Badge className={getImportanceColor(reference.importance)}>
                    {reference.importance}
                  </Badge>
                </div>
              </CardHeader>
              {reference.tags.length > 0 && (
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {reference.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchReferences;
