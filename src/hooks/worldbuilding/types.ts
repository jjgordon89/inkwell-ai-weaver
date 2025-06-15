
export interface WorldLocation {
  id: string;
  name: string;
  description: string;
  coordinates?: { x: number; y: number };
  type: 'city' | 'region' | 'landmark' | 'building' | 'natural';
  connections: string[]; // IDs of connected locations
  climate?: string;
  population?: number;
  governmentType?: string;
  notableFeatures: string[];
  relatedElements: string[]; // IDs of related world elements
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string; // Could be actual date or fictional date
  type: 'historical' | 'political' | 'natural' | 'cultural' | 'personal';
  locationId?: string;
  characterIds: string[];
  consequences: string[];
  relatedEvents: string[]; // IDs of related events
}

export interface WorldRule {
  id: string;
  category: 'magic' | 'technology' | 'society' | 'physics' | 'economy' | 'politics';
  title: string;
  description: string;
  examples: string[];
  exceptions: string[];
  relatedRules: string[];
  consistency: 'high' | 'medium' | 'low';
}

export interface ResearchReference {
  id: string;
  title: string;
  type: 'book' | 'article' | 'website' | 'video' | 'note' | 'image';
  url?: string;
  description: string;
  tags: string[];
  relatedElements: string[];
  dateAdded: Date;
  importance: 'high' | 'medium' | 'low';
}

export interface WorldMap {
  id: string;
  name: string;
  description: string;
  locations: WorldLocation[];
  scale: 'local' | 'regional' | 'continental' | 'global';
  mapImageUrl?: string;
}
