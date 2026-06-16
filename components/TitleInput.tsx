"use client";

import { useState } from "react";

interface TitleInputProps {
  onGenerateSurvey: (title: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function TitleInput({ onGenerateSurvey, loading, error }: TitleInputProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || title.trim().length < 2) return;
    await onGenerateSurvey(title.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🌟 小学生满分作文助手
        </h1>
        <p className="text-gray-500 text-sm">
          输入作文标题，AI 帮你生成调研问卷，精准产出满分范文
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          📝 请输入作文标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="示例：我的妈妈"
          maxLength={50}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 
                     focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-2">{title.length}/50 字</p>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || title.trim().length < 2}
          className="mt-4 w-full py-3 bg-blue-500 text-white font-medium rounded-lg
                     hover:bg-blue-600 active:bg-blue-700 transition disabled:opacity-50 
                     disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI 正在分析作文得分要点...
            </span>
          ) : (
            "生成问卷"
          )}
        </button>
      </div>
    </div>
  );
}