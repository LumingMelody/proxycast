/**
 * @file 单选组组件
 * @description 单选按钮组
 * @module components/content-creator/core/FormComponents/RadioGroup
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

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const OptionWrapper = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "hsl(var(--primary))" : "hsl(var(--border))"};
  border-radius: 8px;
  background: ${({ $selected }) =>
    $selected ? "hsl(var(--primary) / 0.05)" : "transparent"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: hsl(var(--primary));
  }
`;

const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: hsl(var(--primary));
  cursor: pointer;
`;

const OptionLabel = styled.span`
  font-size: 14px;
  color: hsl(var(--foreground));
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: hsl(var(--destructive));
`;

interface OptionItem {
  label: string;
  value: string;
}

interface RadioGroupProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = memo(
  ({ name, label, value, onChange, options, required, disabled, error }) => {
    return (
      <Container>
        <Label>
          {label}
          {required && <Required>*</Required>}
        </Label>
        <OptionsContainer>
          {options.map((opt) => (
            <OptionWrapper key={opt.value} $selected={value === opt.value}>
              <RadioInput
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
              />
              <OptionLabel>{opt.label}</OptionLabel>
            </OptionWrapper>
          ))}
        </OptionsContainer>
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    );
  },
);

RadioGroup.displayName = "RadioGroup";
