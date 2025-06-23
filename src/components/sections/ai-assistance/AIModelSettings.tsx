import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Crown, Clock } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

const AIModelSettings = () => {
  const { 
    selectedProvider, 
    selectedModel, 
    setSelectedModel, 
    availableProviders 
  } = useAI();

  const currentProvider = availableProviders.find(p => p.name === selectedProvider);
  const availableModels = currentProvider?.models || [];

  const getModelIcon = (modelName: string) => {
    if (modelName.includes('gpt-4') || modelName.includes('claude-opus') || modelName.includes('o3') || modelName.includes('gemini-2.0') || modelName.includes('405b') || modelName.includes('70b')) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    if (modelName.includes('turbo') || modelName.includes('haiku') || modelName.includes('mini') || modelName.includes('flash') || modelName.includes(':free') || modelName.includes('8b') || modelName.includes('7b')) {
      return <Zap className="h-4 w-4 text-blue-500" />;
    }
    return <Brain className="h-4 w-4 text-gray-500" />;
  };

  const getModelBadge = (modelName: string) => {
    if (modelName.includes(':free')) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Free</Badge>;
    }
    if (modelName.includes('gpt-4.1') || modelName.includes('claude-opus-4') || modelName.includes('o3') || modelName.includes('gemini-2.0') || modelName.includes('exp') || modelName.includes('405b')) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Premium</Badge>;
    }
    if (modelName.includes('turbo') || modelName.includes('haiku') || modelName.includes('mini') || modelName.includes('flash') || modelName.includes('8b') || modelName.includes('7b')) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Fast</Badge>;
    }
    return <Badge variant="outline">Standard</Badge>;
  };

  const getModelDescription = (modelName: string) => {
    // OpenAI models
    if (modelName.includes('gpt-4.1')) return 'OpenAI\'s flagship model with superior performance';
    if (modelName.includes('o3')) return 'Advanced reasoning model for complex problems';
    if (modelName.includes('o4-mini')) return 'Fast reasoning model optimized for efficiency';
    if (modelName.includes('gpt-3.5-turbo')) return 'Fast and efficient GPT model for general use';
    
    // Claude models
    if (modelName.includes('claude-opus-4')) return 'Anthropic\'s most capable model with superior reasoning';
    if (modelName.includes('claude-sonnet-4')) return 'High-performance model with exceptional reasoning';
    if (modelName.includes('haiku')) return 'Fastest Claude model for quick responses';
    
    // Gemini models
    if (modelName.includes('gemini-2.0-flash-exp')) return 'Google\'s latest experimental Gemini 2.0 with flash speed';
    if (modelName.includes('gemini-2.0-flash-thinking')) return 'Gemini 2.0 with advanced thinking capabilities';
    if (modelName.includes('gemini-exp-1206')) return 'Experimental Gemini model with enhanced capabilities';
    if (modelName.includes('gemini-exp-1121')) return 'Experimental Gemini model from November 2024';
    if (modelName.includes('gemini-1.5-pro-002')) return 'Latest Gemini Pro with improved performance and accuracy';
    if (modelName.includes('gemini-1.5-pro-001')) return 'Gemini Pro with advanced multimodal capabilities';
    if (modelName.includes('gemini-1.5-pro')) return 'Google\'s flagship multimodal AI with 1M+ token context';
    if (modelName.includes('gemini-1.5-flash-002')) return 'Fastest Gemini model with enhanced speed and efficiency';
    if (modelName.includes('gemini-1.5-flash-001')) return 'High-speed Gemini model for quick responses';
    if (modelName.includes('gemini-1.5-flash-8b')) return 'Lightweight Gemini model optimized for speed';
    if (modelName.includes('gemini-1.5-flash')) return 'Fast and efficient Gemini model for rapid processing';
    if (modelName.includes('gemini-pro-vision')) return 'Gemini Pro with advanced vision capabilities';
    if (modelName.includes('gemini-pro')) return 'Google\'s multimodal AI model with text and vision';
    
    // Together AI models
    if (modelName.includes('Meta-Llama-3.1-405B')) return 'Meta\'s largest and most capable Llama model';
    if (modelName.includes('Meta-Llama-3.1-70B')) return 'High-performance 70B parameter Llama model';
    if (modelName.includes('Meta-Llama-3.1-8B')) return 'Efficient 8B parameter Llama model';
    if (modelName.includes('Llama-3.2-90B-Vision')) return 'Vision-capable Llama model with 90B parameters';
    if (modelName.includes('Llama-3.2-11B-Vision')) return 'Compact vision-capable Llama model';
    if (modelName.includes('RedPajama-INCITE')) return 'Open-source instruction-tuned model';
    if (modelName.includes('Nous-Hermes-2-Mixtral')) return 'Nous Research fine-tuned Mixtral model';
    if (modelName.includes('Qwen2.5-72B')) return 'Alibaba\'s latest large language model';
    if (modelName.includes('Platypus2-70B')) return 'Fine-tuned model optimized for STEM tasks';
    
    // Perplexity models
    if (modelName.includes('sonar-small-128k-online')) return 'Small online Perplexity model with web access';
    if (modelName.includes('sonar-large-128k-online')) return 'Large online Perplexity model with web access';
    if (modelName.includes('sonar-huge-128k-online')) return 'Huge online Perplexity model with web access';
    if (modelName.includes('sonar-small-128k-chat')) return 'Small Perplexity chat model';
    if (modelName.includes('sonar-large-128k-chat')) return 'Large Perplexity chat model';
    
    // Fireworks AI models
    if (modelName.includes('llama-v3p1-405b')) return 'Fireworks-hosted Llama 3.1 405B model';
    if (modelName.includes('llama-v3p1-70b')) return 'Fireworks-hosted Llama 3.1 70B model';
    if (modelName.includes('llama-v3p1-8b')) return 'Fireworks-hosted Llama 3.1 8B model';
    if (modelName.includes('deepseek-v2p5')) return 'DeepSeek v2.5 model hosted on Fireworks';
    
    // DeepSeek models
    if (modelName.includes('deepseek-chat')) return 'DeepSeek\'s conversational AI model';
    if (modelName.includes('deepseek-coder')) return 'DeepSeek\'s code-specialized model';
    if (modelName.includes('deepseek-reasoner')) return 'DeepSeek\'s reasoning-focused model';
    
    // Cohere models
    if (modelName.includes('command-r-plus')) return 'Cohere\'s most capable command model';
    if (modelName.includes('command-r')) return 'Cohere\'s instruction-following model';
    if (modelName.includes('command-nightly')) return 'Cohere\'s experimental nightly model';
    if (modelName.includes('command-light')) return 'Cohere\'s lightweight model';
    
    // Mistral AI models
    if (modelName.includes('mistral-large-2407')) return 'Mistral\'s flagship large model from July 2024';
    if (modelName.includes('mistral-large-2402')) return 'Mistral\'s large model from February 2024';
    if (modelName.includes('mistral-medium')) return 'Mistral\'s balanced performance model';
    if (modelName.includes('mistral-small')) return 'Mistral\'s efficient small model';
    if (modelName.includes('codestral-2405')) return 'Mistral\'s code-specialized model';
    if (modelName.includes('codestral-mamba')) return 'Mistral\'s Mamba-based code model';
    if (modelName.includes('open-mistral-7b')) return 'Open-source Mistral 7B model';
    if (modelName.includes('open-mixtral-8x7b')) return 'Open-source Mixtral 8x7B model';
    if (modelName.includes('open-mixtral-8x22b')) return 'Open-source Mixtral 8x22B model';
    
    // OpenRouter specific models
    if (modelName.includes('meta-llama/llama-3.2-1b')) return 'Compact Llama model for basic tasks';
    if (modelName.includes('meta-llama/llama-3.2-3b')) return 'Small Llama model for efficient processing';
    if (modelName.includes('meta-llama/llama-3.1-8b')) return 'Medium Llama model with good performance';
    if (modelName.includes('meta-llama/codellama-34b')) return 'Code-specialized Llama model';
    if (modelName.includes('microsoft/phi-3-mini')) return 'Microsoft\'s compact efficient model';
    if (modelName.includes('microsoft/phi-3-medium')) return 'Microsoft\'s balanced performance model';
    if (modelName.includes('google/gemma-2-9b')) return 'Google\'s open Gemma model';
    if (modelName.includes('google/gemma-7b')) return 'Efficient Google Gemma model';
    if (modelName.includes('mistralai/mistral-7b')) return 'Mistral\'s efficient instruction model';
    if (modelName.includes('mistralai/mixtral-8x7b')) return 'Mistral\'s mixture of experts model';
    if (modelName.includes('mistralai/codestral-mamba')) return 'Mistral\'s code-specialized model';
    if (modelName.includes('huggingfaceh4/zephyr-7b')) return 'HuggingFace fine-tuned conversational model';
    if (modelName.includes('openchat/openchat-7b')) return 'Open-source conversational AI model';
    if (modelName.includes('cohere/command-r')) return 'Cohere\'s instruction-following model';
    if (modelName.includes('qwen/qwen-2')) return 'Alibaba\'s multilingual model';
    if (modelName.includes('nousresearch/nous-capybara')) return 'Nous Research fine-tuned model';
    if (modelName.includes('ai21/jamba-instruct')) return 'AI21\'s hybrid architecture model';
    if (modelName.includes('liquid/lfm-40b')) return 'Liquid AI\'s large foundation model';
    if (modelName.includes('01-ai/yi-34b')) return '01.AI\'s bilingual model';
    if (modelName.includes('databricks/dbrx-instruct')) return 'Databricks\' instruction-tuned model';
    if (modelName.includes('deepseek/deepseek-chat')) return 'DeepSeek\'s conversational model';
    if (modelName.includes('deepseek/deepseek-coder')) return 'DeepSeek\'s code-specialized model';
    
    // Groq models
    if (modelName.includes('llama-3.3-70b')) return 'Groq-hosted Llama 3.3 70B model';
    if (modelName.includes('llama-3.1-70b')) return 'Groq-hosted Llama 3.1 70B model';
    if (modelName.includes('llama-3.1-8b')) return 'Groq-hosted Llama 3.1 8B model';
    if (modelName.includes('mixtral-8x7b')) return 'Groq-hosted Mixtral 8x7B model';
    if (modelName.includes('gemma2-9b')) return 'Groq-hosted Gemma 2 9B model';
    
    // Other models
    if (modelName.includes('llama')) return 'Meta\'s open-source language model';
    if (modelName.includes('mixtral')) return 'Mistral\'s mixture of experts model';
    
    return 'AI language model for text generation and analysis';
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Model Selection
        </CardTitle>
        <CardDescription>
          Choose the AI model that best fits your writing needs and performance requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Selected Model</label>
          <Select 
            value={selectedModel} 
            onValueChange={handleModelChange}
            disabled={availableModels.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model">
                {selectedModel && (
                  <div className="flex items-center gap-2">
                    {getModelIcon(selectedModel)}
                    {selectedModel}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {availableModels.map((model: string) => (
                <SelectItem key={model} value={model}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {getModelIcon(model)}
                      <span>{model}</span>
                    </div>
                    {getModelBadge(model)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedModel && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                {getModelIcon(selectedModel)}
                {selectedModel}
              </h4>
              {getModelBadge(selectedModel)}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {getModelDescription(selectedModel)}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Provider: {selectedProvider}</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>Type: {currentProvider?.type || 'cloud'}</span>
              </div>
            </div>
          </div>
        )}

        {availableModels.length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No models available for the selected provider.</p>
            <p className="text-xs">Please select a provider first or check your connection.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIModelSettings;
