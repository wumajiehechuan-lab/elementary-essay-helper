"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface EssayViewerProps {
  essayContent: string;          // 流式累积内容
  essayCount: number;            // 总篇数
  isStreaming: boolean;          // 是否正在流式输出
  onScore: (essayIndex: number) => Promise<void>;
  onRegenerate: () => void;
  scoring: boolean;
}

/** 将多篇范文按 "---" 分隔 */
function splitEssays(content: string): string[] {
  const parts = content.split(/\n?---\n?/);
  return parts.filter((p) => p.trim().length > 0);
}

export default function EssayViewer({
  essayContent,
  essayCount,
  isStreaming,
  onScore,
  onRegenerate,
  scoring,
}: EssayViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const essays = splitEssays(essayContent);
  const essaysLen = essays.length;

  // 流式输出时自动滚动到底部
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [essayContent, isStreaming]);

  // 流式结束后自动切到第一篇
  useEffect(() => {
    if (!isStreaming && essaysLen > 0) {
      setActiveIndex(0);
    }
  }, [isStreaming, essaysLen]);

  const handleCopy = useCallback(async () => {
    const text = essays[activeIndex] || essayContent;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [essays, activeIndex, essayContent]);

  const handleScore = async () => {
    await onScore(activeIndex);
  };

  const currentEssay = essays[activeIndex] || "";

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">🌟 满分作文范文</h2>
        <button
          onClick={onRegenerate}
          disabled={isStreaming || scoring}
          className="text-sm text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
        >
          ← 重新生成
        </button>
      </div>

      {/* Tab 切换 */}
      {essaysLen > 1 && (
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {Array.from({ length: Math.min(essaysLen, essayCount) }, (_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition
                ${activeIndex === i
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              范文{i + 1}
            </button>
          ))}
          {/* 流式生成中，显示占位 Tab */}
          {isStreaming && essaysLen < essayCount && (
            <button
              disabled
              className="flex-1 py-2 px-3 rounded-md text-sm text-gray-400 cursor-not-allowed"
            >
              <span className="inline-block animate-pulse">生成中...</span>
            </button>
          )}
        </div>
      )}

      {/* 范文内容 */}
      <div
        ref={containerRef}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-h-[500px] overflow-y-auto"
      >
        {currentEssay ? (
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px]">
            {currentEssay}
            {isStreaming && activeIndex === essaysLen - 1 && (
              <span className="inline-block w-2 h-5 bg-blue-500 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </div>
        ) : isStreaming ? (
          <div className="text-gray-400 text-sm animate-pulse">AI 正在构思精彩内容...</div>
        ) : (
          <div className="text-gray-400 text-sm">暂无内容</div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopy}
          disabled={!currentEssay}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg
                     hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? "✅ 已复制" : "📋 复制当前范文"}
        </button>
        <button
          onClick={handleScore}
          disabled={!currentEssay || isStreaming || scoring}
          className="flex-1 py-2.5 bg-green-500 text-white font-medium rounded-lg
                     hover:bg-green-600 active:bg-green-700 transition 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scoring ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI 正在批改...
            </span>
          ) : (
            "✅ AI 自动批改打分"
          )}
        </button>
      </div>
    </div>
  );
}