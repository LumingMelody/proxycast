/**
 * Dynamic Translation Utility
 *
 * Provides template-based translation for dynamic text with variables.
 * Extends the Patch Layer i18n system to support interpolated text.
 *
 * Usage:
 *   t("new_flow_id", { id: "abc123" }) // "New Flow ID: abc123" / "新 Flow ID: abc123"
 *   t("total_duration", { duration: "1.23s" }) // "Total duration: 1.23s" / "总耗时: 1.23s"
 */

import { getTextMap, Language } from "./text-map";

/**
 * Get the current language from localStorage or default to 'zh'
 */
function getCurrentLanguage(): Language {
  if (typeof window === "undefined") return "zh";
  return (localStorage.getItem("language") as Language) || "zh";
}

/**
 * Translation templates with placeholder support
 * Format: "prefix {{placeholder}} suffix" or "prefix {placeholder} suffix"
 */
const TEMPLATES: Record<string, { zh: string; en: string }> = {
  // Flow Monitor
  "new_flow_id": {
    zh: "新 Flow ID: {id}",
    en: "New Flow ID: {id}",
  },
  "total_duration": {
    zh: "总耗时: {duration}",
    en: "Total duration: {duration}",
  },
  "duration": {
    zh: "耗时: {duration}",
    en: "Duration: {duration}",
  },
  "model_name": {
    zh: "模型: {model}",
    en: "Model: {model}",
  },
  "replay_status": {
    zh: "重放会创建新的 Flow 并标记为 {status}",
    en: "Replay will create new Flow and mark as {status}",
  },
  "flow_count": {
    zh: "将重放 {count} 个 Flow",
    en: "Will replay {count} Flow(s)",
  },

  // Provider/Clients
  "config_mismatch": {
    zh: "实际生效的配置与当前选中的 \"{provider}\" 不一致",
    en: "Actual effective configuration differs from currently selected \"{provider}\"",
  },
  "actual_value": {
    zh: "实际: {value}",
    en: "Actual: {value}",
  },
  "current_value": {
    zh: "当前: {value}",
    en: "Current: {value}",
  },

  // General patterns
  "items_count": {
    zh: "共 {count} 个{item}",
    en: "Total {count} {item}(s)",
  },
  "loading_with_item": {
    zh: "正在加载{item}...",
    en: "Loading {item}...",
  },
  "error_with_message": {
    zh: "{action}失败: {error}",
    en: "{action} failed: {error}",
  },
  "success_with_message": {
    zh: "{action}成功: {message}",
    en: "{action} successful: {message}",
  },

  // Flow Monitor specific
  "flow_detail_title": {
    zh: "Flow #{id}",
    en: "Flow #{id}",
  },
  "request_duration": {
    zh: "请求耗时: {duration}",
    en: "Request duration: {duration}",
  },
  "response_duration": {
    zh: "响应耗时: {duration}",
    en: "Response duration: {duration}",
  },

  // Provider Pool
  "provider_model_count": {
    zh: "{provider} 有 {count} 个模型",
    en: "{provider} has {count} model(s)",
  },
  "credential_type": {
    zh: "{type} 凭证",
    en: "{type} credential",
  },

  // Settings
  "setting_updated": {
    zh: "{setting} 已更新",
    en: "{setting} updated",
  },
  "setting_failed": {
    zh: "更新 {setting} 失败: {error}",
    en: "Failed to update {setting}: {error}",
  },

  // Additional templates from scan results
  "confirm_delete_config": {
    zh: "确定要删除配置 \"{name}\" 吗？此操作无法撤销。",
    en: "Are you sure you want to delete configuration \"{name}\"? This action cannot be undone.",
  },
  "start_creating": {
    zh: "开始{theme}创作...",
    en: "Start creating {theme}...",
  },
  "fetch_models_failed": {
    zh: "获取 {provider} 模型列表失败: {error}",
    en: "Failed to fetch {provider} model list: {error}",
  },
  "credential_label": {
    zh: "{type} 凭证: {provider} - {id}",
    en: "{type} credential: {provider} - {id}",
  },
  "filter_state": {
    zh: "状态: {state}",
    en: "Status: {state}",
  },
  "filter_operator": {
    zh: "比较运算符: {op}",
    en: "Comparison operators: {op}",
  },
  "selected_flow_count": {
    zh: "已选择 {count} 个 Flow",
    en: "Selected {count} Flow(s)",
  },
  "display_model_count": {
    zh: "显示 {displayed} / {total} 个模型",
    en: "Showing {displayed} of {total} model(s)",
  },
  "usage_count": {
    zh: "使用 {count} 次",
    en: "Used {count} time(s)",
  },
  "retain_hours": {
    zh: "保留最近 {hours} 小时的数据",
    en: "Retain data from the last {hours} hour(s)",
  },
  "retain_days": {
    zh: "保留最近 {days} 天的数据",
    en: "Retain data from the last {days} day(s)",
  },
  "retain_records": {
    zh: "只保留最近 {count} 条记录",
    en: "Only keep the most recent {count} record(s)",
  },
  "storage_limit": {
    zh: "存储大小限制：{size} GB",
    en: "Storage size limit: {size} GB",
  },
  "start_failed": {
    zh: "启动失败: {error}",
    en: "Start failed: {error}",
  },
  "stop_failed": {
    zh: "停止失败: {error}",
    en: "Stop failed: {error}",
  },
  "switched_to": {
    zh: "已切换到 {provider}",
    en: "Switched to {provider}",
  },
  "switch_failed": {
    zh: "切换失败: {error}",
    en: "Switch failed: {error}",
  },
  "request_failed": {
    zh: "请求失败: {error}",
    en: "Request failed: {error}",
  },
  "message_list_title": {
    zh: "消息列表 ({count})",
    en: "Message list ({count})",
  },
  "tool_definitions_title": {
    zh: "工具定义 ({count})",
    en: "Tool definitions ({count})",
  },
  "tool_calls_title": {
    zh: "工具调用 ({count})",
    en: "Tool calls ({count})",
  },
  "total_records": {
    zh: "共 {total} 条记录",
    en: "Total {total} record(s)",
  },
  "credential_pool_label": {
    zh: "凭证池: {provider}",
    en: "Credential pool: {provider}",
  },
  "installed_count": {
    zh: "已安装 ({count})",
    en: "Installed ({count})",
  },
  "env_vars_title": {
    zh: ".env 环境变量 ({provider})",
    en: ".env environment variables ({provider})",
  },
  "collapse_themes": {
    zh: "收起",
    en: "Collapse",
  },
  "more_themes": {
    zh: "更多主题",
    en: "More themes",
  },
  "batch_operation_failed": {
    zh: "批量{operation}失败",
    en: "Batch {operation} failed",
  },
  "selected_total": {
    zh: "已选择 {selected} / {total}",
    en: "Selected {selected} of {total}",
  },
  "confirm_delete_flows": {
    zh: "确定要删除选中的 {count} 个 Flow 吗？",
    en: "Are you sure you want to delete the selected {count} Flow(s)?",
  },
  "theme_creation_helper": {
    zh: "你是一位专业的内容创作教练，当前帮助用户进行「{theme}」创作。",
    en: "You are a professional content creation coach, currently helping users create \"{theme}\".",
  },
  "model_not_supported": {
    zh: "模型 {model} 不在 {provider} 支持列表中，自动切换到 {fallback}",
    en: "Model {model} is not in {provider} support list, automatically switching to {fallback}",
  },
  "send_failed": {
    zh: "发送失败: {error}",
    en: "Send failed: {error}",
  },
  "response_error": {
    zh: "响应错误: {error}",
    en: "Response error: {error}",
  },
  "file_write_triggered": {
    zh: "触发文件写入: {path}",
    en: "Triggered file write: {path}",
  },
  "tool_call_exists": {
    zh: "工具调用已存在，跳过: {id}",
    en: "Tool call already exists, skipping: {id}",
  },
};

