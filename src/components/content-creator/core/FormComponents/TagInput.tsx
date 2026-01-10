/**
 * @file 标签输入组件
 * @description 支持添加/删除标签的输入框
 * @module components/content-creator/core/FormComponents/TagInput
 */

import React, { memo, useState, useCallback, KeyboardEvent } from "react";
import styled from "styled-components";
import { X, Plus } from "lucide-react";

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

const InputWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  min-height: 44px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: hsl(var(--primary));
  }
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  border-radius: 6px;
  font-size: 13px;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: hsl(var(--primary));
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const Input = styled.input`
  flex: 1;
  min-width: 120px;
  padding: 4px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: hsl(var(--foreground));
  outline: none;

  &::placeholder {
    color: hsl(var(--muted-foreground));
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  background: hsl(var(--muted));
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  transition: all 0.2s;

  &:hover {
    background: hsl(var(--primary) / 0.1);
    color: hsl(var(--primary));
  }
`;

const HelpText = styled.span`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: hsl(var(--destructive));
`;

interface TagInputProps {
  name: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = memo(
  ({
    name,
    label,
    value,
    onChange,
    placeholder = "输入后按回车添加",
    required,
    disabled,
    error,
    maxTags = 10,
  }) => {
    const [inputValue, setInputValue] = useState("");

    const addTag = useCallback(() => {
      const trimmed = inputValue.trim();
      if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
        onChange([...value, trimmed]);
        setInputValue("");
      }
    }, [inputValue, value, onChange, maxTags]);

    const removeTag = useCallback(
      (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
      },
      [value, onChange],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addTag();
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
          removeTag(value[value.length - 1]);
        }
      },
      [addTag, inputValue, value, removeTag],
    );

    return (
      <Container>
        <Label htmlFor={name}>
          {label}
          {required && <Required>*</Required>}
        </Label>
        <InputWrapper>
          {value.map((tag) => (
            <Tag key={tag}>
              {tag}
              <RemoveButton onClick={() => removeTag(tag)} disabled={disabled}>
                <X size={12} />
              </RemoveButton>
            </Tag>
          ))}
          <Input
            id={name}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled || value.length >= maxTags}
          />
          {inputValue && (
            <AddButton onClick={addTag} disabled={disabled}>
              <Plus size={14} />
            </AddButton>
          )}
        </InputWrapper>
        <HelpText>
          {value.length}/{maxTags} 个标签
        </HelpText>
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    );
  },
);

TagInput.displayName = "TagInput";
