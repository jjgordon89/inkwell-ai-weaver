
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import type { WorldRule } from './types';

export const useWorldRules = () => {
  const { processText, isProcessing } = useAI();
  const [rules, setRules] = useState<WorldRule[]>([]);
  const [consistencyIssues, setConsistencyIssues] = useState<string[]>([]);
  const [isCheckingConsistency, setIsCheckingConsistency] = useState(false);

  const addRule = (ruleData: Omit<WorldRule, 'id'>) => {
    const newRule: WorldRule = {
      ...ruleData,
      id: crypto.randomUUID()
    };
    setRules(prev => [...prev, newRule]);
    return newRule;
  };

  const updateRule = (ruleId: string, updates: Partial<WorldRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const checkConsistency = async (storyContent: string) => {
    setIsCheckingConsistency(true);
    
    try {
      const rulesContext = rules.map(rule => 
        `${rule.category}: ${rule.title} - ${rule.description}`
      ).join('\n');

      const prompt = `Check for consistency issues in this story content against these world rules:

World Rules:
${rulesContext}

Story Content:
${storyContent.substring(0, 2000)}...

Identify any potential inconsistencies, contradictions, or violations of the established world rules. List each issue clearly.`;

      const result = await processText(prompt, 'analyze-tone');
      const issues = result.split('\n').filter(line => line.trim().length > 0);
      setConsistencyIssues(issues);
      
      return issues;
    } catch (error) {
      console.error('Failed to check consistency:', error);
      throw new Error('Failed to check world consistency');
    } finally {
      setIsCheckingConsistency(false);
    }
  };

  const getRulesByCategory = (category: WorldRule['category']) => {
    return rules.filter(rule => rule.category === category);
  };

  return {
    rules,
    consistencyIssues,
    isCheckingConsistency: isCheckingConsistency || isProcessing,
    addRule,
    updateRule,
    deleteRule,
    checkConsistency,
    getRulesByCategory
  };
};
