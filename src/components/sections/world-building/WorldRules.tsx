
import React, { useState } from 'react';
import { Shield, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorldRules } from '@/hooks/worldbuilding/useWorldRules';
import { useWriting } from '@/contexts/WritingContext';
import type { WorldRule } from '@/hooks/worldbuilding/types';

const WorldRules = () => {
  const { state } = useWriting();
  const {
    rules,
    consistencyIssues,
    isCheckingConsistency,
    addRule,
    updateRule,
    deleteRule,
    checkConsistency,
    getRulesByCategory
  } = useWorldRules();

  const [isAddingRule, setIsAddingRule] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WorldRule['category'] | 'all'>('all');
  const [ruleForm, setRuleForm] = useState<Partial<WorldRule>>({
    title: '',
    description: '',
    category: 'magic',
    examples: [],
    exceptions: [],
    relatedRules: [],
    consistency: 'high'
  });

  const handleAddRule = () => {
    if (ruleForm.title?.trim() && ruleForm.description?.trim()) {
      addRule(ruleForm as Omit<WorldRule, 'id'>);
      setRuleForm({
        title: '',
        description: '',
        category: 'magic',
        examples: [],
        exceptions: [],
        relatedRules: [],
        consistency: 'high'
      });
      setIsAddingRule(false);
    }
  };

  const handleCheckConsistency = async () => {
    if (state.currentDocument?.content) {
      try {
        await checkConsistency(state.currentDocument.content);
      } catch (error) {
        console.error('Consistency check failed:', error);
      }
    }
  };

  const filteredRules = selectedCategory === 'all' ? rules : getRulesByCategory(selectedCategory);

  const getCategoryColor = (category: WorldRule['category']) => {
    switch (category) {
      case 'magic':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
      case 'technology':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'society':
        return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
      case 'physics':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
      case 'economy':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
      case 'politics':
        return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
    }
  };

  const getConsistencyColor = (consistency: WorldRule['consistency']) => {
    switch (consistency) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          World Rules & Consistency
        </h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleCheckConsistency} 
            variant="outline" 
            size="sm"
            disabled={isCheckingConsistency || !state.currentDocument?.content}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {isCheckingConsistency ? 'Checking...' : 'Check Consistency'}
          </Button>
          <Button onClick={() => setIsAddingRule(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {consistencyIssues.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              Consistency Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {consistencyIssues.map((issue, index) => (
                <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                  • {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {isAddingRule && (
        <Card>
          <CardHeader>
            <CardTitle>Add World Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Rule title..."
              value={ruleForm.title || ''}
              onChange={(e) => setRuleForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Rule description..."
              value={ruleForm.description || ''}
              onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={ruleForm.category || 'magic'}
                onValueChange={(value: any) => setRuleForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="magic">Magic</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="society">Society</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="politics">Politics</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={ruleForm.consistency || 'high'}
                onValueChange={(value: any) => setRuleForm(prev => ({ ...prev, consistency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Consistency</SelectItem>
                  <SelectItem value="medium">Medium Consistency</SelectItem>
                  <SelectItem value="low">Low Consistency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddRule}>Add Rule</Button>
              <Button variant="outline" onClick={() => setIsAddingRule(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Rules ({rules.length})
        </Button>
        {(['magic', 'technology', 'society', 'physics', 'economy', 'politics'] as const).map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)} ({getRulesByCategory(category).length})
          </Button>
        ))}
      </div>

      {filteredRules.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No World Rules</h3>
            <p className="text-muted-foreground mb-4">
              Define the rules that govern your world to maintain consistency in your storytelling.
            </p>
            <Button onClick={() => setIsAddingRule(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRules.map(rule => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{rule.title}</CardTitle>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(rule.category)}>
                      {rule.category}
                    </Badge>
                    <Badge variant="outline" className={getConsistencyColor(rule.consistency)}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {rule.consistency}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              {(rule.examples.length > 0 || rule.exceptions.length > 0) && (
                <CardContent>
                  {rule.examples.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-1">Examples:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {rule.examples.map((example, index) => (
                          <li key={index}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {rule.exceptions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Exceptions:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {rule.exceptions.map((exception, index) => (
                          <li key={index}>{exception}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorldRules;
