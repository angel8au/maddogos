import posthog from "posthog-js";
import type { AnalyticsEvent, AnalyticsEventPayload } from "@/lib/analytics-events";

const ATTRIBUTION_STORAGE_KEY = "maddogos_session_attribution";

export type SessionAttribution = {
  landing_page: string;
  landing_src?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function pushDataLayer(payload: Record<string, unknown>): void {
  if (!isBrowser()) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

function isPostHogReady(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

function postHogEventName(event: AnalyticsEventPayload["event"]): string {
  return event === "page_view" ? "$pageview" : event;
}

function postHogProperties(
  payload: AnalyticsEventPayload,
): Record<string, unknown> {
  const { event: _event, ...rest } = payload as AnalyticsEventPayload & {
    event: string;
  };
  if (payload.event === "page_view") {
    return {
      $current_url: payload.page_location,
      page_path: payload.page_path,
      page_title: payload.page_title,
    };
  }
  return rest;
}

export function getAttribution(): SessionAttribution {
  if (!isBrowser()) return { landing_page: "/" };

  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return { landing_page: "/" };
    return JSON.parse(raw) as SessionAttribution;
  } catch {
    return { landing_page: "/" };
  }
}

export function captureSessionAttribution(searchParams: URLSearchParams): void {
  if (!isBrowser()) return;

  try {
    if (sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)) return;

    const attribution: SessionAttribution = {
      landing_page: `${window.location.pathname}${window.location.search}`,
      landing_src: searchParams.get("src") ?? undefined,
      utm_source: searchParams.get("utm_source") ?? undefined,
      utm_medium: searchParams.get("utm_medium") ?? undefined,
      utm_campaign: searchParams.get("utm_campaign") ?? undefined,
      utm_content: searchParams.get("utm_content") ?? undefined,
      utm_term: searchParams.get("utm_term") ?? undefined,
      referrer: document.referrer || undefined,
    };

    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    track({ event: "session_attribution", ...attribution });
  } catch {
    // sessionStorage may be unavailable in private mode.
  }
}

export function track(event: AnalyticsEvent): void {
  if (!isBrowser()) return;

  const attribution = getAttribution();
  const payload: Record<string, unknown> = {
    ...event,
    ...attribution,
    timestamp: Date.now(),
  };

  pushDataLayer(payload);

  if (isPostHogReady()) {
    posthog.capture(postHogEventName(event.event), postHogProperties(event));
  }
}

export function trackPageView(pathname: string, search: string): void {
  if (!isBrowser()) return;

  const pageLocation = `${window.location.origin}${pathname}${search}`;
  track({
    event: "page_view",
    page_path: pathname,
    page_title: document.title,
    page_location: pageLocation,
  });
}

export function trackRentalInquiryLegacy(): void {
  if (!isPostHogReady()) return;
  posthog.capture("rental_inquiry");
}
