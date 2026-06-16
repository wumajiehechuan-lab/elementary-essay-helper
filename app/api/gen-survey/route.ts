import { NextRequest, NextResponse } from "next/server";
import { chat, cleanAIJson } from "@/lib/ai";
import { PROMPT_MAKE_SURVEY } from "@/lib/prompts";
import { SurveyData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length < 2 || title.trim().length > 50) {
      return NextResponse.json({ code: 1, msg: "请输入2-50字的作文标题" }, { status: 400 });
    }

    const prompt = PROMPT_MAKE_SURVEY.replace("{{title_input}}", title.trim());
    const rawText = await chat(prompt);

    if (!rawText) {
      return NextResponse.json({ code: 1, msg: "AI生成失败，请重试" }, { status: 500 });
    }

    const cleanJson = cleanAIJson(rawText);
    let surveyData: SurveyData;

    try {
      surveyData = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({ code: 1, msg: "问卷格式异常，请重试" }, { status: 500 });
    }

    // 校验问卷结构
    if (!surveyData.question_list || !Array.isArray(surveyData.question_list)) {
      return NextResponse.json({ code: 1, msg: "问卷格式异常，请重试" }, { status: 500 });
    }

    for (const q of surveyData.question_list) {
      if (!q.option_group || q.option_group.length !== 4) {
        return NextResponse.json({ code: 1, msg: "问卷选项格式错误，请重试" }, { status: 500 });
      }
    }

    return NextResponse.json({
      code: 0,
      msg: "success",
      data: surveyData,
    });
  } catch (err) {
    console.error("gen-survey error:", err);
    return NextResponse.json({ code: 1, msg: "服务器错误，请重试" }, { status: 500 });
  }
}