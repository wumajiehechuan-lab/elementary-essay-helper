"use client";

import { useState, useCallback } from "react";

interface ScoreReportProps {
  scoreReport: string;
  onScoreAnother: () => void;
  onBack: () => void;
}

export default function ScoreReport({ scoreReport, onScoreAnother, onBack }: ScoreReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(scoreReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [scoreReport]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">📊 阅卷批改 & 修改建议</h2>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          ← 返回范文
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px] max-h-[500px] overflow-y-auto">
          {scoreReport}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg
                     hover:bg-gray-50 transition"
        >
          {copied ? "✅ 已复制" : "📋 复制批改报告"}
        </button>
        <button
          onClick={onScoreAnother}
          className="flex-1 py-2.5 bg-blue-500 text-white font-medium rounded-lg
                     hover:bg-blue-600 active:bg-blue-700 transition"
        >
          🔄 换一篇批改
        </button>
      </div>
    </div>
  );
}