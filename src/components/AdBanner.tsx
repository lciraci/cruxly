'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;         // Your AdSense ad slot ID
  format?: string;      // 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  responsive?: boolean;
  className?: string;
}

/**
 * Google AdSense banner component.
 *
 * Usage:
 *   <AdBanner slot="1234567890" format="auto" responsive />
 *
 * Set NEXT_PUBLIC_ADSENSE_ID in your .env.local to enable ads.
 * Without it, this component renders nothing (no broken layouts).
 */
export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId || !adRef.current) return;

    try {
      // Push ad only if not already initialized
      const adElement = adRef.current;
      if (adElement.dataset.adStatus) return;

      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.warn('AdSense error:', err);
    }
  }, [adsenseId]);

  // Don't render anything if AdSense is not configured
  if (!adsenseId) return null;

  return (
    <div className={`ad-container my-6 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
