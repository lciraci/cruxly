import posthog from 'posthog-js';

// Cookieless analytics: persistence stays in memory, so nothing is written to
// the visitor's device and no consent banner is required. The tradeoff is that
// a full page reload starts a new anonymous session.
// Tracking is disabled entirely when NEXT_PUBLIC_POSTHOG_KEY is unset.
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    capture_pageview: 'history_change',
    capture_pageleave: true,
    persistence: 'memory',
    person_profiles: 'identified_only',
  });
}
