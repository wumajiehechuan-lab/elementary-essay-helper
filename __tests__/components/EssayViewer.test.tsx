/**
 * EssayViewer 组件测试
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EssayViewer from "@/components/EssayViewer";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe("EssayViewer 组件", () => {
  const mockOnScore = jest.fn();
  const mockOnRegenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("应显示空状态提示", () => {
    render(
      <EssayViewer
        essayContent=""
        essayCount={2}
        isStreaming={false}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    expect(screen.getByText("暂无内容")).toBeInTheDocument();
  });

  it("流式输出中应显示加载提示", () => {
    render(
      <EssayViewer
        essayContent=""
        essayCount={2}
        isStreaming={true}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    expect(screen.getByText(/AI 正在构思/)).toBeInTheDocument();
  });

  it("应显示范文内容", () => {
    render(
      <EssayViewer
        essayContent="今天天气很好，我和妈妈一起去公园玩。"
        essayCount={1}
        isStreaming={false}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    expect(screen.getByText(/今天天气很好/)).toBeInTheDocument();
  });

  it("多篇范文应显示 Tab 切换", () => {
    const content = "第一篇范文内容\n---\n第二篇范文内容";
    render(
      <EssayViewer
        essayContent={content}
        essayCount={2}
        isStreaming={false}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    expect(screen.getByText("范文1")).toBeInTheDocument();
    expect(screen.getByText("范文2")).toBeInTheDocument();
  });

  it("切换 Tab 应显示对应范文", async () => {
    const content = "第一篇范文内容\n---\n第二篇范文内容";
    render(
      <EssayViewer
        essayContent={content}
        essayCount={2}
        isStreaming={false}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    expect(screen.getByText("第一篇范文内容")).toBeInTheDocument();

    await userEvent.click(screen.getByText("范文2"));
    expect(screen.getByText("第二篇范文内容")).toBeInTheDocument();
  });

  it("点击批改按钮应调用 onScore", async () => {
    mockOnScore.mockResolvedValueOnce(undefined);

    render(
      <EssayViewer
        essayContent="一篇测试作文"
        essayCount={1}
        isStreaming={false}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    const scoreButton = screen.getByRole("button", { name: /AI 自动批改打分/ });
    await userEvent.click(scoreButton);

    expect(mockOnScore).toHaveBeenCalledWith(0);
  });

  it("点击重新生成应调用 onRegenerate", async () => {
    render(
      <EssayViewer
        essayContent="一篇测试作文"
        essayCount={1}
        isStreaming={false}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    const regenButton = screen.getByText("← 重新生成");
    await userEvent.click(regenButton);

    expect(mockOnRegenerate).toHaveBeenCalled();
  });

  it("流式输出时重新生成按钮应禁用", () => {
    render(
      <EssayViewer
        essayContent="正在生成..."
        essayCount={1}
        isStreaming={true}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    const regenButton = screen.getByText("← 重新生成");
    expect(regenButton).toBeDisabled();
  });

  it("批改中时按钮应显示加载状态", () => {
    render(
      <EssayViewer
        essayContent="一篇测试作文"
        essayCount={1}
        isStreaming={false}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={true}
      />
    );

    expect(screen.getByText(/AI 正在批改/)).toBeInTheDocument();
  });

  it("无内容时复制按钮应禁用", () => {
    render(
      <EssayViewer
        essayContent=""
        essayCount={1}
        isStreaming={false}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    const copyButton = screen.getByRole("button", { name: /复制当前范文/ });
    expect(copyButton).toBeDisabled();
  });

  it("点击复制应调用 clipboard API", async () => {
    render(
      <EssayViewer
        essayContent="一篇测试作文"
        essayCount={1}
        isStreaming={false}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    const copyButton = screen.getByRole("button", { name: /复制当前范文/ });
    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("一篇测试作文");
  });

  it("流式输出时批改按钮应禁用", () => {
    render(
      <EssayViewer
        essayContent="正在生成..."
        essayCount={1}
        isStreaming={true}
        onScore={mockOnScore}
        onRegenerate={mockOnRegenerate}
        scoring={false}
      />
    );

    const scoreButton = screen.getByRole("button", { name: /AI 自动批改打分/ });
    expect(scoreButton).toBeDisabled();
  });
});