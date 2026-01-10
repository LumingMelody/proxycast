/**
 * @file 文本输入组件
 * @description 单行文本输入框
 * @module components/content-creator/core/FormComponents/TextInput
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

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
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

interface TextInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const TextInput: React.FC<TextInputProps> = memo(
  ({
    name,
    label,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    error,
  }) => {
    return (
      <Container>
        <Label htmlFor={name}>
          {label}
          {required && <Required>*</Required>}
        </Label>
        <Input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    );
  },
);

TextInput.displayName = "TextInput";
