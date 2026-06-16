import OpenAI from "openai";

// DeepSeek 兼容 OpenAI SDK，只需设置 baseURL
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

const MODEL = process.env.AI_MODEL || "deepseek-chat";

/**
 * 调用 AI 生成文本（非流式）
 */
export async function chat(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content ?? "";
}

/**
 * 调用 AI 流式生成文本，返回 ReadableStream
 * 使用 for await...of 遍历 OpenAI stream，通过 start() 推送数据
 */
export async function chatStream(prompt: string): Promise<ReadableStream<Uint8Array>> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (err) {
        console.error("chatStream error:", err);
        controller.error(err);
      }
    },
  });
}

/**
 * 清洗 AI 输出的 JSON，去除 BOM/控制字符
 */
export function cleanAIJson(raw: string): string {
  return raw.replace(/^[\x00-\x1F\x80-\xFF]*/, "").trim();
}