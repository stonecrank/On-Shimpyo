import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Coffee, Clock, BookOpen, Quote, Share2, Printer, Check, Copy } from 'lucide-react';
import { PrescriptionData, TeacherLevel } from '../types';
import { EMOTIONAL_WEATHERS } from '../data/counselors';

interface PrescriptionCardProps {
  initialStruggle?: string;
  teacherLevel: TeacherLevel;
  selectedWeather: string;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  initialStruggle = '',
  teacherLevel,
  selectedWeather,
}) => {
  const [struggle, setStruggle] = useState(initialStruggle);
  const [isLoading, setIsLoading] = useState(false);
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToBackend, setSavedToBackend] = useState(false);

  const currentWeatherObj = EMOTIONAL_WEATHERS.find((w) => w.id === selectedWeather) || EMOTIONAL_WEATHERS[1];

  const defaultStruggles = [
    '퇴근 후에도 심장이 쿵쾅거리고 내일 출근이 무서워요',
    '아무리 정성을 쏟아도 달라지지 않는 아이들 때문에 무력감이 들어요',
    '악성 민원과 학부모의 차가운 시선에 가슴이 찢어집니다',
    '내가 좋은 교사인지, 왜 교사가 되었는지 길을 잃었어요',
  ];

  const handleGenerate = async (customStruggle?: string) => {
    const text = customStruggle || struggle;
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          struggle: text || '교직 스트레스와 만성 피로',
          emotionalWeather: currentWeatherObj.label,
          teacherLevel,
        }),
      });

      if (!res.ok) throw new Error('처방전 생성 실패');
      const data: PrescriptionData = await res.json();
      setPrescription(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialStruggle && !prescription) {
      setStruggle(initialStruggle);
      handleGenerate(initialStruggle);
    }
  }, [initialStruggle]);

  const copyPrescription = () => {
    if (!prescription) return;
    const fullText = `[온쉼표 교사 마음 처방전: ${prescription.prescriptionTitle}]\n\n${prescription.counselorLetter}\n\n🌿 추천 차: ${prescription.recommendedTea.name} (${prescription.recommendedTea.benefit})\n\n🌙 3분 미션: ${prescription.threeMinuteMission}\n\n💌 거울 앞 확언: "${prescription.affirmation}"\n\n- ${prescription.quote} (${prescription.quoteAuthor})`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToBackend = async () => {
    if (!prescription) return;
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `rx-${Date.now()}`,
          createdAt: Date.now(),
          title: prescription.prescriptionTitle,
          struggle,
          data: prescription,
        }),
      });

      if (res.ok) {
        setSavedToBackend(true);
        setTimeout(() => setSavedToBackend(false), 2500);
      }
    } catch (e) {
      alert('처방전 서버 저장에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Box */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 text-amber-900 rounded-full text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
          <span>오직 선생님 한 분만을 위한 따뜻한 위로 편지</span>
        </div>
        <h2 className="text-2xl font-bold font-serif-kr text-stone-900">오늘의 온(溫) 마음 처방전</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          학교 문을 나서며 아직 덜어내지 못한 무거운 짐이 있다면, 지금 이 처방전을 통해 당신의 마음을 따뜻하게 안아주세요.
        </p>
      </div>

      {/* Input Selection */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
        <label className="block text-xs font-semibold text-stone-700">선생님을 가장 힘들게 한 마음의 무게는 무엇인가요?</label>
        <div className="flex flex-wrap gap-1.5">
          {defaultStruggles.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setStruggle(s);
                handleGenerate(s);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={struggle}
            onChange={(e) => setStruggle(e.target.value)}
            placeholder="직접 입력: 예) 오늘 학부모님 통화로 가슴이 뛰고 손이 떨려요"
            className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-800 outline-hidden bg-[#FAF8F5]"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="px-4 py-2.5 bg-amber-900 hover:bg-amber-800 text-amber-50 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shrink-0"
          >
            {isLoading ? '처방전 조제 중...' : '처방전 받기'}
          </button>
        </div>
      </div>

      {/* Prescription Result Card */}
      {prescription && (
        <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden animate-in fade-in duration-300">
          {/* Subtle Warm Watermark Seal */}
          <div className="absolute right-4 top-4 opacity-10 pointer-events-none select-none text-8xl font-serif-kr">
            溫
          </div>

          {/* Top Header of Card */}
          <div className="flex items-center justify-between border-b border-amber-900/15 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-900/70 tracking-widest uppercase">ON-SHIMPYO PRESCRIPTION</span>
              <h3 className="text-xl font-bold font-serif-kr text-stone-900 mt-1">{prescription.prescriptionTitle}</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                수신: {teacherLevel}의 귀한 선생님께 · 마음 날씨: {currentWeatherObj.label} {currentWeatherObj.icon}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveToBackend}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors shadow-xs"
                title="처방전을 백엔드 서버에 영구 보관"
              >
                {savedToBackend ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">보관함에 저장됨!</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>보관함에 저장</span>
                  </>
                )}
              </button>

              <button
                onClick={copyPrescription}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-amber-50 transition-colors shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">처방전 복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>처방전 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Counselor Letter */}
          <div className="bg-white/80 rounded-2xl p-5 border border-amber-900/10 font-serif-kr text-stone-800 leading-relaxed text-sm sm:text-base whitespace-pre-wrap shadow-xs">
            {prescription.counselorLetter}
          </div>

          {/* Two-column Care Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recommended Tea */}
            <div className="bg-white/80 rounded-2xl p-4 border border-amber-900/10 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                <Coffee className="w-4 h-4 text-amber-700" />
                <span>오늘 밤 추천하는 온기: {prescription.recommendedTea.name}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">{prescription.recommendedTea.benefit}</p>
            </div>

            {/* 3-minute Decompression Mission */}
            <div className="bg-white/80 rounded-2xl p-4 border border-amber-900/10 space-y-1.5">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>오늘 밤 3분 쉼표 미션</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">{prescription.threeMinuteMission}</p>
            </div>
          </div>

          {/* Affirmation Badge */}
          <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-amber-50 rounded-2xl p-4 space-y-1 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-300">🌙 잠들기 전 거울을 보며 나에게 건넬 한마디</span>
            <p className="text-sm sm:text-base font-serif-kr font-medium leading-relaxed italic">
              "{prescription.affirmation}"
            </p>
          </div>

          {/* Quote Section */}
          <div className="text-center pt-2 border-t border-amber-900/15">
            <p className="font-serif-kr text-xs sm:text-sm text-stone-700 italic">
              "{prescription.quote}"
            </p>
            <span className="text-[11px] text-stone-400 mt-1 block">- {prescription.quoteAuthor}</span>
          </div>
        </div>
      )}
    </div>
  );
};
