/**
 * TitleInput 组件测试
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TitleInput from "@/components/TitleInput";

describe("TitleInput 组件", () => {
  const mockOnGenerateSurvey = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("应渲染标题输入框和按钮", () => {
    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByPlaceholderText("示例：我的妈妈")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /生成问卷/ })).toBeInTheDocument();
  });

  it("输入少于 2 字时按钮应禁用", () => {
    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={false}
        error={null}
      />
    );

    const button = screen.getByRole("button", { name: /生成问卷/ });
    expect(button).toBeDisabled();
  });

  it("输入 2 字以上时按钮应启用", async () => {
    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={false}
        error={null}
      />
    );

    const input = screen.getByPlaceholderText("示例：我的妈妈");
    await userEvent.type(input, "我的妈妈");

    const button = screen.getByRole("button", { name: /生成问卷/ });
    expect(button).not.toBeDisabled();
  });

  it("点击按钮应调用 onGenerateSurvey", async () => {
    mockOnGenerateSurvey.mockResolvedValueOnce(undefined);

    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={false}
        error={null}
      />
    );

    const input = screen.getByPlaceholderText("示例：我的妈妈");
    await userEvent.type(input, "我的妈妈");

    const button = screen.getByRole("button", { name: /生成问卷/ });
    await userEvent.click(button);

    expect(mockOnGenerateSurvey).toHaveBeenCalledWith("我的妈妈");
  });

  it("按 Enter 键应触发生成", async () => {
    mockOnGenerateSurvey.mockResolvedValueOnce(undefined);

    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={false}
        error={null}
      />
    );

    const input = screen.getByPlaceholderText("示例：我的妈妈");
    await userEvent.type(input, "我的妈妈{enter}");

    expect(mockOnGenerateSurvey).toHaveBeenCalledWith("我的妈妈");
  });

  it("loading 时按钮应显示加载状态并禁用", () => {
    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={true}
        error={null}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText(/AI 正在分析/)).toBeInTheDocument();
  });

  it("loading 时输入框应禁用", () => {
    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={true}
        error={null}
      />
    );

    const input = screen.getByPlaceholderText("示例：我的妈妈");
    expect(input).toBeDisabled();
  });

  it("应显示错误信息", () => {
    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={false}
        error="请求异常，请重试"
      />
    );

    expect(screen.getByText("请求异常，请重试")).toBeInTheDocument();
  });

  it("应显示字数统计", async () => {
    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={false}
        error={null}
      />
    );

    const input = screen.getByPlaceholderText("示例：我的妈妈");
    await userEvent.type(input, "我的妈妈");

    expect(screen.getByText("4/50 字")).toBeInTheDocument();
  });

  it("输入超过 50 字应被截断", async () => {
    render(
      <TitleInput
        onGenerateSurvey={mockOnGenerateSurvey}
        loading={false}
        error={null}
      />
    );

    const input = screen.getByPlaceholderText("示例：我的妈妈") as HTMLInputElement;
    expect(input.maxLength).toBe(50);
  });
});