"use client";

import { SWRConfig } from "swr";

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        revalidateIfStale: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
