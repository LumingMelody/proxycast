/**
 * @file A2UI 组件渲染器
 * @description 渲染 A2UI JSON 为 React 组件
 * @module components/content-creator/a2ui/components
 */

import { useState, useCallback, useMemo } from "react";
import type {
  A2UIResponse,
  A2UIComponent,
  A2UIEvent,
  A2UIFormData,
  ChoicePickerComponent,
  TextFieldComponent,
  SliderComponent,
  CheckBoxComponent,
  TextComponent,
  ButtonComponent,
  RowComponent,
  ColumnComponent,
  CardComponent,
  DividerComponent,
} from "../types";
import { getComponentById, resolveDynamicValue } from "../parser";
import { cn } from "@/lib/utils";

// ============================================================
// 渲染器 Props
// ============================================================

interface A2UIRendererProps {
  response: A2UIResponse;
  onEvent?: (event: A2UIEvent) => void;
  onSubmit?: (formData: A2UIFormData) => void;
  className?: string;
}

interface ComponentRendererProps {
  component: A2UIComponent;
  components: A2UIComponent[];
  data: Record<string, unknown>;
  formData: A2UIFormData;
  onFormChange: (id: string, value: unknown) => void;
  onAction: (action: A2UIEvent) => void;
}

// ============================================================
// 主渲染器
// ============================================================

