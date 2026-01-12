/**
 * i18n Module Barrel Export
 *
 * Central export point for all internationalization functionality.
 * Includes both static Patch Layer and dynamic translation utilities.
 *
 * @example
 * // Import static translation provider
 * import { I18nPatchProvider, useI18nPatch } from '@/i18n';
 *
 * // Import dynamic translation utilities
 * import { t, useT, useTranslator } from '@/i18n';
 */

// Patch Layer (Static translations via DOM replacement)
export {
  I18nPatchProvider,
  useI18nPatch,
  type I18nPatchContextValue,
  type I18nPatchProviderProps,
} from "./I18nPatchProvider";

// DOM replacer utility (advanced usage)
export { replaceTextInDOM } from "./dom-replacer";

// Text map and language types
export {
  getTextMap,
  type Language,
  isValidLanguage,
} from "./text-map";

// withI18nPatch HOC (for class components)
export { withI18nPatch } from "./withI18nPatch";

// Dynamic Translation Utilities (template-based translations)
export {
  t,
  tDuration,
  tTotalDuration,
  useT,
  useTranslator,
  hasDynamicTranslation,
  getDynamicTranslationKeys,
  formatDuration,
} from "./dynamic-translation";

// Default export for convenience
export { I18nPatchProvider as default } from "./I18nPatchProvider";
