/**
 * @file 主题选择器组件
 * @description 底部主题选择入口
 * @module components/chat/components/ThemeSelector
 */

import React, { useState, memo } from "react";
import styled from "styled-components";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ThemeType, THEME_CONFIGS } from "../types";

const Container = styled.div`
  padding: 12px 16px;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--background));
`;

const Wrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: hsl(var(--border));
  }
`;

const ThemeGrid = styled.div<{ $expanded: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-height: ${({ $expanded }) => ($expanded ? "200px" : "44px")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ThemeButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid
    ${({ $active }) => ($active ? "hsl(var(--primary))" : "hsl(var(--border))")};
  border-radius: 8px;
  background: ${({ $active }) =>
    $active ? "hsl(var(--primary) / 0.1)" : "hsl(var(--card))"};
  color: ${({ $active }) =>
    $active ? "hsl(var(--primary))" : "hsl(var(--foreground))"};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.05);
  }
`;

const ThemeIcon = styled.span`
  font-size: 16px;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  border: none;
  background: transparent;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: hsl(var(--foreground));
  }
`;

interface ThemeSelectorProps {
  /** 当前选中的主题 */
  currentTheme: ThemeType;
  /** 主题变更回调 */
  onThemeChange: (theme: ThemeType) => void;
}

/**
 * 主题选择器组件
 *
 * 显示在输入栏下方，提供创作主题选择入口
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = memo(
  ({ currentTheme, onThemeChange }) => {
    const [expanded, setExpanded] = useState(false);

    // 过滤掉通用对话，只显示创作主题
    const creativeThemes = THEME_CONFIGS.filter((t) => t.id !== "general");

    // 默认显示前 6 个
    const visibleThemes = expanded
      ? creativeThemes
      : creativeThemes.slice(0, 6);

    return (
      <Container>
        <Wrapper>
          <Divider>或选择创作主题</Divider>

          <ThemeGrid $expanded={expanded}>
            {visibleThemes.map((theme) => (
              <ThemeButton
                key={theme.id}
                $active={currentTheme === theme.id}
                onClick={() => onThemeChange(theme.id)}
                title={theme.description}
              >
                <ThemeIcon>{theme.icon}</ThemeIcon>
                {theme.name}
              </ThemeButton>
            ))}
          </ThemeGrid>

          {creativeThemes.length > 6 && (
            <ExpandButton onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <>
                  收起 <ChevronUp size={14} />
                </>
              ) : (
                <>
                  更多主题 <ChevronDown size={14} />
                </>
              )}
            </ExpandButton>
          )}
        </Wrapper>
      </Container>
    );
  },
);

ThemeSelector.displayName = "ThemeSelector";
