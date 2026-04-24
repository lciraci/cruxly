export interface FactClaim {
  claim: string;
  sourceCount: number; // How many sources report this fact
  sources: string[]; // Which sources mention it
  confidence: 'high' | 'medium' | 'low';
}

export interface BiasIndicator {
  type: 'emotional-language' | 'omission' | 'framing' | 'source-selection';
  description: string;
  examples: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface SourceAnalysis {
  sourceId: string;
  sourceName: string;
  articleUrl: string;
  factualClaims: string[]; // Key facts extracted from this source
  biasIndicators: BiasIndicator[];
  emotionalTone: 'neutral' | 'positive' | 'negative' | 'mixed';
  keyOmissions?: string[]; // Facts other sources mention but this one doesn't
  score: number; // 0-100, factual accuracy for THIS story
}

export interface StoryAnalysis {
  topic: string;
  consensusFacts: FactClaim[]; // Facts most/all sources agree on
  disputedClaims: FactClaim[]; // Facts only some sources report
  sourceAnalyses: SourceAnalysis[];
  summary: string;
  timestamp: string;
  drift?: NarrativeDrift;      // Present when a previous snapshot exists
  snapshotCount?: number;      // Total times this story has been analyzed
}

export interface StorySnapshot {
  storyId: string;
  topic: string;
  timestamp: string;
  consensusFacts: FactClaim[];
  disputedClaims: FactClaim[];
  summary: string;
  sourceCount: number;
}

export interface NarrativeDrift {
  firstSeen: string;           // ISO timestamp of very first analysis
  daysSinceFirst: number;
  previousTimestamp: string;   // ISO timestamp of previous analysis
  analysisCount: number;       // How many times analyzed total
  driftScore: number;          // 0–100: how much the story has shifted
  gainedConsensus: string[];   // Claims that became consensus since last time
  lostConsensus: string[];     // Claims that dropped from consensus
  newDisputed: string[];       // Newly surfaced disputed claims
  resolvedDisputed: string[];  // Disputes that disappeared
  firstSummary: string;        // Original summary for side-by-side comparison
  previousSummary: string;     // Previous summary
}
