/**
 * SurveyForm 组件测试
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SurveyForm from "@/components/SurveyForm";
import { SurveyData } from "@/types";

const mockSurveyData: SurveyData = {
  survey_purpose: "帮助提升作文分数",
  question_list: [
    {
      question_text: "你的年级是？",
      option_group: [
        { key: "A", content: "三年级", option_praise: "选择三年级很适合打基础" },
        { key: "B", content: "四年级", option_praise: "四年级开始进阶了" },
        { key: "C", content: "五年级", option_praise: "五年级更上一层楼" },
        { key: "D", content: "六年级", option_praise: "六年级冲刺满分" },
      ],
    },
    {
      question_text: "你想写什么类型的事？",
      option_group: [
        { key: "A", content: "亲情故事", option_praise: "亲情最能打动人" },
        { key: "B", content: "校园趣事", option_praise: "校园故事生动有趣" },
        { key: "C", content: "成长经历", option_praise: "成长故事有深度" },
        { key: "D", content: "自然观察", option_praise: "观察力很棒" },
      ],
    },
  ],
};

describe("SurveyForm 组件", () => {
  const mockOnGenerateEssay = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("应渲染所有题目和选项", () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error={null}
      />
    );

    // 题目文本渲染为 "1. 你的年级是？"，使用正则匹配
    expect(screen.getByText(/你的年级是/)).toBeInTheDocument();
    expect(screen.getByText(/你想写什么类型的事/)).toBeInTheDocument();
    expect(screen.getByText("三年级")).toBeInTheDocument();
    expect(screen.getByText("四年级")).toBeInTheDocument();
  });

  it("应显示答题进度", () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("0 / 2")).toBeInTheDocument();
  });

  it("未全部答完时生成按钮应禁用", () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error={null}
      />
    );

    const button = screen.getByRole("button", { name: /确认选择/ });
    expect(button).toBeDisabled();
  });

  it("点击选项后应显示夸奖文字", async () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error={null}
      />
    );

    const option = screen.getByText("三年级");
    await userEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText(/选择三年级很适合打基础/)).toBeInTheDocument();
    });
  });

  it("全部答完后按钮应启用", async () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error={null}
      />
    );

    await userEvent.click(screen.getByText("三年级"));
    await userEvent.click(screen.getByText("亲情故事"));

    const button = screen.getByRole("button", { name: /确认选择/ });
    expect(button).not.toBeDisabled();
  });

  it("全部答完后点击生成应调用 onGenerateEssay", async () => {
    mockOnGenerateEssay.mockResolvedValueOnce(undefined);

    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error={null}
      />
    );

    await userEvent.click(screen.getByText("三年级"));
    await userEvent.click(screen.getByText("亲情故事"));

    const button = screen.getByRole("button", { name: /确认选择/ });
    await userEvent.click(button);

    expect(mockOnGenerateEssay).toHaveBeenCalled();
    const [answers, count] = mockOnGenerateEssay.mock.calls[0];
    expect(answers).toEqual({ 0: "三年级", 1: "亲情故事" });
    expect(count).toBe(2);
  });

  it("点击返回按钮应调用 onBack", async () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error={null}
      />
    );

    const backButton = screen.getByText("← 返回修改标题");
    await userEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it("应显示错误信息", () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error="生成失败，请重试"
      />
    );

    expect(screen.getByText("生成失败，请重试")).toBeInTheDocument();
  });

  it("loading 时按钮应显示加载状态", () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByText(/AI 正在生成范文/)).toBeInTheDocument();
  });

  it("可选择生成篇数", async () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error={null}
      />
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("2");

    await userEvent.selectOptions(select, "3");
    expect(select.value).toBe("3");
  });

  it("已选中的选项应有高亮样式", async () => {
    render(
      <SurveyForm
        surveyData={mockSurveyData}
        onGenerateEssay={mockOnGenerateEssay}
        onBack={mockOnBack}
        loading={false}
        error={null}
      />
    );

    const option = screen.getByText("三年级").closest("button")!;
    await userEvent.click(option);

    expect(option.className).toContain("border-blue-400");
  });
});