export function A2UIRenderer({
  response,
  onEvent,
  onSubmit,
  className,
}: A2UIRendererProps) {
  const [formData, setFormData] = useState<A2UIFormData>(() => {
    // 初始化表单数据
    const initial: A2UIFormData = {};
    for (const comp of response.components) {
      if ("value" in comp) {
        const value = resolveDynamicValue(
          (comp as { value?: unknown }).value,
          response.data || {},
          undefined,
        );
        if (value !== undefined) {
          initial[comp.id] = value;
        }
      }
    }
    return initial;
  });

  const handleFormChange = useCallback(
    (id: string, value: unknown) => {
      setFormData((prev) => ({ ...prev, [id]: value }));
      onEvent?.({ type: "change", componentId: id, value });
    },
    [onEvent],
  );

  const handleAction = useCallback(
    (event: A2UIEvent) => {
      if (event.action?.name === "submit") {
        onSubmit?.(formData);
        onEvent?.({ ...event, formData });
      } else {
        onEvent?.(event);
      }
    },
    [formData, onEvent, onSubmit],
  );

  const handleSubmit = useCallback(() => {
    onSubmit?.(formData);
    onEvent?.({
      type: "submit",
      componentId: "form",
      formData,
    });
  }, [formData, onEvent, onSubmit]);

  const rootComponent = useMemo(
    () => getComponentById(response.components, response.root),
    [response.components, response.root],
  );

  if (!rootComponent) {
    return (
      <div className="text-red-500">错误：找不到根组件 {response.root}</div>
    );
  }

  return (
    <div className={cn("a2ui-container", className)}>
      {/* 思考过程 */}
      {response.thinking && (
        <div className="mb-3 text-sm text-muted-foreground italic">
          {response.thinking}
        </div>
      )}

      {/* 组件树 */}
      <ComponentRenderer
        component={rootComponent}
        components={response.components}
        data={response.data || {}}
        formData={formData}
        onFormChange={handleFormChange}
        onAction={handleAction}
      />

      {/* 提交按钮 */}
      {response.submitAction && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {response.submitAction.label}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 组件渲染器
// ============================================================

function ComponentRenderer({
  component,
  components,
  data,
  formData,
  onFormChange,
  onAction,
}: ComponentRendererProps) {
  switch (component.component) {
    case "Row":
      return (
        <RowRenderer
          component={component}
          components={components}
          data={data}
          formData={formData}
          onFormChange={onFormChange}
          onAction={onAction}
        />
      );
    case "Column":
      return (
        <ColumnRenderer
          component={component}
          components={components}
          data={data}
          formData={formData}
          onFormChange={onFormChange}
          onAction={onAction}
        />
      );
    case "Card":
      return (
        <CardRenderer
          component={component}
          components={components}
          data={data}
          formData={formData}
          onFormChange={onFormChange}
          onAction={onAction}
        />
      );
    case "Divider":
      return <DividerRenderer component={component} />;
    case "Text":
      return <TextRenderer component={component} data={data} />;
    case "Button":
      return (
        <ButtonRenderer
          component={component}
          components={components}
          data={data}
          onAction={onAction}
        />
      );
    case "TextField":
      return (
        <TextFieldRenderer
          component={component}
          data={data}
          formData={formData}
          onFormChange={onFormChange}
        />
      );
    case "CheckBox":
      return (
        <CheckBoxRenderer
          component={component}
          data={data}
          formData={formData}
          onFormChange={onFormChange}
        />
      );
    case "ChoicePicker":
      return (
        <ChoicePickerRenderer
          component={component}
          data={data}
          formData={formData}
          onFormChange={onFormChange}
        />
      );
    case "Slider":
      return (
        <SliderRenderer
          component={component}
          data={data}
          formData={formData}
          onFormChange={onFormChange}
        />
      );
    default:
      return (
        <div className="text-yellow-500">
          未知组件: {(component as A2UIComponent).component}
        </div>
      );
  }
}

// ============================================================
// 布局组件
// ============================================================

function RowRenderer({
  component,
  components,
  data,
  formData,
  onFormChange,
  onAction,
}: ComponentRendererProps & { component: RowComponent }) {
  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    spaceBetween: "justify-between",
    spaceAround: "justify-around",
    spaceEvenly: "justify-evenly",
  }[component.justify || "start"];

  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[component.align || "start"];

  return (
    <div
      className={cn("flex flex-row", justifyClass, alignClass)}
      style={{ gap: component.gap || 8 }}
    >
      {component.children.map((childId) => {
        const child = getComponentById(components, childId);
        if (!child) return null;
        return (
          <ComponentRenderer
            key={childId}
            component={child}
            components={components}
            data={data}
            formData={formData}
            onFormChange={onFormChange}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
}

function ColumnRenderer({
  component,
  components,
  data,
  formData,
  onFormChange,
  onAction,
}: ComponentRendererProps & { component: ColumnComponent }) {
  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    spaceBetween: "justify-between",
    spaceAround: "justify-around",
    spaceEvenly: "justify-evenly",
  }[component.justify || "start"];

  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[component.align || "stretch"];

  return (
    <div
      className={cn("flex flex-col", justifyClass, alignClass)}
      style={{ gap: component.gap || 12 }}
    >
      {component.children.map((childId) => {
        const child = getComponentById(components, childId);
        if (!child) return null;
        return (
          <ComponentRenderer
            key={childId}
            component={child}
            components={components}
            data={data}
            formData={formData}
            onFormChange={onFormChange}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
}

function CardRenderer({
  component,
  components,
  data,
  formData,
  onFormChange,
  onAction,
}: ComponentRendererProps & { component: CardComponent }) {
  const child = getComponentById(components, component.child);
  if (!child) return null;

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <ComponentRenderer
        component={child}
        components={components}
        data={data}
        formData={formData}
        onFormChange={onFormChange}
        onAction={onAction}
      />
    </div>
  );
}

function DividerRenderer({ component }: { component: DividerComponent }) {
  const isVertical = component.axis === "vertical";
  return (
    <div
      className={cn(
        "bg-border",
        isVertical ? "w-px h-full min-h-[20px]" : "h-px w-full",
      )}
    />
  );
}

// ============================================================
// 展示组件
// ============================================================

function TextRenderer({
  component,
  data,
}: {
  component: TextComponent;
  data: Record<string, unknown>;
}) {
  const text = resolveDynamicValue(component.text, data, "");

  const variantClass = {
    h1: "text-2xl font-bold",
    h2: "text-xl font-semibold",
    h3: "text-lg font-semibold",
    h4: "text-base font-medium",
    body: "text-sm",
    caption: "text-xs text-muted-foreground",
    label: "text-sm font-medium",
  }[component.variant || "body"];

  return <div className={variantClass}>{text}</div>;
}

function ButtonRenderer({
  component,
  components,
  data,
  onAction,
}: {
  component: ButtonComponent;
  components: A2UIComponent[];
  data: Record<string, unknown>;
  onAction: (event: A2UIEvent) => void;
}) {
  const child = getComponentById(components, component.child);
  const label =
    child && child.component === "Text"
      ? resolveDynamicValue((child as TextComponent).text, data, "")
      : "";

  const handleClick = () => {
    onAction({
      type: "action",
      componentId: component.id,
      action: component.action,
    });
  };

  const variantClass = {
    filled: "bg-primary text-primary-foreground hover:bg-primary/90",
    outlined:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    text: "hover:bg-accent hover:text-accent-foreground",
  }[component.variant || "filled"];

  return (
    <button
      onClick={handleClick}
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        variantClass,
        component.primary && "font-medium",
      )}
    >
      {label}
    </button>
  );
}

// ============================================================
// 表单组件
// ============================================================

function TextFieldRenderer({
  component,
  data,
  formData,
  onFormChange,
}: {
  component: TextFieldComponent;
  data: Record<string, unknown>;
  formData: A2UIFormData;
  onFormChange: (id: string, value: unknown) => void;
}) {
  const label = resolveDynamicValue(component.label, data, "");
  const value =
    (formData[component.id] as string) ??
    resolveDynamicValue(component.value, data, "");
  const isLongText = component.variant === "longText";

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      {isLongText ? (
        <textarea
          value={value}
          onChange={(e) => onFormChange(component.id, e.target.value)}
          placeholder={component.placeholder}
          className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background resize-y"
        />
      ) : (
        <input
          type={
            component.variant === "number"
              ? "number"
              : component.variant === "obscured"
                ? "password"
                : "text"
          }
          value={value}
          onChange={(e) => onFormChange(component.id, e.target.value)}
          placeholder={component.placeholder}
          className="w-full px-3 py-2 text-sm border rounded-md bg-background"
        />
      )}
      {component.helperText && (
        <p className="text-xs text-muted-foreground">{component.helperText}</p>
      )}
    </div>
  );
}

function CheckBoxRenderer({
  component,
  data,
  formData,
  onFormChange,
}: {
  component: CheckBoxComponent;
  data: Record<string, unknown>;
  formData: A2UIFormData;
  onFormChange: (id: string, value: unknown) => void;
}) {
  const label = resolveDynamicValue(component.label, data, "");
  const checked =
    (formData[component.id] as boolean) ??
    resolveDynamicValue(component.value, data, false);

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onFormChange(component.id, e.target.checked)}
        className="w-4 h-4 rounded border-gray-300"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function ChoicePickerRenderer({
  component,
  data,
  formData,
  onFormChange,
}: {
  component: ChoicePickerComponent;
  data: Record<string, unknown>;
  formData: A2UIFormData;
  onFormChange: (id: string, value: unknown) => void;
}) {
  const label = component.label
    ? resolveDynamicValue(component.label, data, "")
    : "";
  const selectedValues =
    (formData[component.id] as string[]) ??
    resolveDynamicValue(component.value, data, []);
  const isMultiple = component.variant === "multipleSelection";
  const isWrap =
    component.layout === "wrap" || component.layout === "horizontal";

  const handleSelect = (optionValue: string) => {
    if (isMultiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onFormChange(component.id, newValues);
    } else {
      onFormChange(component.id, [optionValue]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium">{label}</div>}
      <div className={cn("flex gap-2", isWrap ? "flex-wrap" : "flex-col")}>
        {component.options.map((option) => {
          const optionLabel = resolveDynamicValue(option.label, data, "");
          const isSelected = selectedValues.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "px-3 py-2 text-sm rounded-lg border transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-accent",
              )}
            >
              <div className="flex items-center gap-2">
                {option.icon && <span>{option.icon}</span>}
                <span>{optionLabel}</span>
              </div>
              {option.description && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderRenderer({
  component,
  data,
  formData,
  onFormChange,
}: {
  component: SliderComponent;
  data: Record<string, unknown>;
  formData: A2UIFormData;
  onFormChange: (id: string, value: unknown) => void;
}) {
  const label = component.label
    ? resolveDynamicValue(component.label, data, "")
    : "";
  const value =
    (formData[component.id] as number) ??
    resolveDynamicValue(component.value, data, component.min);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <label className="text-sm font-medium">{label}</label>}
        {component.showValue !== false && (
          <span className="text-sm text-muted-foreground">{value}</span>
        )}
      </div>
      <input
        type="range"
        min={component.min}
        max={component.max}
        step={component.step || 1}
        value={value}
        onChange={(e) => onFormChange(component.id, Number(e.target.value))}
        className="w-full"
      />
      {component.marks && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {component.marks.map((mark) => (
            <span key={mark.value}>{mark.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default A2UIRenderer;
