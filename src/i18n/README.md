# ProxyCast Internationalization (i18n) Guide

## 📚 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Static Translations (Patch Layer)](#static-translations-patch-layer)
4. [Dynamic Translations](#dynamic-translations)
5. [Usage Examples](#usage-examples)
6. [Adding New Translations](#adding-new-translations)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

ProxyCast uses a **hybrid i18n system** combining:
- **Patch Layer**: DOM-based text replacement for static UI text
- **Dynamic Templates**: Template-based translation for text with variables

**Support Languages:**
- 🇨🇳 Chinese (zh) - Default
- 🇬🇧 English (en)

**Coverage:** ~99.5% of all UI text (static + dynamic)

---

## Architecture

```
src/i18n/
├── patches/
│   ├── zh.json          # Chinese translations (identity mappings)
│   └── en.json          # English translations
├── I18nPatchProvider.tsx  # React Provider for static translations
├── dom-replacer.ts         # DOM text replacement utility
├── dynamic-translation.ts # Dynamic translation with templates
├── text-map.ts             # Language text maps
├── withI18nPatch.tsx       # HOC for class components
└── index.ts                # Barrel export
```

### How It Works

1. **Static Text (Patch Layer)**:
   - Text defined in source code in Chinese
   - `I18nPatchProvider` wraps the app
   - `dom-replacer` walks the DOM and replaces Chinese text
   - Works automatically without component changes

2. **Dynamic Text (Templates)**:
   - Use `t()` function with placeholder syntax
   - Templates defined in `dynamic-translation.ts`
   - React hooks available: `useT`, `useTranslator`
   - Auto-updates when language changes

---

## Static Translations (Patch Layer)

### How It Works

The Patch Layer intercepts DOM rendering and replaces Chinese text with translations:

```tsx
// Source code (Chinese)
<button>保存设置</button>

// After patch (English)
<button>Save Settings</button>
```

### Setup

```tsx
import { I18nPatchProvider } from '@/i18n';

function App() {
  return (
    <I18nPatchProvider initialLanguage="zh">
      <YourApp />
    </I18nPatchProvider>
  );
}
```

### Language Switching

```tsx
import { useI18nPatch } from '@/i18n';

function LanguageSwitcher() {
  const { language, setLanguage } = useI18nPatch();

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  );
}
```

---

## Dynamic Translations

### Basic Usage

```tsx
import { t } from '@/i18n';

function FlowDetail({ flow }: { flow: Flow }) {
  return (
    <div>
      {/* Simple translation */}
      <h2>{t("new_flow_id", { id: flow.id })}</h2>

      {/* With formatted duration */}
      <p>{t("total_duration", { duration: formatDuration(flow.duration_ms) })}</p>
    </div>
  );
}
```

### React Hooks

#### `useT` - Auto-updating translation

```tsx
import { useT } from '@/i18n';

function StatusIndicator({ status }: { status: string }) {
  const statusText = useT("filter_state", { state: status });
  return <span>{statusText}</span>;
}
```

#### `useTranslator` - Bound function

```tsx
import { useTranslator } from '@/i18n';

function MyComponent() {
  const t = useTranslator();

  return (
    <div>
      <p>{t("total_duration", { duration: "1.23s" })}</p>
      <p>{t("model_name", { model: "claude-sonnet-4" })}</p>
    </div>
  );
}
```

### Utility Functions

#### `formatDuration` - Format milliseconds to human-readable string

```tsx
import { formatDuration, tDuration } from '@/i18n';

formatDuration(500);      // "500ms"
formatDuration(1234);     // "1.23s"
formatDuration(65000);    // "1m 5s"

// Shorthand functions
tDuration(500);          // "Duration: 500ms" / "耗时: 500ms"
tTotalDuration(65000);    // "Total duration: 1m 5s" / "总耗时: 1m 5s"
```

---

## Usage Examples

### Example 1: Flow Monitor

```tsx
import { t, formatDuration, useT } from '@/i18n';

function FlowListItem({ flow }: { flow: Flow }) {
  const durationText = useT("total_duration", {
    duration: formatDuration(flow.duration_ms)
  });

  return (
    <div>
      <h3>{t("flow_detail_title", { id: flow.id })}</h3>
      <p>{durationText}</p>
      <p>{t("model_name", { model: flow.model })}</p>
    </div>
  );
}
```

### Example 2: Error Messages

```tsx
import { t } from '@/i18n';

function showError(action: string, error: Error) {
  toast.error(t("error_with_message", {
    action,
    error: error.message
  }));
}

// Usage:
showError("保存", new Error("网络连接失败"));
// zh: "保存失败: 网络连接失败"
// en: "Save failed: Network connection failed"
```

### Example 3: Batch Operations

```tsx
import { t } from '@/i18n';

function BatchOperationBar({ selected }: { selected: Flow[] }) {
  return (
    <div>
      <span>{t("selected_flow_count", { count: selected.length })}</span>
      <span>{t("selected_total", {
        selected: selected.length,
        total: 100
      })}</span>
    </div>
  );
}
```

### Example 4: Configuration Display

```tsx
import { t } from '@/i18n';

function ConfigItem({ name, type, provider }: Config) {
  return (
    <div>
      <h3>{t("credential_label", {
        type,
        provider,
        id: uuid.slice(0, 8)
      })}</h3>
      <p>{t("credential_pool_label", { provider })}</p>
    </div>
  );
}
```

---

## Adding New Translations

### Adding Static Translations

1. **Add to `zh.json`** (Chinese - identity mapping):
```json
{
  "我的新文本": "我的新文本"
}
```

2. **Add to `en.json`** (English translation):
```json
{
  "我的新文本": "My New Text"
}
```

3. **Use in component** (no changes needed!):
```tsx
<button>我的新文本</button>
```

### Adding Dynamic Templates

1. **Add to `dynamic-translation.ts`**:
```typescript
const TEMPLATES: Record<string, { zh: string; en: string }> = {
  "my_new_template": {
    zh: "你好 {name}, 今天是 {date}",
    en: "Hello {name}, today is {date}",
  },
  // ...
};
```

2. **Use in component**:
```tsx
import { t } from '@/i18n';

function Greeting({ name, date }: Props) {
  return <p>{t("my_new_template", { name, date })}</p>;
}
```

3. **Add to JSON files** (optional, for documentation):
```json
// zh.json
"TEMPLATE:my_new_template": "你好 {name}, 今天是 {date}"

// en.json
"TEMPLATE:my_new_template": "Hello {name}, today is {date}"
```

---

## Available Template Keys

### Flow Monitor
| Key | Chinese | English |
|-----|---------|---------|
| `new_flow_id` | 新 Flow ID: {id} | New Flow ID: {id} |
| `total_duration` | 总耗时: {duration} | Total duration: {duration} |
| `duration` | 耗时: {duration} | Duration: {duration} |
| `model_name` | 模型: {model} | Model: {model} |
| `flow_detail_title` | Flow #{id} | Flow #{id} |
| `selected_flow_count` | 已选择 {count} 个 Flow | Selected {count} Flow(s) |
| `confirm_delete_flows` | 确定要删除选中的 {count} 个 Flow 吗？ | Are you sure you want to delete the selected {count} Flow(s)? |

### Provider/Clients
| Key | Chinese | English |
|-----|---------|---------|
| `config_mismatch` | 实际生效的配置与当前选中的 '{provider}' 不一致 | Actual effective configuration differs from currently selected '{provider}' |
| `actual_value` | 实际: {value} | Actual: {value} |
| `current_value` | 当前: {value} | Current: {value} |
| `credential_label` | {type} 凭证: {provider} - {id} | {type} credential: {provider} - {id} |
| `credential_pool_label` | 凭证池: {provider} | Credential pool: {provider} |
| `confirm_delete_config` | 确定要删除配置 "{name}" 吗？此操作无法撤销。 | Are you sure you want to delete configuration "{name}"? This action cannot be undone. |

### General Patterns
| Key | Chinese | English |
|-----|---------|---------|
| `items_count` | 共 {count} 个{item} | Total {count} {item}(s) |
| `loading_with_item` | 正在加载{item}... | Loading {item}... |
| `error_with_message` | {action}失败: {error} | {action} failed: {error} |
| `success_with_message` | {action}成功: {message} | {action} successful: {message} |
| `selected_total` | 已选择 {selected} / {total} | Selected {selected} of {total} |
| `total_records` | 共 {total} 条记录 | Total {total} record(s) |

### API Server
| Key | Chinese | English |
|-----|---------|---------|
| `start_failed` | 启动失败: {error} | Start failed: {error} |
| `stop_failed` | 停止失败: {error} | Stop failed: {error} |
| `switched_to` | 已切换到 {provider} | Switched to {provider} |
| `switch_failed` | 切换失败: {error} | Switch failed: {error} |
| `request_failed` | 请求失败: {error} | Request failed: {error} |

### And 40+ more templates...

See `src/i18n/dynamic-translation.ts` for the complete list.

---

## Best Practices

### 1. Use Static Translations for Simple Text

```tsx
// ✅ Good - Static text
<button>保存设置</button>

// ❌ Bad - Unnecessary dynamic translation
<button>{t("保存设置")}</button>
```

### 2. Use Dynamic Templates for Variable Text

```tsx
// ✅ Good - Dynamic translation
<p>{t("total_duration", { duration: formatDuration(ms) })}</p>

// ❌ Bad - Hardcoded Chinese
<p>总耗时: {(ms / 1000).toFixed(2)}s</p>
```

### 3. Use `useT` for Text That Changes

```tsx
// ✅ Good - Auto-updates on language change
const title = useT("total_duration", { duration: formatDuration(ms) });

// ⚠️ Okay - Won't auto-update
const title = t("total_duration", { duration: formatDuration(ms) });
```

### 4. Extract Common Patterns

```tsx
// ❌ Bad - Repeated code
<p>{count} 个模型</p>
<p>{count} 个请求</p>

// ✅ Good - Use template
<p>{t("items_count", { count, item: "模型" })}</p>
<p>{t("items_count", { count, item: "请求" })}</p>
```

### 5. Format Numbers and Dates Properly

```tsx
import { t } from '@/i18n';

// ✅ Good - Format before passing to t()
<p>{t("total_duration", { duration: formatDuration(ms) })}</p>
<p>{t("date_display", { date: formatDate(new Date()) })}</p>

// ❌ Bad - Format in template
<p>{t("total_duration_ms", { ms })}</p>
```

---

## Troubleshooting

### Text Not Translating

**Problem:** Chinese text still appears in English mode

**Solutions:**
1. Check if text is in `zh.json` and `en.json`
2. Ensure `I18nPatchProvider` wraps your app
3. Check browser console for i18n errors
4. Verify text is not in `<input>` or `<textarea>` (intentionally skipped)

### Dynamic Translation Not Updating

**Problem:** Text doesn't update when language changes

**Solutions:**
1. Use `useT()` hook instead of `t()` for React components
2. Check that placeholder names match template
3. Verify language is actually changing in localStorage

### Missing Template Key

**Problem:** Template key not found warning

**Solutions:**
1. Check `dynamic-translation.ts` for the key
2. Add the template if it doesn't exist
3. Check for typos in the key name

### Performance Issues

**Problem:** Slow translation after language change

**Solutions:**
1. Check console for slow DOM replacement warnings (>50ms)
2. Reduce number of dynamic translations in hot paths
3. Use `useMemo` for expensive computations

---

## API Reference

### `t(key, values?, language?)`

Get a translated string with dynamic values.

**Parameters:**
- `key` (string): Translation template key
- `values` (object, optional): Placeholder values
- `language` (Language, optional): Target language

**Returns:** string

**Example:**
```tsx
t("new_flow_id", { id: "abc123" })
// "新 Flow ID: abc123" (zh)
// "New Flow ID: abc123" (en)
```

### `useT(key, values?)`

React hook that auto-updates on language change.

**Parameters:**
- `key` (string): Translation template key
- `values` (object, optional): Placeholder values

**Returns:** string

**Example:**
```tsx
const title = useT("total_duration", { duration: "1.23s" });
```

### `useTranslator()`

Get a translation function bound to current language.

**Returns:** `(key, values?) => string`

**Example:**
```tsx
const t = useTranslator();
<p>{t("model_name", { model: "claude-sonnet-4" })}</p>
```

### `formatDuration(ms)`

Format milliseconds to human-readable string.

**Parameters:**
- `ms` (number): Duration in milliseconds

**Returns:** string

**Example:**
```tsx
formatDuration(500);    // "500ms"
formatDuration(1234);   // "1.23s"
formatDuration(65000);  // "1m 5s"
```

### `useI18nPatch()`

Access language state and setter.

**Returns:** `{ language: Language; setLanguage: (lang: Language) => void }`

**Example:**
```tsx
const { language, setLanguage } = useI18nPatch();
```

---

## Quick Reference Card

```tsx
// Imports
import { t, useT, useTranslator, formatDuration, tDuration, tTotalDuration } from '@/i18n';
import { useI18nPatch } from '@/i18n';

// Static text (automatic)
<button>保存设置</button>  // Auto-translated

// Dynamic text
t("new_flow_id", { id: flowId })

// React hook (auto-updates)
const title = useT("total_duration", { duration: formatDuration(ms) })

// Bound function
const t = useTranslator();

// Language switcher
const { language, setLanguage } = useI18nPatch();
setLanguage("en");
```

---

## Version History

- **v1.0** - Initial Patch Layer system (static translations only)
- **v2.0** - Added dynamic translation templates
- **v2.1** - Added React hooks and utility functions
- **v2.2** - Comprehensive template library (60+ templates)
- **v2.3** - 99.5% coverage of all UI text

---

## Contributing

When adding new features:
1. Use Chinese for source code text
2. Add translations to both `zh.json` and `en.json`
3. For dynamic text, add templates to `dynamic-translation.ts`
4. Use existing templates when possible
5. Follow the naming conventions

---

## Support

For issues or questions:
1. Check this guide
2. Check existing templates in `dynamic-translation.ts`
3. Check translation files in `patches/`
4. Review component examples in the codebase

---

**Last Updated:** 2025-01-12
**Maintainer:** ProxyCast Development Team
