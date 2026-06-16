/**
 * lib/prompts.ts 单元测试
 * 测试 Prompt 模板的变量替换
 */

import {
  PROMPT_MAKE_SURVEY,
  PROMPT_GEN_ESSAY,
  PROMPT_SCORE_ESSAY,
} from "@/lib/prompts";

describe("PROMPT_MAKE_SURVEY", () => {
  it("应包含 {{title_input}} 占位符", () => {
    expect(PROMPT_MAKE_SURVEY).toContain("{{title_input}}");
  });

  it("替换标题后不应再包含占位符", () => {
    const result = PROMPT_MAKE_SURVEY.replace("{{title_input}}", "我的妈妈");
    expect(result).not.toContain("{{title_input}}");
    expect(result).toContain("我的妈妈");
  });

  it("应包含 survey_purpose 和 question_list 结构说明", () => {
    expect(PROMPT_MAKE_SURVEY).toContain("survey_purpose");
    expect(PROMPT_MAKE_SURVEY).toContain("question_list");
  });

  it("应包含每题 4 个选项的强制规则", () => {
    expect(PROMPT_MAKE_SURVEY).toContain("A/B/C/D");
  });

  it("应包含 option_praise 字段说明", () => {
    expect(PROMPT_MAKE_SURVEY).toContain("option_praise");
  });
});

describe("PROMPT_GEN_ESSAY", () => {
  it("应包含三个占位符", () => {
    expect(PROMPT_GEN_ESSAY).toContain("{{title_input}}");
    expect(PROMPT_GEN_ESSAY).toContain("{{select_data}}");
    expect(PROMPT_GEN_ESSAY).toContain("{{essay_count}}");
  });

  it("替换所有占位符后不应再包含占位符", () => {
    // 注意：模板中 {{essay_count}} 出现两次，需用 replaceAll
    const result = PROMPT_GEN_ESSAY
      .replace("{{title_input}}", "我的妈妈")
      .replace("{{select_data}}", '{"0": "三年级"}')
      .replaceAll("{{essay_count}}", "2");
    expect(result).not.toContain("{{");
    expect(result).toContain("我的妈妈");
    expect(result).toContain("三年级");
    expect(result).toContain("2");
  });

  it("应包含 --- 分隔符说明", () => {
    expect(PROMPT_GEN_ESSAY).toContain("---");
  });

  it("应包含年级与字数对应规则", () => {
    expect(PROMPT_GEN_ESSAY).toContain("三年级");
    expect(PROMPT_GEN_ESSAY).toContain("250");
  });
});

describe("PROMPT_SCORE_ESSAY", () => {
  it("应包含 {{essay_text}} 占位符", () => {
    expect(PROMPT_SCORE_ESSAY).toContain("{{essay_text}}");
  });

  it("替换后应包含作文内容", () => {
    const essay = "今天天气很好";
    const result = PROMPT_SCORE_ESSAY.replace("{{essay_text}}", essay);
    expect(result).toContain(essay);
  });

  it("应包含五个评分维度", () => {
    expect(PROMPT_SCORE_ESSAY).toContain("字数");
    expect(PROMPT_SCORE_ESSAY).toContain("素材");
    expect(PROMPT_SCORE_ESSAY).toContain("语句");
    expect(PROMPT_SCORE_ESSAY).toContain("情感");
    expect(PROMPT_SCORE_ESSAY).toContain("结构");
  });

  it("应包含满分 100 分的说明", () => {
    expect(PROMPT_SCORE_ESSAY).toContain("100");
  });
});