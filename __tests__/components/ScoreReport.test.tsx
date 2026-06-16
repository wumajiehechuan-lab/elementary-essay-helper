/**
 * ScoreReport 组件测试
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScoreReport from "@/components/ScoreReport";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe("ScoreReport 组件", () => {
  const mockOnScoreAnother = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("应显示批改报告内容", () => {
    const report = "总分：92分\n扣分明细：字数-2，语句-3，结构-3\n修改建议：第一段可以加一个比喻";

    render(
      <ScoreReport
        scoreReport={report}
        onScoreAnother={mockOnScoreAnother}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/总分：92分/)).toBeInTheDocument();
    expect(screen.getByText(/扣分明细/)).toBeInTheDocument();
  });

  it("应显示标题", () => {
    render(
      <ScoreReport
        scoreReport="测试报告"
        onScoreAnother={mockOnScoreAnother}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("📊 阅卷批改 & 修改建议")).toBeInTheDocument();
  });

  it("点击复制应调用 clipboard API", async () => {
    const report = "测试批改报告内容";

    render(
      <ScoreReport
        scoreReport={report}
        onScoreAnother={mockOnScoreAnother}
        onBack={mockOnBack}
      />
    );

    const copyButton = screen.getByRole("button", { name: /复制批改报告/ });
    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(report);
  });

  it("复制后应显示已复制状态", async () => {
    render(
      <ScoreReport
        scoreReport="测试报告"
        onScoreAnother={mockOnScoreAnother}
        onBack={mockOnBack}
      />
    );

    const copyButton = screen.getByRole("button", { name: /复制批改报告/ });
    await userEvent.click(copyButton);

    expect(screen.getByText("✅ 已复制")).toBeInTheDocument();
  });

  it("点击换一篇批改应调用 onScoreAnother", async () => {
    render(
      <ScoreReport
        scoreReport="测试报告"
        onScoreAnother={mockOnScoreAnother}
        onBack={mockOnBack}
      />
    );

    const anotherButton = screen.getByRole("button", { name: /换一篇批改/ });
    await userEvent.click(anotherButton);

    expect(mockOnScoreAnother).toHaveBeenCalled();
  });

  it("点击返回范文应调用 onBack", async () => {
    render(
      <ScoreReport
        scoreReport="测试报告"
        onScoreAnother={mockOnScoreAnother}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByText("← 返回范文");
    await userEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it("空报告也应正常渲染", () => {
    render(
      <ScoreReport
        scoreReport=""
        onScoreAnother={mockOnScoreAnother}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("📊 阅卷批改 & 修改建议")).toBeInTheDocument();
  });
});