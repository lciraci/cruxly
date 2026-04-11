import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlist.json');

interface WaitlistEntry {
  email: string;
  timestamp: string;
  source: string;
}

async function ensureDataDir() {
  const dir = path.dirname(WAITLIST_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function getWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveWaitlist(entries: WaitlistEntry[]) {
  await ensureDataDir();
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const waitlist = await getWaitlist();

    // Check for duplicate
    if (waitlist.some((entry) => entry.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ message: 'Already on the waitlist' });
    }

    // Add new entry
    waitlist.push({
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      source: 'homepage',
    });

    await saveWaitlist(waitlist);

    return NextResponse.json({
      message: 'Added to waitlist',
      count: waitlist.length,
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}

// GET: See how many signups (for you to check)
export async function GET() {
  try {
    const waitlist = await getWaitlist();
    return NextResponse.json({
      count: waitlist.length,
      entries: waitlist,
    });
  } catch {
    return NextResponse.json({ count: 0, entries: [] });
  }
}
