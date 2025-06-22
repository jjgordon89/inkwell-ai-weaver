
export const ENHANCED_AI_TABS = {
  CONTEXT: 'context',
  ANALYSIS: 'analysis', 
  PLOT: 'plot',
  PROMPTS: 'prompts'
} as const;

export const ENHANCED_AI_DEFAULTS = {
  CONTEXT_SUGGESTIONS: [] as string[],
  TONE_ANALYSIS: null,
  PLOT_ELEMENTS: [] as any[],
  WRITING_PROMPTS: [] as any[],
  STORY_CONTINUATION: ''
} as const;
