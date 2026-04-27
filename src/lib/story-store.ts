import { getSupabaseClient } from './supabase';
import { StorySnapshot, FactClaim, NarrativeDrift } from '@/types/analysis';

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

export async function getSnapshots(topic: string): Promise<StorySnapshot[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const storyId = normalizeStoryId(topic);
  const { data, error } = await supabase
    .from('story_snapshots')
    .select('*')
    .eq('story_id', storyId)
    .order('timestamp', { ascending: true })
    .limit(20);

  if (error || !data) return [];

  return data.map(row => ({
    storyId: row.story_id,
    topic: row.topic,
    timestamp: row.timestamp,
    consensusFacts: row.consensus_facts,
    disputedClaims: row.disputed_claims,
    summary: row.summary,
    sourceCount: row.source_count,
  }));
}

export async function saveSnapshot(snapshot: StorySnapshot): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase.from('story_snapshots').insert({
    story_id: snapshot.storyId,
    topic: snapshot.topic,
    timestamp: snapshot.timestamp,
    consensus_facts: snapshot.consensusFacts,
    disputed_claims: snapshot.disputedClaims,
    summary: snapshot.summary,
    source_count: snapshot.sourceCount,
  });

  // Trim to last 20 snapshots per story
  const { data } = await supabase
    .from('story_snapshots')
    .select('id')
    .eq('story_id', snapshot.storyId)
    .order('timestamp', { ascending: true });

  if (data && data.length > 20) {
    const toDelete = data.slice(0, data.length - 20).map((r: { id: number }) => r.id);
    await supabase.from('story_snapshots').delete().in('id', toDelete);
  }
}

// ─── Drift computation ────────────────────────────────────────────────────────

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
  snapshots: StorySnapshot[],
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
