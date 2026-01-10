/**
 * @file 多选组组件
 * @description 复选框组
 * @module components/content-creator/core/FormComponents/CheckboxGroup
 */

import React, { memo } from "react";
import styled from "styled-components";
import { Check } from "lucide-react";

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

const CheckboxBox = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border: 2px solid
    ${({ $checked }) =>
      $checked ? "hsl(var(--primary))" : "hsl(var(--border))"};
  border-radius: 4px;
  background: ${({ $checked }) =>
    $checked ? "hsl(var(--primary))" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: hsl(var(--primary-foreground));
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
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

interface CheckboxGroupProps {
  name: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: OptionItem[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = memo(
  ({ name, label, value, onChange, options, required, disabled, error }) => {
    const handleToggle = (optValue: string) => {
      if (disabled) return;
      const newValue = value.includes(optValue)
        ? value.filter((v) => v !== optValue)
        : [...value, optValue];
      onChange(newValue);
    };

    return (
      <Container>
        <Label>
          {label}
          {required && <Required>*</Required>}
        </Label>
        <OptionsContainer>
          {options.map((opt) => {
            const isChecked = value.includes(opt.value);
            return (
              <OptionWrapper
                key={opt.value}
                $selected={isChecked}
                onClick={() => handleToggle(opt.value)}
              >
                <HiddenInput
                  type="checkbox"
                  name={name}
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => handleToggle(opt.value)}
                  disabled={disabled}
                />
                <CheckboxBox $checked={isChecked}>
                  {isChecked && <Check size={12} />}
                </CheckboxBox>
                <OptionLabel>{opt.label}</OptionLabel>
              </OptionWrapper>
            );
          })}
        </OptionsContainer>
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    );
  },
);

CheckboxGroup.displayName = "CheckboxGroup";
