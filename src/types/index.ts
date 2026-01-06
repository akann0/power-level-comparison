/* Entity type representing a person, character, or object from Wikipedia */
export interface Entity {
  title: string;
  pageid: number;
  description?: string;
  thumbnail?: string;
  extract?: string;
  infobox?: Record<string, string>;
  fullContent?: string;
}

/* Search result from Wikipedia API */
export interface WikiSearchResult {
  title: string;
  pageid: number;
  description?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

/* Individual attribute with score and evidence */
export interface AttributeScore {
  name: string;
  category: 'physical' | 'mental' | 'contextual';
  scoreA: number;
  scoreB: number;
  confidenceA: number;
  confidenceB: number;
  evidenceA?: string;
  evidenceB?: string;
  rawValueA?: string;
  rawValueB?: string;
}

/* Complete comparison result between two entities */
export interface ComparisonResult {
  entityA: Entity;
  entityB: Entity;
  attributes: AttributeScore[];
  overallScoreA: number;
  overallScoreB: number;
  winner: 'A' | 'B' | 'tie';
  timestamp: number;
}

/* App state for managing comparisons */
export interface AppState {
  entityA: Entity | null;
  entityB: Entity | null;
  isLoading: boolean;
  comparison: ComparisonResult | null;
  error: string | null;
}

