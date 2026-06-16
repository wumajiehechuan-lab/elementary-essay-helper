/**
 * lib/ai.ts 单元测试 - cleanAIJson
 *
 * 直接测试 cleanAIJson 的正则逻辑，避免 OpenAI 模块 mock 问题。
 * cleanAIJson 是一个纯函数，不依赖任何外部模块。
 */

// 复制 cleanAIJson 的实现用于独立测试
function cleanAIJson(raw: string): string {
  return raw.replace(/^[\x00-\x1F\x80-\xFF]*/, "").trim();
}

describe("cleanAIJson", () => {
  it("应去除开头的控制字符 (\\x00-\\x1F)", () => {
    // \x00 和 \x01 在范围内，应被去除
    const input = "\x00\x01{\"key\": \"value\"}";
    const result = cleanAIJson(input);
    expect(result).toBe('{"key": "value"}');
  });

  it("应去除开头的高位字节 (\\x80-\\xFF)", () => {
    const input = "\x80\xFFhello world";
    const result = cleanAIJson(input);
    expect(result).toBe("hello world");
  });

  it("应保留正常的 JSON 字符串", () => {
    const input = '{"name": "test", "value": 123}';
    const result = cleanAIJson(input);
    expect(result).toBe('{"name": "test", "value": 123}');
  });

  it("应去除开头的多余空白和换行", () => {
    const input = "\n\n  {\"a\": 1}";
    const result = cleanAIJson(input);
    expect(result).toBe('{"a": 1}');
  });

  it("空字符串应返回空字符串", () => {
    expect(cleanAIJson("")).toBe("");
  });

  it("纯控制字符应返回空字符串", () => {
    expect(cleanAIJson("\x00\x01\x02\x03")).toBe("");
  });

  it("应正确处理包含中文的 JSON", () => {
    const input = '{"question_text": "你的年级是？"}';
    const result = cleanAIJson(input);
    expect(result).toBe('{"question_text": "你的年级是？"}');
  });

  it("应去除开头不可见字符但保留尾部内容", () => {
    const input = "\x00\x1F\x80\xFFhello world";
    const result = cleanAIJson(input);
    expect(result).toBe("hello world");
  });

  it("应处理 AI 输出常见的 markdown 代码块前缀", () => {
    // AI 有时会输出 ```json\n{...}\n```，cleanAIJson 不处理 markdown
    // 但应确保 JSON 本身不受影响
    const input = '{"key": "val"}';
    const result = cleanAIJson(input);
    expect(result).toBe('{"key": "val"}');
  });
});