"use client"

import React, { createContext, useContext } from "react"
import type { ScreenKey } from "@/lib/data"

export type NavigationContextType = {
  navigate: (s: ScreenKey) => void
  goBack: () => void
  pushState: (key: string, value: any) => void
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
