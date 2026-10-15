"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, scriptProps, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider scriptProps={{ async: true, ...scriptProps }} {...props}>
      {children}
    </NextThemesProvider>
  );
}