/**
 * Replace placeholders in a template string with values
 * Supports both {{placeholder}} and {placeholder} formats
 */
function replacePlaceholders(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() ?? match;
  });
}

/**
 * Get a translated string with dynamic values
 *
 * @param key - Translation template key
 * @param values - Object containing placeholder values
 * @param language - Target language (optional, defaults to current)
 * @returns Translated string with values interpolated
 *
 * @example
 *   t("new_flow_id", { id: "abc123" })
 *   // Returns: "新 Flow ID: abc123" (zh) or "New Flow ID: abc123" (en)
 *
 *   t("total_duration", { duration: "1.23s" })
 *   // Returns: "总耗时: 1.23s" (zh) or "Total duration: 1.23s" (en)
 */
export function t(
  key: string,
  values?: Record<string, string | number>,
  language?: Language
): string {
  const lang = language || getCurrentLanguage();
  const template = TEMPLATES[key];

  if (!template) {
    console.warn(`[i18n] Dynamic translation key not found: "${key}"`);
    // Fallback: try to find in static translations
    const staticPatches = getTextMap(lang);
    const staticTranslation = staticPatches[key];
    if (staticTranslation && values) {
      return replacePlaceholders(staticTranslation, values);
    }
    return key;
  }

  const translated = template[lang];
  if (!values) {
    return translated;
  }

  return replacePlaceholders(translated, values);
}

/**
 * Check if a dynamic translation key exists
 */
export function hasDynamicTranslation(key: string): boolean {
  return key in TEMPLATES;
}

/**
 * Get all available dynamic translation keys
 */
export function getDynamicTranslationKeys(): string[] {
  return Object.keys(TEMPLATES);
}

/**
 * Format a duration in milliseconds to human-readable string
 * Used with duration-related translations
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return seconds !== "0" ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

/**
 * Shorthand for duration translation
 */
export function tDuration(ms: number, language?: Language): string {
  return t("duration", { duration: formatDuration(ms) }, language);
}

/**
 * Shorthand for total duration translation
 */
export function tTotalDuration(ms: number, language?: Language): string {
  return t("total_duration", { duration: formatDuration(ms) }, language);
}

// React Hook for dynamic translations
import { useContext, useEffect, useState } from "react";
import { useI18nPatch } from "./I18nPatchProvider";

/**
 * React hook that returns a translated string and auto-updates on language change
 *
 * @param key - Translation template key
 * @param values - Object containing placeholder values
 * @returns Translated string
 *
 * @example
 *   const message = useT("new_flow_id", { id: flowId });
 */
export function useT(
  key: string,
  values?: Record<string, string | number>
): string {
  const { language } = useI18nPatch();
  const [translated, setTranslated] = useState(() => t(key, values, language));

  useEffect(() => {
    setTranslated(t(key, values, language));
  }, [key, language, values]);

  return translated;
}

/**
 * React hook that returns a translation function bound to current language
 *
 * @example
 *   const t = useTranslator();
 *   <span>{t("total_duration", { duration: "1.23s" })}</span>
 */
export function useTranslator(): (
  key: string,
  values?: Record<string, string | number>
) => string {
  const { language } = useI18nPatch();
  return (key: string, values?: Record<string, string | number>) =>
    t(key, values, language);
}
