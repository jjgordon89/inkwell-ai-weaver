
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { search, Brain, Link, Map, Zap, BookOpen } from 'lucide-react';
import { useSemanticSearch } from '@/hooks/search/useSemanticSearch';
import { useAutoLinking } from '@/hooks/navigation/useAutoLinking';
import { useDynamicOutline } from '@/hooks/outline/useDynamicOutline';

const SmartNavigationPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    searchResults, 
    isSearching, 
    performSemanticSearch, 
    clearSearch,
    searchIndex 
  } = useSemanticSearch();
  
  const { 
    autoLinks, 
    getLinksByType, 
    getHighConfidenceLinks 
  } = useAutoLinking();
  
  const {
    dynamicOutline,
    outlineStats,
    isGenerating,
    generateDynamicOutline,
    acceptSuggestion,
    rejectSuggestion
  } = useDynamicOutline();

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await performSemanticSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'character': return '👤';
      case 'location': return '📍';
      case 'scene': return '🎬';
      case 'plot-point': return '⚡';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Smart Navigation
        </CardTitle>
        <CardDescription>
          AI-powered document search, auto-linking, and dynamic outlines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-1">
              <search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-1">
              <Link className="h-4 w-4" />
              Auto-Links
            </TabsTrigger>
            <TabsTrigger value="outline" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              Dynamic Outline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search across all content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <Zap className="h-4 w-4 animate-pulse" />
                ) : (
                  <search className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Searching across {searchIndex} indexed items
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map((result) => (
                  <div key={result.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <span>{getTypeIcon(result.type)}</span>
                        {result.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(result.relevanceScore)}% match
                      </Badge>
                    </div>
                    
                    {result.matchedPhrases.length > 0 && (
                      <div className="mb-2">
                        {result.matchedPhrases.map((phrase, index) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                            {phrase.length > 30 ? phrase.slice(0, 30) + '...' : phrase}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {result.context && (
                      <p className="text-xs text-muted-foreground">
                        ...{result.context}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8 text-muted-foreground">
                <search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Found {autoLinks.length} potential connections in current document
            </div>

            {autoLinks.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getHighConfidenceLinks().map((link) => (
                  <div key={link.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span>{getTypeIcon(link.type)}</span>
                        <span className="font-medium text-sm">{link.text}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(link.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {link.context}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No auto-links detected in current document</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="outline" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {outlineStats.total} items • {outlineStats.aiSuggestions} AI suggestions
              </div>
              <Button 
                size="sm" 
                onClick={generateDynamicOutline}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                ) : (
                  <BookOpen className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Analyzing...' : 'Regenerate'}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-700">{outlineStats.completed}</div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-700">{outlineStats.inProgress}</div>
                <div className="text-xs text-blue-600">In Progress</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-700">{outlineStats.planned}</div>
                <div className="text-xs text-gray-600">Planned</div>
              </div>
            </div>

            {dynamicOutline.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dynamicOutline.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span>{getTypeIcon(item.type)}</span>
                        <div>
                          <div className="font-medium text-sm">{item.title}</div>
                          {item.wordCount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {item.wordCount.toLocaleString()} words
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        {item.aiGenerated && (
                          <Badge variant="outline" className="text-xs">
                            AI Suggestion
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {item.summary && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {item.summary}
                      </p>
                    )}

                    {item.aiGenerated && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => acceptSuggestion(item.id)}
                          className="text-xs"
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => rejectSuggestion(item.id)}
                          className="text-xs"
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Map className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Generate a dynamic outline to see AI-powered structure analysis</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SmartNavigationPanel;
