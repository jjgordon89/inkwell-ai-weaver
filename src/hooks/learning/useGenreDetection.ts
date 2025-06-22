
import { useState, useCallback } from 'react';

export interface GenreScore {
  genre: string;
  confidence: number;
  indicators: string[];
}

export interface GenreAnalysis {
  primaryGenre: string;
  confidence: number;
  allScores: GenreScore[];
  detectedElements: string[];
}

const GENRE_INDICATORS = {
  fantasy: {
    keywords: ['magic', 'wizard', 'dragon', 'realm', 'quest', 'enchanted', 'spell', 'kingdom', 'prophecy', 'sword'],
    patterns: [/\b(cast|casting|casted)\s+(a\s+)?spell/i, /\bmagic(al)?\s+(power|energy|force)/i]
  },
  scifi: {
    keywords: ['robot', 'space', 'alien', 'technology', 'future', 'laser', 'cybernetic', 'quantum', 'starship', 'android'],
    patterns: [/\b(space\s+)?(ship|station|colony)/i, /\b(cyber|nano|quantum|bio)\w*/i]
  },
  mystery: {
    keywords: ['detective', 'clue', 'murder', 'suspect', 'investigation', 'evidence', 'alibi', 'witness', 'crime', 'victim'],
    patterns: [/\b(solve|solving|solved)\s+the\s+(case|mystery|crime)/i, /\bwho\s+(killed|murdered)/i]
  },
  romance: {
    keywords: ['love', 'heart', 'kiss', 'relationship', 'passion', 'romantic', 'beloved', 'affection', 'intimacy', 'wedding'],
    patterns: [/\b(fell|falling)\s+in\s+love/i, /\bheart\s+(raced|pounded|fluttered)/i]
  },
  thriller: {
    keywords: ['danger', 'chase', 'escape', 'threat', 'suspense', 'adrenaline', 'fear', 'panic', 'pursuit', 'terror'],
    patterns: [/\b(heart\s+)?(pounding|racing)\s+(with\s+)?(fear|terror|adrenaline)/i, /\blife\s+or\s+death/i]
  },
  horror: {
    keywords: ['horror', 'nightmare', 'scream', 'blood', 'ghost', 'demon', 'haunted', 'evil', 'darkness', 'monster'],
    patterns: [/\b(blood\s+)?(curdling|chilling)\s+scream/i, /\b(dark|evil)\s+(presence|force|entity)/i]
  },
  historical: {
    keywords: ['century', 'era', 'ancient', 'medieval', 'victorian', 'colonial', 'empire', 'dynasty', 'nobility', 'peasant'],
    patterns: [/\b(18th|19th|20th)\s+century/i, /\bin\s+the\s+year\s+\d{3,4}/i]
  },
  literary: {
    keywords: ['consciousness', 'existence', 'meaning', 'philosophy', 'metaphor', 'symbolism', 'introspection', 'humanity', 'society', 'culture'],
    patterns: [/\bthe\s+human\s+condition/i, /\blife\s+and\s+death/i]
  }
};

