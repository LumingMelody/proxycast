/**
 * @file 步骤表单组件
 * @description 根据配置动态渲染表单
 * @module components/content-creator/core/StepGuide/StepForm
 */

import React, { memo, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { FormConfig, FormField, FormFieldType } from "../../types";
import {
  TextInput,
  TextArea,
  Select,
  RadioGroup,
  CheckboxGroup,
  Slider,
  TagInput,
} from "../FormComponents";
import { StepActions } from "./StepActions";

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

interface StepFormProps {
  /** 表单配置 */
  config: FormConfig;
  /** 初始值 */
  initialValues?: Record<string, unknown>;
  /** 是否正在处理 */
  isProcessing?: boolean;
  /** 是否可跳过 */
  skippable?: boolean;
  /** 提交回调 */
  onSubmit: (data: Record<string, unknown>) => void;
  /** 跳过回调 */
  onSkip?: () => void;
}

/**
 * 获取字段默认值
 */
function getDefaultValue(field: FormField): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  switch (field.type) {
    case "checkbox":
    case "tags":
      return [];
    case "slider":
      return 50;
    default:
      return "";
  }
}

/**
 * 步骤表单组件
 *
 * 根据 FormConfig 动态渲染表单字段
 */
export const StepForm: React.FC<StepFormProps> = memo(
  ({
    config,
    initialValues = {},
    isProcessing,
    skippable = false,
    onSubmit,
    onSkip,
  }) => {
    // 初始化表单数据
    const [formData, setFormData] = useState<Record<string, unknown>>(() => {
      const initial: Record<string, unknown> = {};
      config.fields.forEach((field) => {
        initial[field.name] =
          initialValues[field.name] ?? getDefaultValue(field);
      });
      return initial;
    });

    // 表单错误
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 更新字段值
    const updateField = useCallback((name: string, value: unknown) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }, []);

    // 验证表单
    const validate = useCallback((): boolean => {
      const newErrors: Record<string, string> = {};
      config.fields.forEach((field) => {
        if (field.required) {
          const value = formData[field.name];
          if (value === "" || value === undefined || value === null) {
            newErrors[field.name] = "此字段为必填项";
          } else if (Array.isArray(value) && value.length === 0) {
            newErrors[field.name] = "请至少选择一项";
          }
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [config.fields, formData]);

    // 提交表单
    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
          onSubmit(formData);
        }
      },
      [validate, onSubmit, formData],
    );

    // 渲染字段
    const renderField = useCallback(
      (field: FormField) => {
        const value = formData[field.name];
        const error = errors[field.name];
        const commonProps = {
          name: field.name,
          label: field.label,
          required: field.required,
          error,
          disabled: isProcessing,
        };

        switch (field.type as FormFieldType) {
          case "text":
            return (
              <TextInput
                key={field.name}
                {...commonProps}
                value={value as string}
                onChange={(v) => updateField(field.name, v)}
                placeholder={field.placeholder}
              />
            );
          case "textarea":
            return (
              <TextArea
                key={field.name}
                {...commonProps}
                value={value as string}
                onChange={(v) => updateField(field.name, v)}
                placeholder={field.placeholder}
              />
            );
          case "select":
            return (
              <Select
                key={field.name}
                {...commonProps}
                value={value as string}
                onChange={(v) => updateField(field.name, v)}
                options={field.options || []}
                placeholder={field.placeholder || "请选择"}
              />
            );
          case "radio":
            return (
              <RadioGroup
                key={field.name}
                {...commonProps}
                value={value as string}
                onChange={(v) => updateField(field.name, v)}
                options={field.options || []}
              />
            );
          case "checkbox":
            return (
              <CheckboxGroup
                key={field.name}
                {...commonProps}
                value={value as string[]}
                onChange={(v) => updateField(field.name, v)}
                options={field.options || []}
              />
            );
          case "slider":
            return (
              <Slider
                key={field.name}
                {...commonProps}
                value={value as number}
                onChange={(v) => updateField(field.name, v)}
              />
            );
          case "tags":
            return (
              <TagInput
                key={field.name}
                {...commonProps}
                value={value as string[]}
                onChange={(v) => updateField(field.name, v)}
                placeholder={field.placeholder}
              />
            );
          default:
            return null;
        }
      },
      [formData, errors, isProcessing, updateField],
    );

    // 步骤行为配置
    const behavior = useMemo(
      () => ({
        skippable,
        redoable: false,
        autoAdvance: false,
      }),
      [skippable],
    );

    return (
      <FormContainer onSubmit={handleSubmit}>
        {config.fields.map(renderField)}
        <StepActions
          behavior={behavior}
          isProcessing={isProcessing}
          onConfirm={() => {
            if (validate()) {
              onSubmit(formData);
            }
          }}
          onSkip={onSkip}
          confirmLabel={config.submitLabel}
          skipLabel={config.skipLabel}
        />
      </FormContainer>
    );
  },
);

StepForm.displayName = "StepForm";
