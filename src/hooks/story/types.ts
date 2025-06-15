
export interface Scene {
  id: string;
  title: string;
  description: string;
  act: 1 | 2 | 3;
  position: number; // position within the act
  wordCount?: number;
  conflicts: string[];
  tensionLevel: number; // 1-10 scale
  paceType: 'slow' | 'medium' | 'fast';
  characters: string[];
  location?: string;
  completed: boolean;
}

export interface Act {
  number: 1 | 2 | 3;
  title: string;
  description: string;
  scenes: Scene[];
  targetWordCount?: number;
  actualWordCount: number;
}

export interface ConflictType {
  id: string;
  type: 'internal' | 'interpersonal' | 'societal' | 'environmental';
  name: string;
  description: string;
  intensity: number; // 1-10 scale
  resolution?: string;
}

export interface PacingAnalysis {
  overallPace: 'slow' | 'moderate' | 'fast' | 'varied';
  actPacing: {
    act1: number;
    act2: number;
    act3: number;
  };
  tensionCurve: number[];
  recommendations: string[];
}

export interface StoryStructure {
  acts: Act[];
  scenes: Scene[];
  conflicts: ConflictType[];
  pacingAnalysis?: PacingAnalysis;
}
