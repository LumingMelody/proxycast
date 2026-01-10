/**
 * @file 版本选择器组件
 * @description 显示版本列表，支持版本切换
 * @module components/content-creator/canvas/document/VersionSelector
 */

import React, { memo, useState, useRef, useEffect } from "react";
import styled from "styled-components";
import type { VersionSelectorProps } from "./types";
import { useVersions } from "./hooks/useVersions";

const Container = styled.div`
  position: relative;
`;

const TriggerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: hsl(var(--muted) / 0.5);
  }
`;

const VersionLabel = styled.span`
  font-weight: 500;
`;

const ChevronIcon = styled.span<{ $open: boolean }>`
  transition: transform 0.2s;
  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0)")};
`;

const Dropdown = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 220px;
  max-height: 300px;
  overflow-y: auto;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(-8px)"};
  transition: all 0.2s;
`;

const VersionItem = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: ${({ $active }) =>
    $active ? "hsl(var(--muted) / 0.5)" : "transparent"};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: hsl(var(--muted) / 0.3);
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const VersionTitle = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
`;

const VersionTime = styled.span`
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-top: 2px;
`;

/**
 * 版本选择器组件
 */
export const VersionSelector: React.FC<VersionSelectorProps> = memo(
  ({ currentVersion, versions, onVersionChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { formatVersionTime } = useVersions("");

    // 点击外部关闭
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleVersionSelect = (versionId: string) => {
      onVersionChange(versionId);
      setIsOpen(false);
    };

    // 获取版本显示名称
    const getVersionName = (index: number, description?: string) => {
      if (description) return description;
      return `版本 ${index + 1}`;
    };

    const currentIndex = versions.findIndex((v) => v.id === currentVersion?.id);

    return (
      <Container ref={containerRef}>
        <TriggerButton onClick={() => setIsOpen(!isOpen)}>
          <VersionLabel>
            {currentVersion
              ? getVersionName(currentIndex, currentVersion.description)
              : "无版本"}
          </VersionLabel>
          <ChevronIcon $open={isOpen}>▼</ChevronIcon>
        </TriggerButton>

        <Dropdown $visible={isOpen}>
          {versions.map((version, index) => (
            <VersionItem
              key={version.id}
              $active={version.id === currentVersion?.id}
              onClick={() => handleVersionSelect(version.id)}
            >
              <VersionTitle>
                {getVersionName(index, version.description)}
              </VersionTitle>
              <VersionTime>{formatVersionTime(version.createdAt)}</VersionTime>
            </VersionItem>
          ))}
        </Dropdown>
      </Container>
    );
  },
);

VersionSelector.displayName = "VersionSelector";
