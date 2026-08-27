"use client";

import { SerwistProvider } from "@serwist/next/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function SerwistProviderWrapper({ children }: Props) {
  return (
    <SerwistProvider
      swUrl="/sw.js"
      disable={process.env.NODE_ENV === "development"}
      register
      cacheOnNavigation
      reloadOnOnline
    >
      {children}
    </SerwistProvider>
  );
}
