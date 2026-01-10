/**
 * @file 下拉选择组件
 * @description 单选下拉框
 * @module components/content-creator/core/FormComponents/Select
 */

import React, { memo } from "react";
import styled from "styled-components";
import { ChevronDown } from "lucide-react";

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

const SelectWrapper = styled.div`
  position: relative;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  appearance: none;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: hsl(var(--muted-foreground));
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: hsl(var(--destructive));
`;

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const Select: React.FC<SelectProps> = memo(
  ({
    name,
    label,
    value,
    onChange,
    options,
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
        <SelectWrapper>
          <StyledSelect
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </StyledSelect>
          <IconWrapper>
            <ChevronDown size={16} />
          </IconWrapper>
        </SelectWrapper>
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    );
  },
);

Select.displayName = "Select";
