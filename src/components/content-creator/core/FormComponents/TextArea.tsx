/**
 * @file 多行文本输入组件
 * @description 多行文本输入框
 * @module components/content-creator/core/FormComponents/TextArea
 */

import React, { memo } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
`;

const Required = styled.span`
  color: hsl(var(--destructive));
  margin-left: 2px;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  resize: vertical;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.1);
  }

  &::placeholder {
    color: hsl(var(--muted-foreground));
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: hsl(var(--destructive));
`;

interface TextAreaProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = memo(
  ({
    name,
    label,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    error,
    rows = 4,
  }) => {
    return (
      <Container>
        <Label htmlFor={name}>
          {label}
          {required && <Required>*</Required>}
        </Label>
        <StyledTextArea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    );
  },
);

TextArea.displayName = "TextArea";
