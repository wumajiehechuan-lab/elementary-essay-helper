// 问卷选项
export interface OptionItem {
  key: "A" | "B" | "C" | "D";
  content: string;
  option_praise: string;
}

// 问卷题目
export interface QuestionItem {
  question_text: string;
  option_group: OptionItem[];
}

// AI 返回的问卷 JSON
export interface SurveyData {
  survey_purpose: string;
  question_list: QuestionItem[];
}

// 用户对问卷的勾选 { 题号: 选项内容 }
export type SurveyAnswers = Record<number, string>;

// 应用步骤
export type Step = "input" | "survey" | "essay" | "score";

// 全局应用状态
export interface AppState {
  step: Step;
  title: string;
  surveyData: SurveyData | null;
  surveyAnswers: SurveyAnswers;
  essayContent: string;           // 多篇用 --- 分隔
  essayCount: number;             // 1/2/3
  scoreReport: string;
  activeEssayIndex: number;       // 当前查看第几篇范文 (0-based)
}

// API 响应
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data?: T;
}