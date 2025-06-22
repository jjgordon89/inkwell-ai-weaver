
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation, Search, Link, Map } from 'lucide-react';
import { useAutoLinking } from '@/hooks/navigation/useAutoLinking';
import { useSemanticSearch } from '@/hooks/search/useSemanticSearch';
import { useDynamicOutline } from '@/hooks/outline/useDynamicOutline';
import { useWriting } from '@/contexts/WritingContext';

const SmartNavigationPanel = () => {
  const { state } = useWriting();
  const { autoLinks, getLinksByType } = useAutoLinking();
  const { searchResults, isSearching, performSemanticSearch, clearSearch } = useSemanticSearch();
  const { dynamicOutline, outlineStats, isGenerating, generateDynamicOutline } = useDynamicOutline();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await performSemanticSearch(searchQuery);
    }
  };

  const characterLinks = getLinksByType('character');
  const locationLinks = getLinksByType('location');
  const sceneLinks = getLinksByType('scene');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Smart Navigation & Story Map
        </CardTitle>
        <CardDescription>
          AI-powered content discovery and visual story connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-1">
              <Link className="h-4 w-4" />
              Auto-Links
            </TabsTrigger>
            <TabsTrigger value="outline" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              Outline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search characters, scenes, plot points..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Search Results</h4>
                  <Button variant="ghost" size="sm" onClick={clearSearch}>
                    Clear
                  </Button>
                </div>
                {searchResults.slice(0, 10).map((result) => (
                  <div key={result.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{result.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.context}
                    </p>
                    {result.matchedPhrases.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.matchedPhrases.map((phrase, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {phrase.slice(0, 30)}...
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Auto-Detected Connections</h4>
              <Badge variant="outline" className="text-xs">
                {autoLinks.length} found
              </Badge>
            </div>

            {characterLinks.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  Characters
                  <Badge variant="secondary" className="text-xs">
                    {characterLinks.length}
                  </Badge>
                </h5>
                <div className="space-y-2">
                  {characterLinks.slice(0, 5).map((link) => (
                    <div key={link.id} className="p-2 bg-muted/50 rounded flex items-center justify-between">
                      <span className="text-sm font-medium">{link.text}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(link.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {locationLinks.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  Locations
                  <Badge variant="secondary" className="text-xs">
                    {locationLinks.length}
                  </Badge>
                </h5>
                <div className="space-y-2">
                  {locationLinks.slice(0, 5).map((link) => (
                    <div key={link.id} className="p-2 bg-muted/50 rounded flex items-center justify-between">
                      <span className="text-sm font-medium">{link.text}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(link.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sceneLinks.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  Related Scenes
                  <Badge variant="secondary" className="text-xs">
                    {sceneLinks.length}
                  </Badge>
                </h5>
                <div className="space-y-2">
                  {sceneLinks.map((link) => (
                    <div key={link.id} className="p-2 bg-muted/50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{link.text}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(link.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{link.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {autoLinks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No connections found in current document</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="outline" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Dynamic Story Outline</h4>
              <Button 
                size="sm" 
                onClick={generateDynamicOutline}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Refresh'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Completion</div>
                <div className="text-2xl font-bold">
                  {Math.round(outlineStats.completionPercentage)}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">AI Suggestions</div>
                <div className="text-2xl font-bold">
                  {outlineStats.aiSuggestions}
                </div>
              </div>
            </div>

            {dynamicOutline.length > 0 && (
              <div className="space-y-3">
                {dynamicOutline.slice(0, 8).map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{item.title}</h5>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        {item.aiGenerated && (
                          <Badge variant="secondary" className="text-xs">
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.summary && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.wordCount} words</span>
                      <Badge 
                        variant={
                          item.status === 'completed' ? 'default' :
                          item.status === 'in-progress' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dynamicOutline.length === 0 && !isGenerating && (
              <div className="text-center py-8 text-muted-foreground">
                <Map className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Click "Refresh" to generate a dynamic outline</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SmartNavigationPanel;
