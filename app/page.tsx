"use client";

import { useState, useEffect, useCallback } from "react";
import { AppState, Step, SurveyData, SurveyAnswers } from "@/types";
import TitleInput from "@/components/TitleInput";
import SurveyForm from "@/components/SurveyForm";
import EssayViewer from "@/components/EssayViewer";
import ScoreReport from "@/components/ScoreReport";

const STORAGE_KEY = "wj_state";

const INITIAL_STATE: AppState = {
  step: "input",
  title: "",
  surveyData: null,
  surveyAnswers: {},
  essayContent: "",
  essayCount: 2,
  scoreReport: "",
  activeEssayIndex: 0,
};

/** 将多篇范文按 "---" 分隔 */
function splitEssays(content: string): string[] {
  return content.split(/\n?---\n?/).filter((p) => p.trim().length > 0);
}

export default function Home() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoring, setScoring] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // 从 localStorage 恢复状态
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        if (parsed.step && parsed.title) {
          setState(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 状态变化时持久化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  // 重置全部
  const handleReset = useCallback(() => {
    setState(INITIAL_STATE);
    setError(null);
    setLoading(false);
    setScoring(false);
    setIsStreaming(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Step 1: 生成问卷
  const handleGenerateSurvey = useCallback(async (title: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gen-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const json = await res.json();
      if (json.code !== 0) {
        setError(json.msg);
        return;
      }
      setState((prev) => ({
        ...prev,
        step: "survey",
        title,
        surveyData: json.data as SurveyData,
        surveyAnswers: {},
        essayContent: "",
        scoreReport: "",
      }));
    } catch {
      setError("请求异常，请重试");
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 2: 生成范文（流式 SSE）
  const handleGenerateEssay = useCallback(async (answers: SurveyAnswers, essayCount: number) => {
    setLoading(true);
    setError(null);
    setIsStreaming(true);
    setState((prev) => ({
      ...prev,
      surveyAnswers: answers,
      essayCount,
      essayContent: "",
      scoreReport: "",
      activeEssayIndex: 0,
    }));

    try {
      const res = await fetch("/api/gen-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: state.title,
          answers,
          essayCount,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.msg || "生成失败");
        setIsStreaming(false);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("无法读取流数据");
        setIsStreaming(false);
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        setState((prev) => ({
          ...prev,
          step: "essay",
          essayContent: prev.essayContent + buffer,
        }));
        buffer = "";
      }

      if (buffer) {
        setState((prev) => ({
          ...prev,
          essayContent: prev.essayContent + buffer,
        }));
      }
    } catch {
      setError("请求异常，请重试");
    } finally {
      setIsStreaming(false);
      setLoading(false);
    }
  }, [state.title]);

  // Step 3: 批改打分
  const handleScore = useCallback(async (essayIndex: number) => {
    setScoring(true);
    setError(null);

    const essays = splitEssays(state.essayContent);
    const targetEssay = essays[essayIndex] || state.essayContent;

    try {
      const res = await fetch("/api/score-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essayText: targetEssay }),
      });
      const json = await res.json();
      if (json.code !== 0) {
        setError(json.msg);
        return;
      }
      setState((prev) => ({
        ...prev,
        step: "score",
        activeEssayIndex: essayIndex,
        scoreReport: json.data.scoreReport,
      }));
    } catch {
      setError("批改请求异常，请重试");
    } finally {
      setScoring(false);
    }
  }, [state.essayContent]);

  // 返回范文
  const handleBackToEssay = useCallback(() => {
    setState((prev) => ({ ...prev, step: "essay" }));
    setError(null);
  }, []);

  // 重新生成（回到问卷）
  const handleRegenerate = useCallback(() => {
    setState((prev) => ({ ...prev, step: "survey", essayContent: "", scoreReport: "" }));
    setError(null);
  }, []);

  // 换一篇批改
  const handleScoreAnother = useCallback(() => {
    setState((prev) => ({ ...prev, step: "essay" }));
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <span className="text-lg font-bold text-gray-800">小学生满分作文助手</span>
          </div>
          {state.step !== "input" && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-red-500 transition"
            >
              重置全部
            </button>
          )}
        </div>

        {/* 步骤指示器 */}
        {state.step !== "input" && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            {(["input", "survey", "essay", "score"] as Step[]).map((s, i) => {
              const stepLabels = ["标题", "问卷", "范文", "批改"];
              const isActive = state.step === s;
              const isDone = (["input", "survey", "essay", "score"] as Step[]).indexOf(state.step) > i;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                      ${isActive ? "bg-blue-500 text-white" : isDone ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span className={`${isActive ? "text-blue-600 font-medium" : isDone ? "text-green-600" : "text-gray-400"}`}>
                    {stepLabels[i]}
                  </span>
                  {i < 3 && <span className="text-gray-300 mx-1">→</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* 步骤内容 */}
        {state.step === "input" && (
          <TitleInput
            onGenerateSurvey={handleGenerateSurvey}
            loading={loading}
            error={error}
          />
        )}

        {state.step === "survey" && state.surveyData && (
          <SurveyForm
            surveyData={state.surveyData}
            onGenerateEssay={handleGenerateEssay}
            onBack={() => setState((prev) => ({ ...prev, step: "input" }))}
            loading={loading}
            error={error}
          />
        )}

        {state.step === "essay" && (
          <EssayViewer
            essayContent={state.essayContent}
            essayCount={state.essayCount}
            isStreaming={isStreaming}
            onScore={handleScore}
            onRegenerate={handleRegenerate}
            scoring={scoring}
          />
        )}

        {state.step === "score" && (
          <ScoreReport
            scoreReport={state.scoreReport}
            onScoreAnother={handleScoreAnother}
            onBack={handleBackToEssay}
          />
        )}
      </div>
    </div>
  );
}