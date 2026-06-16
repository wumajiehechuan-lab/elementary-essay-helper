import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai";
import { PROMPT_SCORE_ESSAY } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { essayText } = await request.json();

    if (!essayText || typeof essayText !== "string" || essayText.trim().length === 0) {
      return NextResponse.json({ code: 1, msg: "没有找到作文内容" }, { status: 400 });
    }

    const prompt = PROMPT_SCORE_ESSAY.replace("{{essay_text}}", essayText);
    const result = await chat(prompt);

    if (!result) {
      return NextResponse.json({ code: 1, msg: "批改失败，请重试" }, { status: 500 });
    }

    return NextResponse.json({
      code: 0,
      msg: "success",
      data: { scoreReport: result },
    });
  } catch (err) {
    console.error("score-essay error:", err);
    return NextResponse.json({ code: 1, msg: "服务器错误，请重试" }, { status: 500 });
  }
}