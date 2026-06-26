"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import en from '../translations/en.json'
import hi from '../translations/hi.json'

type Language = 'en' | 'hi'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, fallbackOrReplacements?: any, legacyHi?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Helper to recursively find path by string value in a nested object
function findPathByValue(obj: any, target: string, path: string[] = []): string[] | null {
  if (typeof obj === 'string') {
    if (obj.trim().toLowerCase() === target.trim().toLowerCase()) {
      return path
    }
    return null
  }
  if (obj && typeof obj === 'object') {
    for (const k in obj) {
      const found = findPathByValue(obj[k], target, [...path, k])
      if (found) return found
    }
  }
  return null
}

// Helper to look up value in a nested object using a path array
function getValueByPath(obj: any, path: string[]): any {
  let current = obj
  for (const p of path) {
    if (current && typeof current === 'object' && p in current) {
      current = current[p]
    } else {
      return null
    }
  }
  return current
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('khatu_lang') as Language
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLang(saved)
    }
  }, [])

  const handleSetLang = (l: Language) => {
    setLang(l)
    localStorage.setItem('khatu_lang', l)
  }

  // Robust translation function supporting nested keys (e.g. auth.login.title) and legacy adaptation
  const t = (key: string, fallbackOrReplacements?: any, legacyHi?: string): string => {
    // Legacy mapping: t("English value", "Hindi value")
    if (typeof legacyHi === 'string') {
      if (lang === 'en') return key

      // Find path of English value inside en.json, then look up the same path in hi.json
      const path = findPathByValue(en, key)
      if (path) {
        const hiVal = getValueByPath(hi, path)
        if (hiVal && typeof hiVal === 'string') {
          return hiVal
        }
      }
      return legacyHi
    }

    // Centered JSON Key lookup (e.g. "auth.login.title")
    const translations = lang === 'en' ? en : hi
    const parts = key.split('.')
    let current: any = translations

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        current = null
        break
      }
    }

    if (current && typeof current === 'string') {
      let result = current
      // Perform replacement of variables like {phone} or {timer}
      if (fallbackOrReplacements && typeof fallbackOrReplacements === 'object') {
        Object.entries(fallbackOrReplacements).forEach(([k, v]) => {
          result = result.replace(new RegExp(`{${k}}`, 'g'), String(v))
        })
      }
      return result
    }

    // Default Fallback: Look up in English catalog, otherwise return legacy/original key
    if (lang === 'hi') {
      const enParts = key.split('.')
      let enCurrent: any = en
      for (const part of enParts) {
        if (enCurrent && typeof enCurrent === 'object' && part in enCurrent) {
          enCurrent = enCurrent[part]
        } else {
          enCurrent = null
          break
        }
      }
      if (enCurrent && typeof enCurrent === 'string') {
        // Find path in en, then look up hi
        const path = findPathByValue(en, enCurrent)
        if (path) {
          const hiVal = getValueByPath(hi, path)
          if (hiVal && typeof hiVal === 'string') {
            return hiVal
          }
        }
      }
    }

    return key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
