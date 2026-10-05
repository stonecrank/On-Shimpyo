import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Sparkles, AlertCircle, Send, Heart, BookOpen, Clock } from 'lucide-react';
import { RefineReplyResult } from '../types';

export const BoundaryGuard: React.FC = () => {
  const [rawInput, setRawInput] = useState('');
  const [situationType, setSituationType] = useState('after_hours');
  const [tone, setTone] = useState('gentle_firm');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RefineReplyResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presets = [
    {
      title: '퇴근 후 야간 알림장/카톡',
      text: '밤 10시에 학부모님이 아이 알림장 확인을 깜빡했다며 내일 준비물이 뭔지 지금 당장 알려달라고 연락이 왔어요.',
      type: 'after_hours',
    },
    {
      title: '친구와의 자리 배치 무리한 요구',
      text: '우리 아이가 싫어하는 학생과 절대 같은 모둠이나 짝이 되지 않게 해달라고 학부모님이 강력히 따지십니다.',
      type: 'unreasonable_demand',
    },
    {
      title: '쉬는 시간 아이들 다툼 항의',
      text: '아이들끼리 장난치다 부딪혔는데 상대 아이가 우리 애를 일방적으로 때렸다며 왜 담임이 안 보고 있었냐고 학교로 찾아오겠다고 화를 냅니다.',
      type: 'conflict_between_students',
    },
    {
      title: '수행평가 감점에 대한 항의',
      text: '기준표에 따라 감점된 수행평가 점수를 인정하지 못하겠다며, 아이 기죽이지 말고 만점으로 재평가해달라고 요구합니다.',
      type: 'grade_evaluation',
    },
  ];

  const handleRefine = async (customInput?: string) => {
    const text = customInput || rawInput;
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/refine-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: text,
          situationType,
          tone,
        }),
      });

      if (!res.ok) {
        throw new Error('답장 다듬기 요청에 실패했습니다.');
      }

      const data: RefineReplyResult = await res.json();
      setResult(data);
    } catch (e: any) {
      setErrorMessage(e?.message || '문안을 생성하는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveIncident = async (draft: any, index: number) => {
    try {
      const res = await fetch('/api/incident-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `inc-${Date.now()}`,
          createdAt: Date.now(),
          situationType,
          situationTitle: draft.title,
          originalSituation: rawInput,
          selectedDraft: draft.message,
          rationale: draft.rationale,
        }),
      });

      if (res.ok) {
        setSavedIndex(index);
        setTimeout(() => setSavedIndex(null), 2500);
      }
    } catch (e) {
      alert('일지 저장에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white rounded-2xl p-6 shadow-sm border border-stone-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl shrink-0">
            <ShieldCheck className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif-kr">민원·경계선 소통 방패</h2>
            <p className="text-sm text-stone-300 mt-1 leading-relaxed">
              갑작스러운 학부모의 항의나 야간 연락에 심장이 내려앉으셨나요? 선생님이 상처받지 않고,
              교권을 당당하게 보호하면서도 법적·교육적으로 흠잡을 데 없는 품격 있는 모범 답장으로 다듬어 드립니다.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-stone-500">선생님들이 자주 겪는 난감한 상황 예시:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setRawInput(p.text);
                setSituationType(p.type);
                handleRefine(p.text);
              }}
              className="text-left p-3 rounded-xl border border-stone-200 bg-white hover:bg-amber-50/60 hover:border-amber-300 transition-all text-xs space-y-1"
            >
              <div className="font-semibold text-stone-800 flex items-center justify-between">
                <span>{p.title}</span>
                <span className="text-[10px] text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded">클릭 시 자동 작성</span>
              </div>
              <p className="text-stone-500 line-clamp-1">{p.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            학부모가 보낸 내용이나 선생님이 처한 상황을 자유롭게 적어주세요
          </label>
          <textarea
            rows={4}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="예시: 퇴근 후 밤 9시에 카톡으로 아이가 학교에서 친구에게 기분 나쁜 말을 들었다며 당장 내일 학폭 열어달라고 항의하십니다. 내일 학교에서 공식 절차대로 확인하겠다고 정중하지만 단호하게 끊어내고 싶어요."
            className="w-full text-sm p-3.5 rounded-xl border border-stone-300 focus:border-amber-800 focus:ring-1 focus:ring-amber-800 outline-hidden bg-[#FAF8F5]/60"
          />
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">상황 카테고리</label>
            <select
              value={situationType}
              onChange={(e) => setSituationType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white focus:outline-hidden"
            >
              <option value="after_hours">근무시간 외 (야간·주말) 연락 및 독촉</option>
              <option value="unreasonable_demand">무리한 요구 / 편의 봐주기 강요</option>
              <option value="conflict_between_students">학생 간 갈등 및 담임 책임 추궁</option>
              <option value="grade_evaluation">평가·성적 결과 불만 및 정정 요구</option>
              <option value="disrespect_rudeness">폭언·인격모독성 위협 및 악성 항의</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">희망하는 대응 톤앤매너</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white focus:outline-hidden"
            >
              <option value="gentle_firm">부드러운 공감 후 원칙 안내 (추천)</option>
              <option value="strictly_official">규정 및 교육부 고시 중심 단호함</option>
              <option value="boundary_defense">공식 학교 채널 및 대면 상담 유도</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleRefine()}
            disabled={isLoading || !rawInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-amber-50 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-xs"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>교권 보호 문안 다듬는 중...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>안전한 모범 답장 생성하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Situation Summary & Teacher Self-Care Tip */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>전문가 핵심 분석: {result.summary}</span>
            </div>
            {result.teacherSelfCareTip && (
              <div className="flex items-start gap-2 text-xs text-amber-950/80 bg-white/70 p-3 rounded-xl border border-amber-100">
                <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-rose-900">선생님 마음 돌봄: </span>
                  {result.teacherSelfCareTip}
                </div>
              </div>
            )}
          </div>

          {/* 3 Generated Options */}
          <div className="grid grid-cols-1 gap-4">
            {result.recommendedDrafts.map((draft, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-amber-400 transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <span className="text-sm font-bold text-stone-900">{draft.title}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSaveIncident(draft, idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 transition-all border border-stone-200"
                      title="민원 대응 증빙 일지로 서버에 저장"
                    >
                      {savedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">일지 저장됨!</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>일지 저장</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => copyText(draft.message, idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 transition-all"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>문구 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200/80 text-sm text-stone-800 whitespace-pre-wrap font-serif-kr leading-relaxed">
                  {draft.message}
                </div>

                <div className="text-xs text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100 flex items-start gap-1.5">
                  <span className="font-semibold text-stone-700 shrink-0">🛡️ 보호 포인트:</span>
                  <span>{draft.rationale}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
