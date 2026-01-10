/**
 * @file useWorkflow Hook
 * @description 工作流步骤状态管理 Hook
 * @module components/content-creator/hooks/useWorkflow
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ThemeType,
  CreationMode,
  WorkflowStep,
  StepDefinition,
  StepResult,
  StepStatus,
} from "../types";

/**
 * 获取主题对应的工作流步骤
 */
function getWorkflowSteps(
  theme: ThemeType,
  mode: CreationMode,
): StepDefinition[] {
  // 通用对话不需要工作流
  if (theme === "general") {
    return [];
  }

  // 基础步骤定义
  const baseSteps: StepDefinition[] = [
    {
      id: "clarify",
      type: "clarify",
      title: "明确需求",
      description: "确认创作主题、目标读者和风格",
      form: {
        fields: [
          { name: "topic", label: "内容主题", type: "text", required: true },
          {
            name: "audience",
            label: "目标读者",
            type: "select",
            required: false,
            options: [
              { label: "普通大众", value: "general" },
              { label: "专业人士", value: "professional" },
              { label: "学生群体", value: "student" },
              { label: "技术开发者", value: "developer" },
            ],
          },
          {
            name: "style",
            label: "内容风格",
            type: "radio",
            required: false,
            options: [
              { label: "专业严谨", value: "professional" },
              { label: "轻松活泼", value: "casual" },
              { label: "深度分析", value: "analytical" },
              { label: "故事叙述", value: "narrative" },
            ],
          },
        ],
        submitLabel: "确认并继续",
        skipLabel: "跳过",
      },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "research",
      type: "research",
      title: "调研收集",
      description: "AI 搜索相关资料，你可以补充真实经历",
      aiTask: { taskType: "research", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "outline",
      type: "outline",
      title: "生成大纲",
      description: "AI 生成内容大纲，你可以调整顺序",
      aiTask: { taskType: "outline", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "write",
      type: "write",
      title: "撰写内容",
      description: "根据模式不同，AI 和你协作完成内容",
      aiTask: { taskType: "write", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "polish",
      type: "polish",
      title: "润色优化",
      description: "AI 检查并建议优化",
      aiTask: { taskType: "polish", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "adapt",
      type: "adapt",
      title: "适配发布",
      description: "选择目标平台，AI 自动适配格式",
      form: {
        fields: [
          {
            name: "platform",
            label: "目标平台",
            type: "checkbox",
            required: true,
            options: [
              { label: "微信公众号", value: "wechat" },
              { label: "小红书", value: "xiaohongshu" },
              { label: "知乎", value: "zhihu" },
              { label: "通用 Markdown", value: "markdown" },
            ],
          },
        ],
        submitLabel: "生成适配版本",
      },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];

  // 根据模式调整步骤
  if (mode === "fast") {
    // 快速模式：跳过调研和润色
    return baseSteps.map((step) => ({
      ...step,
      behavior: {
        ...step.behavior,
        skippable:
          step.type === "research" || step.type === "polish"
            ? true
            : step.behavior.skippable,
      },
    }));
  }

  return baseSteps;
}

/**
 * 工作流状态管理 Hook
 */
export function useWorkflow(theme: ThemeType, mode: CreationMode) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // 根据主题和模式初始化步骤
  useEffect(() => {
    const definitions = getWorkflowSteps(theme, mode);
    const initialSteps: WorkflowStep[] = definitions.map((def, index) => ({
      ...def,
      status: index === 0 ? "active" : "pending",
    }));
    setSteps(initialSteps);
    setCurrentStepIndex(0);
  }, [theme, mode]);

  /**
   * 当前步骤
   */
  const currentStep = useMemo(
    () => steps[currentStepIndex] || null,
    [steps, currentStepIndex],
  );

  /**
   * 进度百分比
   */
  const progress = useMemo(() => {
    if (steps.length === 0) return 0;
    const completedCount = steps.filter(
      (s) => s.status === "completed" || s.status === "skipped",
    ).length;
    return Math.round((completedCount / steps.length) * 100);
  }, [steps]);

  /**
   * 跳转到指定步骤
   */
  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        // 只能跳转到已完成或当前步骤
        const targetStep = steps[index];
        if (
          targetStep.status === "completed" ||
          targetStep.status === "skipped" ||
          index === currentStepIndex
        ) {
          setCurrentStepIndex(index);
          setSteps((prev) =>
            prev.map((step, i) =>
              i === index ? { ...step, status: "active" as StepStatus } : step,
            ),
          );
        }
      }
    },
    [steps, currentStepIndex],
  );

  /**
   * 完成当前步骤
   */
  const completeStep = useCallback(
    (result: StepResult) => {
      setSteps((prev) =>
        prev.map((step, i) =>
          i === currentStepIndex
            ? { ...step, status: "completed" as StepStatus, result }
            : step,
        ),
      );

      // 自动进入下一步
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStepIndex(nextIndex);
        setSteps((prev) =>
          prev.map((step, i) =>
            i === nextIndex
              ? { ...step, status: "active" as StepStatus }
              : step,
          ),
        );
      }
    },
    [currentStepIndex, steps.length],
  );

  /**
   * 跳过当前步骤
   */
  const skipStep = useCallback(() => {
    const step = steps[currentStepIndex];
    if (!step?.behavior.skippable) return;

    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStepIndex ? { ...s, status: "skipped" as StepStatus } : s,
      ),
    );

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStepIndex(nextIndex);
      setSteps((prev) =>
        prev.map((step, i) =>
          i === nextIndex ? { ...step, status: "active" as StepStatus } : step,
        ),
      );
    }
  }, [currentStepIndex, steps]);

  /**
   * 重做指定步骤
   */
  const redoStep = useCallback(
    (index: number) => {
      const step = steps[index];
      if (!step?.behavior.redoable) return;

      // 重置该步骤及之后的所有步骤
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i === index) {
            return { ...s, status: "active" as StepStatus, result: undefined };
          }
          if (i > index) {
            return { ...s, status: "pending" as StepStatus, result: undefined };
          }
          return s;
        }),
      );
      setCurrentStepIndex(index);
    },
    [steps],
  );

  /**
   * 提交步骤表单
   */
  const submitStepForm = useCallback(
    (data: Record<string, unknown>) => {
      completeStep({ userInput: data });
    },
    [completeStep],
  );

  return {
    steps,
    currentStep,
    currentStepIndex,
    progress,
    canGoBack: currentStepIndex > 0,
    canGoForward: currentStepIndex < steps.length - 1,
    goToStep,
    completeStep,
    skipStep,
    redoStep,
    submitStepForm,
  };
}
