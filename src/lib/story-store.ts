import fs from 'fs';
import path from 'path';
import { StorySnapshot, FactClaim, NarrativeDrift } from '@/types/analysis';

const STORE_PATH = path.join(process.cwd(), '.story-snapshots.json');

// ─── Persistence ─────────────────────────────────────────────────────────────

function loadStore(): Record<string, StorySnapshot[]> {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, StorySnapshot[]>): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// ─── Story ID ─────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or',
  'is', 'are', 'was', 'were', 'be', 'been', 'by', 'with', 'from', 'as',
  'into', 'through', 'about', 'that', 'this', 'it', 'its', 'not', 'but',
]);

export function normalizeStoryId(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .sort()
    .join('_');
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function getSnapshots(topic: string): StorySnapshot[] {
  const store = loadStore();
  const id = normalizeStoryId(topic);
  return store[id] || [];
}

export function saveSnapshot(snapshot: StorySnapshot): void {
  const store = loadStore();
  const id = snapshot.storyId;
  if (!store[id]) store[id] = [];
  store[id].push(snapshot);
  // Keep only the last 20 snapshots per story
  if (store[id].length > 20) store[id] = store[id].slice(-20);
  saveStore(store);
}

// ─── Drift computation ────────────────────────────────────────────────────────

/**
 * Fuzzy-matches two claim strings by word overlap (Jaccard on significant words).
 * Returns true when ≥30% of significant words overlap — good enough for LLM-paraphrased claims.
 */
function claimsMatch(a: string, b: string): boolean {
  const sig = (s: string) =>
    new Set(s.toLowerCase().split(/\s+/).filter(w => w.length > 4 && !STOP_WORDS.has(w)));
  const setA = sig(a);
  const setB = sig(b);
  if (setA.size === 0 || setB.size === 0) return false;
  const intersection = [...setA].filter(w => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union >= 0.3;
}

function findNew(current: FactClaim[], previous: FactClaim[]): string[] {
  return current
    .filter(c => !previous.some(p => claimsMatch(c.claim, p.claim)))
    .map(c => c.claim);
}

function findDropped(current: FactClaim[], previous: FactClaim[]): string[] {
  return previous
    .filter(p => !current.some(c => claimsMatch(c.claim, p.claim)))
    .map(p => p.claim);
}

export function computeDrift(
  current: StorySnapshot,
  snapshots: StorySnapshot[],  // all historical snapshots, oldest first
): NarrativeDrift {
  const first = snapshots[0];
  const previous = snapshots[snapshots.length - 1];

  const gainedConsensus = findNew(current.consensusFacts, previous.consensusFacts);
  const lostConsensus   = findDropped(current.consensusFacts, previous.consensusFacts);
  const newDisputed     = findNew(current.disputedClaims, previous.disputedClaims);
  const resolvedDisputed = findDropped(current.disputedClaims, previous.disputedClaims);

  const totalClaims = Math.max(
    1,
    current.consensusFacts.length + current.disputedClaims.length +
    previous.consensusFacts.length + previous.disputedClaims.length,
  );
  const changes = gainedConsensus.length + lostConsensus.length + newDisputed.length + resolvedDisputed.length;
  const driftScore = Math.min(100, Math.round((changes / totalClaims) * 100));

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceFirst = Math.round(
    (new Date(current.timestamp).getTime() - new Date(first.timestamp).getTime()) / msPerDay,
  );

  return {
    firstSeen: first.timestamp,
    daysSinceFirst,
    previousTimestamp: previous.timestamp,
    analysisCount: snapshots.length + 1,
    driftScore,
    gainedConsensus,
    lostConsensus,
    newDisputed,
    resolvedDisputed,
    firstSummary: first.summary,
    previousSummary: previous.summary,
  };
}
