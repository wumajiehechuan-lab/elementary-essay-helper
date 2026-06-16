"use client";

import { useState, useCallback } from "react";
import { SurveyData, SurveyAnswers } from "@/types";

// 表情库
const EMOJI_LIST = ["🎉","✨","❤️","🌟","🥳","💯","📚","👏","👍","🎊","💖","🏆","📝","🌈","🎀","🧸","🍬","⭐"];
// 通用短夸
const TINY_PRAISE = ["太棒啦！","超合适！","选得好！","绝了！","满分思路！","很出彩！","眼光好！"];

interface SurveyFormProps {
  surveyData: SurveyData;
  onGenerateEssay: (answers: SurveyAnswers, essayCount: number) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export default function SurveyForm({ surveyData, onGenerateEssay, onBack, loading, error }: SurveyFormProps) {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [essayCount, setEssayCount] = useState(2);
  const [praiseTexts, setPraiseTexts] = useState<Record<number, string>>({});

  const answeredCount = Object.keys(answers).length;
  const totalCount = surveyData.question_list.length;
  const allAnswered = answeredCount === totalCount;

  const handleSelect = useCallback((qIndex: number, optionContent: string, optionPraise: string) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optionContent }));

    const randomEmoji = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
    const randomPraise = TINY_PRAISE[Math.floor(Math.random() * TINY_PRAISE.length)];
    const praiseText = `${randomEmoji} ${randomPraise}\n${optionPraise}`;
    setPraiseTexts((prev) => ({ ...prev, [qIndex]: praiseText }));
  }, []);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    await onGenerateEssay(answers, essayCount);
  };

  return (
    <div className="space-y-6">
      {/* 顶部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">📋 写作调研问卷</h2>
          <p className="text-sm text-gray-500 mt-1">{surveyData.survey_purpose}</p>
        </div>
        <button
          onClick={onBack}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
        >
          ← 返回修改标题
        </button>
      </div>

      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">📊 答题进度</span>
          <span className="text-gray-800 font-medium">{answeredCount} / {totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目列表 */}
      <div className="space-y-5">
        {surveyData.question_list.map((question, qIndex) => (
          <div key={qIndex} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-gray-800 font-medium mb-3">
              {qIndex + 1}. {question.question_text}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {question.option_group.map((opt) => {
                const isSelected = answers[qIndex] === opt.content;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelect(qIndex, opt.content, opt.option_praise)}
                    disabled={loading}
                    className={`text-left px-4 py-3 rounded-lg border-2 transition-all duration-200
                      ${isSelected
                        ? "border-blue-400 bg-blue-50 shadow-md scale-[1.02]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="font-semibold text-blue-500 mr-2">{opt.key}.</span>
                    <span className="text-gray-700">{opt.content}</span>
                  </button>
                );
              })}
            </div>
            {/* 夸奖文字 */}
            {praiseTexts[qIndex] && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
                <p className="text-green-700 text-sm whitespace-pre-line">{praiseTexts[qIndex]}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={essayCount}
            onChange={(e) => setEssayCount(Number(e.target.value))}
            disabled={loading}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            <option value={1}>📖 生成1篇范文</option>
            <option value={2}>📚 生成2篇范文</option>
            <option value={3}>📚📚 生成3篇范文</option>
          </select>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || loading}
            className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-lg
                       hover:bg-blue-600 active:bg-blue-700 transition 
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI 正在生成范文...
              </span>
            ) : (
              `✍️ 确认选择，生成满分范文`
            )}
          </button>
        </div>
        {!allAnswered && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            请完成全部 {totalCount} 道题目后再生成范文
          </p>
        )}
      </div>
    </div>
  );
}