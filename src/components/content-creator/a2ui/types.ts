/**
 * @file A2UI 类型定义
 * @description Agent-to-User Interface 组件类型，参考 Google A2UI 规范
 * @module components/content-creator/a2ui/types
 */

// ============================================================
// 基础类型
// ============================================================

/** 动态值 - 可以是字面量或数据绑定路径 */
export type DynamicValue<T> = T | { path: string };

/** 动态字符串 */
export type DynamicString = DynamicValue<string>;

/** 动态布尔值 */
export type DynamicBoolean = DynamicValue<boolean>;

/** 动态数字 */
export type DynamicNumber = DynamicValue<number>;

/** 动态字符串数组 */
export type DynamicStringList = DynamicValue<string[]>;

// ============================================================
// 组件基础
// ============================================================

/** 组件通用属性 */
export interface ComponentCommon {
  /** 组件唯一 ID */
  id: string;
  /** 是否可见 */
  visible?: DynamicBoolean;
  /** 是否禁用 */
  disabled?: DynamicBoolean;
}

/** 可检查组件（表单组件） */
export interface Checkable {
  /** 验证规则 */
  validation?: ValidationRule[];
}

/** 验证规则 */
export interface ValidationRule {
  /** 规则类型 */
  type: "required" | "regex" | "length" | "numeric" | "email";
  /** 错误消息 */
  message?: string;
  /** 规则参数 */
  params?: Record<string, unknown>;
}

// ============================================================
// 布局组件
// ============================================================

/** 行布局 */
export interface RowComponent extends ComponentCommon {
  component: "Row";
  children: string[];
  justify?:
    | "start"
    | "center"
    | "end"
    | "spaceBetween"
    | "spaceAround"
    | "spaceEvenly";
  align?: "start" | "center" | "end" | "stretch";
  gap?: number;
}

/** 列布局 */
export interface ColumnComponent extends ComponentCommon {
  component: "Column";
  children: string[];
  justify?:
    | "start"
    | "center"
    | "end"
    | "spaceBetween"
    | "spaceAround"
    | "spaceEvenly";
  align?: "start" | "center" | "end" | "stretch";
  gap?: number;
}

/** 卡片 */
export interface CardComponent extends ComponentCommon {
  component: "Card";
  child: string;
  variant?: "elevated" | "outlined" | "filled";
}

/** 分隔线 */
export interface DividerComponent extends ComponentCommon {
  component: "Divider";
  axis?: "horizontal" | "vertical";
}

// ============================================================
// 展示组件
// ============================================================

/** 文本 */
export interface TextComponent extends ComponentCommon {
  component: "Text";
  text: DynamicString;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption" | "label";
}

/** 图标 */
export interface IconComponent extends ComponentCommon {
  component: "Icon";
  name: string;
  size?: "small" | "medium" | "large";
}

/** 图片 */
export interface ImageComponent extends ComponentCommon {
  component: "Image";
  url: DynamicString;
  alt?: string;
  fit?: "contain" | "cover" | "fill" | "none";
  variant?: "icon" | "avatar" | "thumbnail" | "feature";
}

// ============================================================
// 交互组件
// ============================================================

/** 按钮动作 */
export interface ButtonAction {
  name: string;
  context?: Record<string, DynamicValue<unknown>>;
}

/** 按钮 */
export interface ButtonComponent extends ComponentCommon {
  component: "Button";
  child: string;
  action: ButtonAction;
  primary?: boolean;
  variant?: "filled" | "outlined" | "text";
}

/** 文本输入框 */
export interface TextFieldComponent extends ComponentCommon, Checkable {
  component: "TextField";
  label: DynamicString;
  value?: DynamicString;
  placeholder?: string;
  variant?: "shortText" | "longText" | "number" | "obscured";
  helperText?: string;
}

/** 复选框 */
export interface CheckBoxComponent extends ComponentCommon, Checkable {
  component: "CheckBox";
  label: DynamicString;
  value: DynamicBoolean;
}

/** 选项 */
export interface ChoiceOption {
  label: DynamicString;
  value: string;
  description?: string;
  icon?: string;
}

/** 选择器 */
export interface ChoicePickerComponent extends ComponentCommon, Checkable {
  component: "ChoicePicker";
  label?: DynamicString;
  options: ChoiceOption[];
  value: DynamicStringList;
  variant?: "mutuallyExclusive" | "multipleSelection";
  layout?: "vertical" | "horizontal" | "wrap";
}

/** 滑块 */
export interface SliderComponent extends ComponentCommon, Checkable {
  component: "Slider";
  label?: DynamicString;
  min: number;
  max: number;
  step?: number;
  value: DynamicNumber;
  showValue?: boolean;
  marks?: { value: number; label: string }[];
}

/** 日期时间输入 */
export interface DateTimeInputComponent extends ComponentCommon, Checkable {
  component: "DateTimeInput";
  label?: DynamicString;
  value: DynamicString;
  enableDate?: boolean;
  enableTime?: boolean;
}

// ============================================================
// 组件联合类型
// ============================================================

/** 所有组件类型 */
export type A2UIComponent =
  | RowComponent
  | ColumnComponent
  | CardComponent
  | DividerComponent
  | TextComponent
  | IconComponent
  | ImageComponent
  | ButtonComponent
  | TextFieldComponent
  | CheckBoxComponent
  | ChoicePickerComponent
  | SliderComponent
  | DateTimeInputComponent;

/** 组件类型名称 */
export type A2UIComponentType = A2UIComponent["component"];

// ============================================================
// A2UI 响应格式
// ============================================================

/** A2UI 响应 */
export interface A2UIResponse {
  /** 响应 ID */
  id: string;
  /** 组件列表（扁平结构，通过 ID 引用） */
  components: A2UIComponent[];
  /** 数据模型 */
  data?: Record<string, unknown>;
  /** 根组件 ID */
  root: string;
  /** 思考过程（可选，用于显示 AI 的推理） */
  thinking?: string;
  /** 提交动作配置 */
  submitAction?: {
    label: string;
    action: ButtonAction;
  };
}

/** A2UI 表单数据 */
export interface A2UIFormData {
  [key: string]: unknown;
}

/** A2UI 事件 */
export interface A2UIEvent {
  type: "action" | "change" | "submit";
  componentId: string;
  action?: ButtonAction;
  value?: unknown;
  formData?: A2UIFormData;
}

// ============================================================
// 解析结果
// ============================================================

/** 消息内容类型 */
export type MessageContentType =
  | "text"
  | "a2ui"
  | "document"
  | "write_file"
  | "pending_a2ui"
  | "pending_write_file";

/** 解析后的消息内容 */
export interface ParsedMessageContent {
  type: MessageContentType;
  content: string | A2UIResponse;
  /** 文件路径（仅 write_file 和 pending_write_file 类型） */
  filePath?: string;
}

/** 解析结果 */
export interface ParseResult {
  parts: ParsedMessageContent[];
  hasA2UI: boolean;
  hasWriteFile?: boolean;
  hasPending?: boolean;
}
