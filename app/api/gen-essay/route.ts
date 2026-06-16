import { NextRequest } from "next/server";
import { chatStream } from "@/lib/ai";
import { PROMPT_GEN_ESSAY } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { title, answers, essayCount } = await request.json();

    if (!title || !answers) {
      return new Response(JSON.stringify({ code: 1, msg: "缺少必要参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const count = Math.min(Math.max(parseInt(String(essayCount)) || 1, 1), 3);
    const prompt = PROMPT_GEN_ESSAY
      .replace("{{title_input}}", title)
      .replace("{{select_data}}", JSON.stringify(answers, null, 2))
      .replace("{{essay_count}}", String(count));

    const stream = await chatStream(prompt);

    // 返回 SSE 流
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("gen-essay error:", err);
    return new Response(JSON.stringify({ code: 1, msg: "服务器错误" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}