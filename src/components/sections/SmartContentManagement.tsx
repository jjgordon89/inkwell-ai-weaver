import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Link2, BookOpen, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useIntelligentCrossReferences } from '@/hooks/ai/useIntelligentCrossReferences';
import { useResearchIntegration } from '@/hooks/ai/useResearchIntegration';
import { useExportOptimization } from '@/hooks/ai/useExportOptimization';

const SmartContentManagement = () => {
  const [selectedExportFormat, setSelectedExportFormat] = useState<string>('epub');
  
  const {
    connections,
    isAnalyzing: isAnalyzingConnections,
    analyzeConnections,
    acceptConnection,
    rejectConnection,
    getConnectionsByType
  } = useIntelligentCrossReferences();

  const {
    suggestions: researchSuggestions,
    isAnalyzing: isAnalyzingResearch,
    analyzeResearchIntegration,
    applyIntegration
  } = useResearchIntegration();

  const {
    optimizations,
    isAnalyzing: isAnalyzingExport,
    analyzeForExport,
    applyOptimization,
    getOptimizationsByCategory
  } = useExportOptimization();

  function getConnectionIcon(type: string) {
    switch (type) {
      case 'character-appears': return '👤';
      case 'plot-development': return '📈';
      case 'thematic-link': return '🎭';
      case 'research-support': return '📚';
      case 'narrative-flow': return '➡️';
      default: return '🔗';
    }
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'historical': return '🏛️';
      case 'technical': return '⚙️';
      case 'character': return '👥';
      case 'setting': return '🏞️';
      case 'cultural': return '🌍';
      default: return '📝';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  }

  return (
    <div className="h-full bg-muted/30 p-4 flex flex-col space-y-6 border-l">
      <div>
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Smart Content Management
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          AI-powered cross-references, research integration, and export optimization.
        </p>
      </div>

      <div className="flex-grow overflow-auto">
        <Tabs defaultValue="cross-references" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cross-references" className="flex items-center gap-1">
              <Link2 className="h-4 w-4" />
              Cross-Refs
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Research
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cross-references" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  Intelligent Cross-References
                  <Button 
                    size="sm" 
                    onClick={analyzeConnections}
                    disabled={isAnalyzingConnections}
                  >
                    {isAnalyzingConnections ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Analyze'
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  AI-detected connections between chapters, characters, and plot points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {connections.length > 0 ? (
                  connections.slice(0, 10).map((connection) => (
                    <div key={connection.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getConnectionIcon(connection.connectionType)}</span>
                          <div>
                            <div className="font-medium text-sm">
                              {connection.fromTitle} → {connection.toTitle}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {connection.connectionType.replace('-', ' ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(connection.strength * 100)}%
                          </Badge>
                          {connection.aiGenerated && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => acceptConnection(connection.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => rejectConnection(connection.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {connection.context}
                      </p>
                      {connection.suggestions.length > 0 && (
                        <div className="space-y-1">
                          {connection.suggestions.slice(0, 2).map((suggestion, index) => (
                            <div key={index} className="text-xs bg-muted/50 p-2 rounded">
                              💡 {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Click "Analyze" to find intelligent connections</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  Research Integration
                  <Button 
                    size="sm" 
                    onClick={analyzeResearchIntegration}
                    disabled={isAnalyzingResearch}
                  >
                    {isAnalyzingResearch ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Find Opportunities'
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  AI suggestions for incorporating research notes into your narrative
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {researchSuggestions.length > 0 ? (
                  researchSuggestions.slice(0, 8).map((suggestion) => (
                    <div key={suggestion.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
                          <div>
                            <div className="font-medium text-sm">
                              {suggestion.researchTitle} → {suggestion.targetTitle}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyIntegration(suggestion.id)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs bg-blue-50 p-2 rounded">
                          <strong>Research:</strong> {suggestion.relevantContent}
                        </div>
                        <div className="text-xs bg-green-50 p-2 rounded">
                          <strong>Suggestion:</strong> {suggestion.suggestedIntegration}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Integration point:</strong> {suggestion.integrationPoint}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Click "Find Opportunities" to analyze research integration</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  Export Optimization
                  <div className="flex items-center gap-2">
                    <Select value={selectedExportFormat} onValueChange={setSelectedExportFormat}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="epub">EPUB</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="docx">DOCX</SelectItem>
                        <SelectItem value="print">Print</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={() => analyzeForExport(selectedExportFormat)}
                      disabled={isAnalyzingExport}
                    >
                      {isAnalyzingExport ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Analyze'
                      )}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  AI suggestions for optimizing your manuscript for different publication formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {optimizations.length > 0 ? (
                  optimizations.slice(0, 10).map((optimization) => (
                    <div key={optimization.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(optimization.priority) as any} className="text-xs">
                            {optimization.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {optimization.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {optimization.autoFixable && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-fixable
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyOptimization(optimization.id)}
                          >
                            {optimization.autoFixable ? 'Fix' : 'Mark Done'}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          {optimization.issue}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          💡 {optimization.suggestion}
                        </div>
                        {optimization.affectedDocuments.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Affects {optimization.affectedDocuments.length} document(s)
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a format and click "Analyze" to optimize for export</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SmartContentManagement;
