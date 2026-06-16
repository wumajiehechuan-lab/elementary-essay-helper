/**
 * API 路由测试
 * @jest-environment node
 */

// Mock lib/ai 模块 - 使用相对路径 mock
const mockChat = jest.fn();
const mockChatStream = jest.fn();
const mockCleanAIJson = jest.fn((raw: string) => raw.replace(/^[\x00-\x1F\x80-\xFF]*/, "").trim());

jest.mock("../../lib/ai", () => ({
  chat: mockChat,
  chatStream: mockChatStream,
  cleanAIJson: mockCleanAIJson,
}));

function createMockRequest(body: unknown): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// --- gen-survey 测试 ---

describe("POST /api/gen-survey", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import("../../app/api/gen-survey/route");
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("标题为空时应返回 400", async () => {
    const req = createMockRequest({ title: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe(1);
  });

  it("标题少于 2 字时应返回 400", async () => {
    const req = createMockRequest({ title: "我" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("标题超过 50 字时应返回 400", async () => {
    const req = createMockRequest({ title: "我".repeat(51) });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("缺少 title 字段时应返回 400", async () => {
    const req = createMockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("AI 返回空内容时应返回 500", async () => {
    mockChat.mockResolvedValueOnce("");

    const req = createMockRequest({ title: "我的妈妈" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.code).toBe(1);
  });

  it("AI 返回无效 JSON 时应返回 500", async () => {
    mockChat.mockResolvedValueOnce("这不是有效的JSON");

    const req = createMockRequest({ title: "我的妈妈" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("AI 返回有效问卷 JSON 时应返回 200", async () => {
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

    mockChat.mockResolvedValueOnce(JSON.stringify(validSurvey));

    const req = createMockRequest({ title: "我的妈妈" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.code).toBe(0);
    expect(json.data.survey_purpose).toBe("帮助提升作文分数");
  });

  it("问卷选项数量不为 4 时应返回 500", async () => {
    const invalidSurvey = {
      survey_purpose: "测试",
      question_list: [
        {
          question_text: "测试问题",
          option_group: [
            { key: "A", content: "选项A", option_praise: "" },
            { key: "B", content: "选项B", option_praise: "" },
          ],
        },
      ],
    };

    mockChat.mockResolvedValueOnce(JSON.stringify(invalidSurvey));

    const req = createMockRequest({ title: "我的妈妈" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

// --- gen-essay 测试 ---

describe("POST /api/gen-essay", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import("../../app/api/gen-essay/route");
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("缺少 title 时应返回 400", async () => {
    const req = createMockRequest({ answers: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("缺少 answers 时应返回 400", async () => {
    const req = createMockRequest({ title: "我的妈妈" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("essayCount 超出范围时应被限制在 1-3", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("测试内容"));
        controller.close();
      },
    });
    mockChatStream.mockResolvedValueOnce(mockStream);

    const req = createMockRequest({ title: "我的妈妈", answers: { 0: "A" }, essayCount: 10 });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

// --- score-essay 测试 ---

describe("POST /api/score-essay", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import("../../app/api/score-essay/route");
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("缺少 essayText 时应返回 400", async () => {
    const req = createMockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("essayText 为空字符串时应返回 400", async () => {
    const req = createMockRequest({ essayText: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("essayText 为纯空格时应返回 400", async () => {
    const req = createMockRequest({ essayText: "   " });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("AI 返回空内容时应返回 500", async () => {
    mockChat.mockResolvedValueOnce("");

    const req = createMockRequest({ essayText: "一篇作文" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("正常批改应返回 200 和批改报告", async () => {
    mockChat.mockResolvedValueOnce("总分：92分\n扣分明细：...");

    const req = createMockRequest({ essayText: "一篇测试作文内容" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.code).toBe(0);
    expect(json.data.scoreReport).toBe("总分：92分\n扣分明细：...");
  });
});