import posthog from 'posthog-js';

// Fire-and-forget product events for PostHog. Works for anonymous visitors,
// unlike trackEvent/user_events which require a Supabase session.
export function captureEvent(
  name: string,
  properties?: Record<string, unknown>
): void {
  if (posthog.__loaded) posthog.capture(name, properties);
}
