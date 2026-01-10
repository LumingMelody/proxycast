/**
 * @file 代码块组件
 * @description 支持语法高亮和一键复制的代码块
 * @module components/chat/components/CodeBlock
 */

import React, { useState, useCallback, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import styled from "styled-components";
import { Copy, Check } from "lucide-react";

const CodeBlockContainer = styled.div`
  position: relative;
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  background-color: #282c34;
`;

const CodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #21252b;
  color: #abb2bf;
  font-size: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LanguageLabel = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-transform: lowercase;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #abb2bf;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.copied {
    color: #98c379;
  }
`;

interface CodeBlockProps {
  /** 编程语言 */
  language: string;
  /** 代码内容 */
  code: string;
}

/**
 * 代码块组件
 *
 * 支持语法高亮和一键复制功能
 * 支持 12+ 种常见编程语言
 */
export const CodeBlock: React.FC<CodeBlockProps> = memo(
  ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("复制失败:", err);
      }
    }, [code]);

    // 规范化语言名称
    const normalizedLanguage = language?.toLowerCase() || "text";

    return (
      <CodeBlockContainer>
        <CodeHeader>
          <LanguageLabel>{normalizedLanguage}</LanguageLabel>
          <CopyButton onClick={handleCopy} className={copied ? "copied" : ""}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "已复制" : "复制"}
          </CopyButton>
        </CodeHeader>
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "16px",
            background: "transparent",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
          showLineNumbers={code.split("\n").length > 5}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "#636d83",
            userSelect: "none",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </CodeBlockContainer>
    );
  },
);

CodeBlock.displayName = "CodeBlock";
