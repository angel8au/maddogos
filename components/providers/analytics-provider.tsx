"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { captureSessionAttribution, trackPageView } from "@/lib/analytics";

function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureSessionAttribution(searchParams);
  }, [searchParams]);

  useEffect(() => {
    if (!pathname) return;
    const search = searchParams.toString();
    trackPageView(pathname, search ? `?${search}` : "");
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsPageView />
      </Suspense>
      {children}
    </>
  );
}
