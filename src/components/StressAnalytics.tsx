import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Heart,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Brain,
  Zap,
  ArrowRight,
  Shield,
  FileSpreadsheet,
  BookOpen,
  Users,
  BatteryWarning,
} from 'lucide-react';
import { StressAnalyticsReport, StressDomainType, StressDomainScore } from '../types';

interface StressAnalyticsProps {
  onStartCustomChat?: (domain: StressDomainType) => void;
}

export const StressAnalytics: React.FC<StressAnalyticsProps> = ({ onStartCustomChat }) => {
  const [report, setReport] = useState<StressAnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useAdaptiveCounseling, setUseAdaptiveCounseling] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<StressDomainType | null>(null);

  // Fetch or trigger analysis
  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        if (data && data.dominantDomain) {
          setReport(data);
          setSelectedDomain(data.dominantDomain);
        } else {
          // If no report exists, run analyze
          handleRunAnalysis();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      // Gather active messages from localStorage if available
      let localMessages: any[] = [];
      try {
        const saved = localStorage.getItem('on_shimpyo_threads');
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.values(parsed).forEach((thread: any) => {
            if (Array.isArray(thread)) {
              localMessages.push(...thread.filter((m: any) => m.role === 'user'));
            }
          });
        }
      } catch (e) {}

      const res = await fetch('/api/analytics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentMessages: localMessages }),
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setSelectedDomain(data.dominantDomain);
      }
    } catch (e) {
      console.error('Failed to run stress analysis', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const getDomainIcon = (d: StressDomainType) => {
    switch (d) {
      case '민원':
        return <Shield className="w-4 h-4 text-rose-600" />;
      case '업무':
        return <FileSpreadsheet className="w-4 h-4 text-amber-600" />;
      case '수업':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case '관계':
        return <Users className="w-4 h-4 text-sky-600" />;
      case '소진':
        return <BatteryWarning className="w-4 h-4 text-purple-600" />;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case '위험':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case '경계':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case '주의':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const activeDomainData = report?.domainScores.find((d) => d.domain === selectedDomain) || report?.domainScores[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Brain className="w-3.5 h-3.5" />
              <span>대화 데이터 기반 스트레스 분류 & 정밀 진단 시스템</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-kr">선생님 마음 스트레스 데이터 분석관</h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              상담실에서 나눈 대화와 민원 일지 데이터를 종합 분석하여 <strong>'민원 / 업무 / 수업 / 관계 / 소진'</strong> 5대
              영역 중 가장 취약한 스트레스 원인을 진단하고, AI 상담관이 선생님을 더욱 완벽하게 치유하도록 맞춤형으로 진화합니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? '대화 심층 분석 중...' : '최신 대화로 분석 갱신'}</span>
            </button>
          </div>
        </div>
      </div>

      {report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Core Summary Scoreboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dominant Stress Domain */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-stone-400">가장 집중된 스트레스 영역</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold font-serif-kr text-stone-900">{report.dominantDomain}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getRiskBadgeColor(
                    report.overallBurnoutRisk
                  )}`}
                >
                  {report.overallBurnoutRisk} 단계
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                현재 대화에서 가장 높은 빈도와 정서적 고통을 유발하는 핵심 요인입니다.
              </p>
            </div>

            {/* Overall Burnout Score */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-stone-400">종합 심신 소진(번아웃) 지수</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-serif-kr text-amber-900 tabular-nums">
                  {report.burnoutScore}
                </span>
                <span className="text-xs text-stone-400">/ 100점</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    report.burnoutScore > 75
                      ? 'bg-rose-600'
                      : report.burnoutScore > 50
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${report.burnoutScore}%` }}
                />
              </div>
            </div>

            {/* Weekly Urgent Protection Action */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-1.5">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-700" />
                <span>이번 주 최우선 자기보호 처방</span>
              </span>
              <p className="text-xs text-stone-800 font-serif-kr leading-relaxed font-semibold">
                "{report.weeklyProtectionAction}"
              </p>
            </div>
          </div>

          {/* 2. Interactive 5-Domain Stress Breakdown */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-serif-kr">
                  교사 5대 스트레스 영역 정밀 분포 ('민원 / 업무 / 수업 / 관계 / 소진')
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  각 영역을 클릭하시면 상세 유발 원인과 맞춤 대처법을 확인할 수 있습니다.
                </p>
              </div>

              {/* Adaptive Counseling Mode Toggle */}
              <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                <span className="text-xs font-semibold text-stone-700">상담관 데이터 연동</span>
                <button
                  onClick={() => setUseAdaptiveCounseling(!useAdaptiveCounseling)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    useAdaptiveCounseling ? 'bg-amber-800' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                      useAdaptiveCounseling ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 5 Domains Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {report.domainScores.map((scoreObj) => {
                const isSelected = selectedDomain === scoreObj.domain;
                return (
                  <button
                    key={scoreObj.domain}
                    onClick={() => setSelectedDomain(scoreObj.domain)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-800/40 shadow-xs ring-1 ring-amber-800/30'
                        : 'bg-[#FAF8F5]/80 border-stone-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{scoreObj.icon}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getRiskBadgeColor(
                          scoreObj.statusLevel
                        )}`}
                      >
                        {scoreObj.statusLevel}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-stone-800">{scoreObj.domain}</div>
                      <div className="text-[11px] text-stone-400 line-clamp-1">{scoreObj.label}</div>
                    </div>
                    <div className="mt-2 text-base font-bold font-serif-kr text-amber-950 tabular-nums">
                      {scoreObj.score}점
                      <span className="text-[10px] text-stone-400 font-normal ml-1">({scoreObj.percentage}%)</span>
                    </div>
                    <div className="w-full bg-stone-200/70 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-amber-800 h-1.5 rounded-full"
                        style={{ width: `${scoreObj.percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Domain Detail Card */}
            {activeDomainData && (
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeDomainData.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">
                        {activeDomainData.domain} 스트레스 분석: {activeDomainData.label}
                      </h4>
                      <p className="text-xs text-stone-500">
                        현재 위험도: <strong className="text-stone-800">{activeDomainData.statusLevel}</strong> ·
                        누적 관련 발화 및 사안: {activeDomainData.count}건
                      </p>
                    </div>
                  </div>

                  {onStartCustomChat && (
                    <button
                      onClick={() => onStartCustomChat(activeDomainData.domain)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-semibold rounded-xl transition-all"
                    >
                      <span>이 영역 집중 상담하기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Primary Triggers */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>대화에서 감지된 주요 유발 원인</span>
                    </span>
                    <ul className="space-y-1 text-stone-600 list-disc list-inside">
                      {activeDomainData.primaryTriggers.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
                      <span>교사 권익 및 심리 방어 대처 가이드</span>
                    </span>
                    <p className="text-stone-700 leading-relaxed font-serif-kr">
                      {activeDomainData.copingRecommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. AI Comprehensive Diagnosis Report */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-base font-serif-kr border-b border-stone-100 pb-3">
              <Sparkles className="w-5 h-5 text-amber-700" />
              <span>AI 수석 임상심리관 종합 소견서</span>
            </div>

            <div className="bg-[#FAF8F5] p-4.5 rounded-2xl border border-amber-900/10 font-serif-kr text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">
              {report.aiComprehensiveDiagnosis}
            </div>

            {/* Stress Root Causes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700">대화를 관통하는 3대 근본 피로 요인:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {report.stressRootCauses.map((cause, idx) => (
                  <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-700">
                    <span className="font-bold text-amber-900 mr-1.5">0{idx + 1}.</span>
                    {cause}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Adaptive Counselor Directives (How counselors upgrade themselves) */}
          <div className="bg-gradient-to-br from-amber-950 to-stone-900 text-amber-50 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-serif-kr">상담 프로그램 진화 지침 (Adaptive Directives)</h3>
              </div>
              <span className="text-xs text-amber-300 font-medium">
                {useAdaptiveCounseling ? '✓ 모든 상담관에게 자동 반영 중' : '일반 모드'}
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              분석된 스트레스 데이터를 바탕으로, AI 상담관(다솜 수석교사, 정원 상담관 등)이 선생님과의 대화 시 준수하는
              맞춤 소통 규정입니다:
            </p>

            <div className="space-y-2">
              {report.personalizedCounselingDirectives.map((directive, idx) => (
                <div key={idx} className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs text-amber-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{directive}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
