
export const SMART_WRITING_DEFAULTS = {
  AUTO_SUGGESTIONS: [],
  NEXT_WORD_PREDICTIONS: [],
  METRICS: null,
  TOAST_DURATION: 3000
} as const;

export const TOAST_MESSAGES = {
  ANALYSIS_COMPLETE: "Analysis Complete",
  SUGGESTIONS_REFRESHED: "Suggestions refreshed!",
  NEXT_WORDS_UPDATED: "Next word predictions updated.",
  GRAMMAR_CHECKING: "Checking grammar...",
  GRAMMAR_COMPLETE: "Grammar Check Complete",
  GRAMMAR_NO_ERRORS: "No errors found.",
  GRAMMAR_CORRECTED: "Grammar and spelling have been corrected.",
  ERROR_ANALYSIS: "Failed to analyze writing quality.",
  ERROR_SUGGESTIONS: "Failed to generate suggestions.",
  ERROR_PREDICTIONS: "Failed to predict next words.",
  ERROR_GRAMMAR: "Failed to perform grammar check."
} as const;

export const TAB_CONFIG = {
  DEFAULT_TAB: "analysis",
  TABS: {
    ANALYSIS: "analysis",
    SUGGESTIONS: "suggestions",
    ASSISTANCE: "assistance"
  }
} as const;
