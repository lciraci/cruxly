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
}
