
import type { AIAction } from './types';

export const getPromptForAction = (action: AIAction, text: string): string => {
  switch (action) {
    case 'improve':
      return `Improve this text by making it clearer, more engaging, and better written. Return ONLY the improved text without explanations: "${text}"`;
    case 'shorten':
      return `Make this text more concise while keeping the same meaning. Return ONLY the shortened text: "${text}"`;
    case 'expand':
      return `Expand this text with more detail and depth. Return ONLY the expanded text: "${text}"`;
    case 'fix-grammar':
      return `Fix any grammar, spelling, or punctuation errors in this text. Return ONLY the corrected text: "${text}"`;
    case 'continue':
    case 'continue-story':
      return `Continue this text naturally in the same style and voice. Return ONLY the continuation text without any introduction or explanation: "${text}"`;
    case 'analyze-tone':
      return `Analyze the tone and style of this text: "${text}"`;
    default:
      return `Process this text: "${text}"`;
  }
};

export const cleanAIResponse = (response: string, action: AIAction): string => {
  if (!response) return '';
  
  // For continuation and extension actions, remove common AI prefixes/suffixes
  if (action === 'continue' || action === 'continue-story' || action === 'improve' || action === 'expand') {
    let cleaned = response.trim();
    
    // Remove common AI response prefixes
    const prefixesToRemove = [
      /^Here's the continuation:/i,
      /^Here's the improved text:/i,
      /^Here's the expanded text:/i,
      /^Continuing the text:/i,
      /^The continuation would be:/i,
      /^I'll continue this text:/i,
      /^Here's how it could continue:/i,
      /^The text continues:/i,
      /^Continuation:/i,
      /^Here is the/i,
      /^The improved version:/i,
      /^Improved text:/i,
      /^Enhanced version:/i
    ];
    
    // Remove common AI response suffixes and meta-commentary
    const suffixesToRemove = [
      /This continuation maintains the same tone and style\.?$/i,
      /This follows the established narrative voice\.?$/i,
      /This preserves the original style\.?$/i,
      /Hope this helps!?$/i,
      /Let me know if you'd like me to adjust anything\.?$/i,
      /The narrative flows beautifully here\.?$/i,
      /This moment held deeper significance[^.]*\.$/i,
      /revealing layers of meaning[^.]*\.$/i
    ];
    
    // Remove meta-commentary patterns that shouldn't be in the actual text
    const metaCommentaryPatterns = [
      /\. The narrative flows beautifully here\./gi,
      /\. This moment held deeper significance[^.]*\./gi,
      /\. revealing layers of meaning[^.]*\./gi,
      /\([^)]*commentary[^)]*\)/gi,
      /\([^)]*flows beautifully[^)]*\)/gi,
      /\([^)]*narrative[^)]*\)/gi
    ];
    
    // Apply prefix removal
    for (const prefix of prefixesToRemove) {
      cleaned = cleaned.replace(prefix, '').trim();
    }
    
    // Apply suffix removal
    for (const suffix of suffixesToRemove) {
      cleaned = cleaned.replace(suffix, '').trim();
    }
    
    // Remove meta-commentary patterns
    for (const pattern of metaCommentaryPatterns) {
      cleaned = cleaned.replace(pattern, '.').trim();
    }
    
    // Remove quotes if the entire response is wrapped in them
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    
    // Clean up any double periods or spaces
    cleaned = cleaned.replace(/\.+/g, '.').replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }
  
  return response.trim();
};

export const performMockTextProcessing = async (text: string, action: AIAction, model: string): Promise<string> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
  
  let result = '';
  
  switch (action) {
    case 'improve':
      result = text.replace(/\b(good|nice|okay)\b/gi, 'excellent')
        .replace(/\b(bad|poor)\b/gi, 'challenging');
      break;
    case 'continue':
    case 'continue-story':
      // Generate clean continuation without meta-commentary
      const continuations = [
        ' The shadows lengthened as evening approached, casting everything in a golden hue.',
        ' She paused, listening to the distant sound of footsteps echoing down the corridor.',
        ' The weight of the decision pressed heavily on his shoulders as he considered his options.',
        ' Time seemed to slow as the moment stretched between them, heavy with unspoken words.',
        ' The old house creaked softly, as if sharing its secrets with those who would listen.',
        ' Outside, the wind picked up, rattling the windows with increasing intensity.',
        ' He felt the familiar tingle of anticipation as the story began to unfold.',
        ' The silence was broken only by the steady rhythm of rain against the glass.'
      ];
      result = continuations[Math.floor(Math.random() * continuations.length)];
      break;
    case 'shorten':
      result = text.split(' ').slice(0, Math.max(1, Math.floor(text.split(' ').length * 0.7))).join(' ');
      break;
    case 'expand':
      result = text + ' The details became clearer as the scene unfolded before them.';
      break;
    case 'fix-grammar':
      result = text.replace(/\bi\b/g, 'I').replace(/([.!?])\s*([a-z])/g, '$1 $2'.toUpperCase());
      break;
    default:
      result = text;
  }
  
  return cleanAIResponse(result, action);
};

export const makeAPIRequest = async (
  provider: any,
  apiKey: string,
  model: string,
  prompt: string,
  action: AIAction
): Promise<string> => {
  // This would make actual API calls to real providers
  // For now, return mock response that simulates real API behavior
  const mockResponse = await performMockTextProcessing(prompt.split('"')[1] || prompt, action, model);
  return cleanAIResponse(mockResponse, action);
};
