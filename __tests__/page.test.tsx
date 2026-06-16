/**
 * page.tsx 状态机集成测试
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

// Mock fetch 全局
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe("Home 页面状态机", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it("初始状态应显示 Step 1 标题输入", () => {
    render(<Home />);

    expect(screen.getByPlaceholderText("示例：我的妈妈")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /生成问卷/ })).toBeInTheDocument();
  });

  it("Step 1 不应显示步骤指示器", () => {
    render(<Home />);

    expect(screen.queryByText("标题")).not.toBeInTheDocument();
  });

  it("生成问卷成功后应跳转到 Step 2", async () => {
    const validSurvey = {
      survey_purpose: "帮助提升作文分数",
      question_list: [
        {
          question_text: "你的年级是？",
          option_group: [
            { key: "A", content: "三年级", option_praise: "选择三年级很适合" },
            { key: "B", content: "四年级", option_praise: "四年级开始进阶了" },
            { key: "C", content: "五年级", option_praise: "五年级更上一层楼" },
            { key: "D", content: "六年级", option_praise: "六年级冲刺满分" },
          ],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ code: 0, msg: "success", data: validSurvey }),
    });

    render(<Home />);

    const input = screen.getByPlaceholderText("示例：我的妈妈");
    await userEvent.type(input, "我的妈妈");

    const button = screen.getByRole("button", { name: /生成问卷/ });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("📋 写作调研问卷")).toBeInTheDocument();
      // 题目文本渲染为 "1. 你的年级是？"
      expect(screen.getByText(/你的年级是/)).toBeInTheDocument();
    });

    expect(screen.getByText("问卷")).toBeInTheDocument();
  });

  it("生成问卷失败应显示错误", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ code: 1, msg: "AI生成失败，请重试" }),
    });

    render(<Home />);

    const input = screen.getByPlaceholderText("示例：我的妈妈");
    await userEvent.type(input, "我的妈妈");

    const button = screen.getByRole("button", { name: /生成问卷/ });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("AI生成失败，请重试")).toBeInTheDocument();
    });
  });

  it("fetch 异常时应显示错误", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<Home />);

    const input = screen.getByPlaceholderText("示例：我的妈妈");
    await userEvent.type(input, "我的妈妈");

    const button = screen.getByRole("button", { name: /生成问卷/ });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("请求异常，请重试")).toBeInTheDocument();
    });
  });

  it("从 localStorage 恢复状态", () => {
    const savedState = {
      step: "survey",
      title: "我的妈妈",
      surveyData: {
        survey_purpose: "帮助提升作文分数",
        question_list: [
          {
            question_text: "你的年级是？",
            option_group: [
              { key: "A", content: "三年级", option_praise: "选择三年级很适合" },
              { key: "B", content: "四年级", option_praise: "四年级开始进阶了" },
              { key: "C", content: "五年级", option_praise: "五年级更上一层楼" },
              { key: "D", content: "六年级", option_praise: "六年级冲刺满分" },
            ],
          },
        ],
      },
      surveyAnswers: {},
      essayContent: "",
      essayCount: 2,
      scoreReport: "",
      activeEssayIndex: 0,
    };

    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedState));

    render(<Home />);

    expect(screen.getByText("📋 写作调研问卷")).toBeInTheDocument();
  });

  it("重置全部应清除状态回到 Step 1", async () => {
    const savedState = {
      step: "survey",
      title: "我的妈妈",
      surveyData: {
        survey_purpose: "帮助提升作文分数",
        question_list: [
          {
            question_text: "你的年级是？",
            option_group: [
              { key: "A", content: "三年级", option_praise: "" },
              { key: "B", content: "四年级", option_praise: "" },
              { key: "C", content: "五年级", option_praise: "" },
              { key: "D", content: "六年级", option_praise: "" },
            ],
          },
        ],
      },
      surveyAnswers: {},
      essayContent: "",
      essayCount: 2,
      scoreReport: "",
      activeEssayIndex: 0,
    };

    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedState));

    render(<Home />);

    expect(screen.getByText("📋 写作调研问卷")).toBeInTheDocument();

    const resetButton = screen.getByText("重置全部");
    await userEvent.click(resetButton);

    expect(screen.getByPlaceholderText("示例：我的妈妈")).toBeInTheDocument();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("wj_state");
  });

  it("应显示步骤指示器", async () => {
    const validSurvey = {
      survey_purpose: "帮助提升作文分数",
      question_list: [
        {
          question_text: "你的年级是？",
          option_group: [
            { key: "A", content: "三年级", option_praise: "" },
            { key: "B", content: "四年级", option_praise: "" },
            { key: "C", content: "五年级", option_praise: "" },
            { key: "D", content: "六年级", option_praise: "" },
          ],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ code: 0, msg: "success", data: validSurvey }),
    });

    render(<Home />);

    const input = screen.getByPlaceholderText("示例：我的妈妈");
    await userEvent.type(input, "我的妈妈");

    await userEvent.click(screen.getByRole("button", { name: /生成问卷/ }));

    await waitFor(() => {
      expect(screen.getByText("标题")).toBeInTheDocument();
      expect(screen.getByText("问卷")).toBeInTheDocument();
      expect(screen.getByText("范文")).toBeInTheDocument();
      expect(screen.getByText("批改")).toBeInTheDocument();
    });
  });
});