export const useGenreDetection = () => {
  const [genreHistory, setGenreHistory] = useState<GenreAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const detectGenre = useCallback(async (text: string): Promise<GenreAnalysis> => {
    if (!text || text.trim().length < 100) {
      return {
        primaryGenre: 'general',
        confidence: 0,
        allScores: [],
        detectedElements: []
      };
    }

    setIsAnalyzing(true);

    try {
      const lowerText = text.toLowerCase();
      const words = lowerText.match(/\b\w+\b/g) || [];
      const wordCount = words.length;
      
      const genreScores: GenreScore[] = [];

      // Analyze each genre
      Object.entries(GENRE_INDICATORS).forEach(([genre, indicators]) => {
        let score = 0;
        const foundIndicators: string[] = [];

        // Check keywords
        indicators.keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = (text.match(regex) || []).length;
          if (matches > 0) {
            score += matches * 2; // Weight keywords highly
            foundIndicators.push(keyword);
          }
        });

        // Check patterns
        indicators.patterns.forEach(pattern => {
          const matches = (text.match(pattern) || []).length;
          if (matches > 0) {
            score += matches * 3; // Weight patterns even higher
            foundIndicators.push(`pattern: ${pattern.toString()}`);
          }
        });

        // Normalize score by text length
        const normalizedScore = Math.min(1, score / Math.max(wordCount * 0.01, 1));
        
        if (normalizedScore > 0) {
          genreScores.push({
            genre,
            confidence: normalizedScore,
            indicators: foundIndicators
          });
        }
      });

      // Sort by confidence
      genreScores.sort((a, b) => b.confidence - a.confidence);

      const primaryGenre = genreScores.length > 0 ? genreScores[0].genre : 'general';
      const confidence = genreScores.length > 0 ? genreScores[0].confidence : 0;
      const detectedElements = genreScores.flatMap(gs => gs.indicators).slice(0, 10);

      const analysis: GenreAnalysis = {
        primaryGenre,
        confidence,
        allScores: genreScores.slice(0, 5), // Top 5 genres
        detectedElements
      };

      // Store in history
      setGenreHistory(prev => [analysis, ...prev].slice(0, 20));

      return analysis;
    } catch (error) {
      console.error('Genre detection failed:', error);
      return {
        primaryGenre: 'general',
        confidence: 0,
        allScores: [],
        detectedElements: []
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getGenreSpecificSuggestions = useCallback((genre: string): string[] => {
    const suggestions = {
      fantasy: [
        'Consider adding more world-building details about the magic system',
        'Develop the mythology and lore behind your fantasy elements',
        'Show the consequences and limitations of magical abilities',
        'Add more sensory details to magical scenes'
      ],
      scifi: [
        'Explain the science behind your technology in accessible terms',
        'Consider the social implications of your futuristic elements',
        'Add technical details that feel authentic but not overwhelming',
        'Explore how technology affects character relationships'
      ],
      mystery: [
        'Plant subtle clues that readers can follow along',
        'Develop red herrings that feel authentic',
        'Show detective work and logical deduction',
        'Build tension through pacing and revelation timing'
      ],
      romance: [
        'Focus on emotional beats and character development',
        'Show relationship growth through actions, not just dialogue',
        'Build romantic tension through conflict and resolution',
        'Add intimate moments that reveal character depth'
      ],
      thriller: [
        'Maintain pacing with short, punchy sentences during action',
        'Use cliffhangers at chapter ends to maintain suspense',
        'Show physical and emotional stakes clearly',
        'Build tension through time pressure and obstacles'
      ],
      horror: [
        'Build atmosphere through setting and sensory details',
        'Use the unknown to create fear rather than explicit gore',
        'Pace revelations to maximize psychological impact',
        'Ground supernatural elements in believable reactions'
      ],
      historical: [
        'Research period-appropriate language and customs',
        'Integrate historical events naturally into the narrative',
        'Show how historical context affects character choices',
        'Balance historical accuracy with narrative flow'
      ],
      literary: [
        'Focus on character psychology and internal conflict',
        'Use symbolism and metaphor to deepen themes',
        'Explore universal human experiences through specific details',
        'Consider the broader social and philosophical implications'
      ]
    };

    return suggestions[genre as keyof typeof suggestions] || [
      'Focus on clear, engaging prose',
      'Develop characters through action and dialogue',
      'Show rather than tell important story elements',
      'Maintain consistent pacing and narrative flow'
    ];
  }, []);

  const getDominantGenre = useCallback((): string => {
    if (genreHistory.length === 0) return 'general';
    
    // Calculate genre frequency over recent history
    const genreCounts: Record<string, number> = {};
    const recentHistory = genreHistory.slice(0, 10);
    
    recentHistory.forEach(analysis => {
      genreCounts[analysis.primaryGenre] = (genreCounts[analysis.primaryGenre] || 0) + 1;
    });
    
    const dominantGenre = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';
    
    return dominantGenre;
  }, [genreHistory]);

  return {
    detectGenre,
    getGenreSpecificSuggestions,
    getDominantGenre,
    genreHistory,
    isAnalyzing
  };
};
