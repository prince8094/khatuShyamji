"use client"
import { useState, useEffect, useCallback } from "react"
import { useNavigation } from "@/lib/contexts/NavigationContext"

export function useHistoryState<T>(key: string, initialValue: T): [T, (val: T) => void] {
  const { pushState } = useNavigation()
  
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined" && window.history.state?.[key] !== undefined) {
      return window.history.state[key]
    }
    return initialValue
  })

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state[key] !== undefined) {
        setState(e.state[key])
      } else {
        setState(initialValue)
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [key, initialValue])

  useEffect(() => {
    const handleLocalHistoryChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setState(e.detail.value)
      }
    }
    window.addEventListener('local-history-change', handleLocalHistoryChange as EventListener)
    return () => window.removeEventListener('local-history-change', handleLocalHistoryChange as EventListener)
  }, [key])

  const setHistoryState = useCallback((val: T) => {
    setState(val)
    pushState(key, val)
  }, [key, pushState])

  return [state, setHistoryState]
}
