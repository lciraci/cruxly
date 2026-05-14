import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? 'Breaking News';
  const truncated = query.length > 60 ? query.slice(0, 57) + '…' : query;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0d1117',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* spectrum bar decoration */}
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, right: 0, height: '6px' }}>
          <div style={{ flex: 1, background: '#1d4ed8' }} />
          <div style={{ flex: 1, background: '#38bdf8' }} />
          <div style={{ flex: 1, background: '#a1a1aa' }} />
          <div style={{ flex: 1, background: '#fb923c' }} />
          <div style={{ flex: 1, background: '#dc2626' }} />
        </div>

        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.5px' }}>
            Cruxly
          </span>
          <span style={{ fontSize: '16px', color: '#52525b', fontWeight: 400 }}>
            One story. Every side.
          </span>
        </div>

        {/* query */}
        <div
          style={{
            fontSize: truncated.length > 40 ? '48px' : '60px',
            fontWeight: 800,
            color: '#f4f4f5',
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: '32px',
          }}
        >
          {truncated}
        </div>

        {/* tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '22px', color: '#71717a' }}>
            See how 30+ outlets frame this story
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
