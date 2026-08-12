/** Read a cookie value by name (used for Meta's _fbp/_fbc match-quality identifiers). */
function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/**
 * Fire a tracking event through both the browser Pixel (fbq) and our server-side
 * Conversions API relay (/api/fb-events), sharing one event_id so Meta deduplicates
 * the two deliveries into a single event instead of double-counting. The server leg
 * still reaches Meta when an ad blocker or iOS privacy setting drops the browser call.
 */
export function trackEvent(eventName: string, customData: Record<string, any> = {}) {
  const eventId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', eventName, customData, { eventID: eventId });
  }

  fetch('/api/fb-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: eventName,
      event_id: eventId,
      event_source_url: window.location.href,
      custom_data: customData,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    }),
    keepalive: true,
  }).catch(() => { /* best-effort — the browser pixel call above already fired */ });
}
