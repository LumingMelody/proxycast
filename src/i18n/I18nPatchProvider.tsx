/**
 * I18nPatchProvider Component
 *
 * React Provider component that manages the i18n patch state.
 * Applies DOM text replacement when language changes and watches for
 * dynamic content via MutationObserver.
 *
 * This is the core of the Patch Layer architecture - it intercepts
 * text rendering and applies translations without modifying original components.
 */

/* eslint-disable react-refresh/only-export-components */
import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { replaceTextInDOM } from "./dom-replacer";
import { Language, isValidLanguage } from "./text-map";

export interface I18nPatchContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const I18nPatchContext = createContext<I18nPatchContextValue>({
  language: "zh",
  setLanguage: () => {},
});

/**
 * Hook to access i18n patch context
 * Must be used within I18nPatchProvider
 */
export const useI18nPatch = () => {
  const context = useContext(I18nPatchContext);
  if (!context) {
    throw new Error("useI18nPatch must be used within I18nPatchProvider");
  }
  return context;
};

export interface I18nPatchProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

/**
 * I18nPatchProvider Component
 *
 * Provides i18n context and manages DOM text replacement.
 * Automatically patches new content via MutationObserver.
 */
export function I18nPatchProvider({
  children,
  initialLanguage = "zh",
}: I18nPatchProviderProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  // Validate and normalize language
  const normalizeLanguage = (lang: string): Language => {
    if (isValidLanguage(lang)) {
      return lang;
    }
    console.warn(`[i18n] Invalid language "${lang}", falling back to "zh"`);
    return "zh";
  };

  // Handle language change
  const handleSetLanguage = (lang: Language) => {
    const normalized = normalizeLanguage(lang);
    setLanguage(normalized);
  };

  useEffect(() => {
    // Apply patches when language changes
    replaceTextInDOM(language);

    // Track language changes
    if (window.__I18N_METRICS__) {
      window.__I18N_METRICS__.languageChanges++;
    }

    // Set up MutationObserver for dynamic content with debouncing
    let timeoutId: number | null = null;
    const observer = new MutationObserver((mutations) => {
      // 忽略输入框的变化（避免输入卡顿）
      const shouldIgnore = mutations.every((mutation) => {
        const target = mutation.target as HTMLElement;
        // 忽略 input、textarea 内部的变化
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("input, textarea")
        ) {
          return true;
        }
        // 忽略已经打过补丁的节点
        if (
          target instanceof Element &&
          target.hasAttribute("data-i18n-patched")
        ) {
          return true;
        }
        return false;
      });

      if (shouldIgnore) return;

      // 防抖：延迟 300ms 执行，避免频繁触发
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        replaceTextInDOM(language);
        timeoutId = null;
      }, 300);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [language]);

  return (
    <I18nPatchContext.Provider
      value={{ language, setLanguage: handleSetLanguage }}
    >
      {children}
    </I18nPatchContext.Provider>
  );
}
