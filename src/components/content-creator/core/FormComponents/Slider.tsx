/**
 * @file 滑块组件
 * @description 数值滑块选择器
 * @module components/content-creator/core/FormComponents/Slider
 */

import React, { memo } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const ValueDisplay = styled.span`
  font-size: 13px;
  color: hsl(var(--primary));
  font-weight: 500;
`;

const SliderWrapper = styled.div`
  padding: 8px 0;
`;

const StyledSlider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: hsl(var(--muted));
  appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: hsl(var(--primary));
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 50%;
    background: hsl(var(--primary));
    cursor: pointer;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: hsl(var(--destructive));
`;

interface SliderProps {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider: React.FC<SliderProps> = memo(
  ({
    name,
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    required,
    disabled,
    error,
    showValue = true,
    formatValue = (v: number) => String(v),
  }) => {
    return (
      <Container>
        <LabelRow>
          <Label htmlFor={name}>
            {label}
            {required && <Required>*</Required>}
          </Label>
          {showValue && <ValueDisplay>{formatValue(value)}</ValueDisplay>}
        </LabelRow>
        <SliderWrapper>
          <StyledSlider
            id={name}
            name={name}
            type="range"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
          />
        </SliderWrapper>
        <RangeLabels>
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </RangeLabels>
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    );
  },
);

Slider.displayName = "Slider";
