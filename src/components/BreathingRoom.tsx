import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Wind, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const BreathingRoom: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  // 4-7-8 Breathing Rhythm
  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (phase === 'inhale') {
              setPhase('hold');
              return 7;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 8;
            } else {
              setPhase('inhale');
              setCycleCount((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimer(4);
    setCycleCount(0);
  };

  const getPhaseDetails = () => {
    switch (phase) {
      case 'inhale':
        return {
          title: '코로 깊이 숨 들이마시기 (4초)',
          desc: '시원하고 맑은 공기가 온몸을 가득 채웁니다',
          scale: 'scale-125',
          color: 'bg-amber-100 text-amber-900 border-amber-300 ring-8 ring-amber-100/50',
        };
      case 'hold':
        return {
          title: '숨을 가만히 멈추기 (7초)',
          desc: '몸의 긴장과 떨림을 고요 속에 멈춥니다',
          scale: 'scale-110',
          color: 'bg-stone-200 text-stone-800 border-stone-400 ring-8 ring-stone-100/50',
        };
      case 'exhale':
        return {
          title: '입으로 천천히 후- 내쉬기 (8초)',
          desc: '오늘 하루의 모든 억울함과 불안을 내보냅니다',
          scale: 'scale-90',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-8 ring-emerald-100/50',
        };
    }
  };

  const currentDetails = getPhaseDetails();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-center">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold">
          <Wind className="w-3.5 h-3.5 text-emerald-700" />
          <span>신경계를 진정시키는 4-7-8 이완 호흡법</span>
        </div>
        <h2 className="text-2xl font-bold font-serif-kr text-stone-900">지친 선생님을 위한 3분 숨고르기</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          가슴이 뛰고 손이 떨릴 때, 아무 생각도 하지 말고 원의 움직임에 맞춰 호흡을 따라오세요.
        </p>
      </div>

      {/* Breathing Animated Visualizer */}
      <div className="py-8 flex flex-col items-center justify-center min-h-[300px]">
        <div
          className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 shadow-lg ${
            currentDetails.scale
          } ${currentDetails.color}`}
        >
          <span className="text-4xl sm:text-5xl font-bold font-serif-kr tabular-nums">{timer}</span>
          <span className="text-xs font-semibold mt-1 tracking-wider uppercase">{phase}</span>
        </div>

        <div className="mt-6 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif-kr">{currentDetails.title}</h3>
          <p className="text-xs sm:text-sm text-stone-500">{currentDetails.desc}</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-2 px-6 py-3 bg-amber-900 hover:bg-amber-800 text-amber-50 rounded-2xl text-sm font-semibold transition-all shadow-sm"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4" />
              <span>잠시 멈춤</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>호흡 시작하기</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl transition-colors"
          title="처음부터 다시"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Cycle counter */}
      <div className="text-xs text-stone-400">
        완료한 호흡 주기: <span className="font-bold text-stone-700">{cycleCount}회</span> (3~4회 반복 시 심장 박동이
        안정됩니다)
      </div>

      {/* Teacher Grounding Tips */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 text-left space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>신체화 증상(심장 두근거림, 가슴 답답함) 완화 팁</span>
        </h4>
        <ul className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
          <li className="flex items-start gap-1.5">
            <span className="text-amber-700 font-bold">1.</span>
            <span>양 어깨를 귀 쪽으로 으쓱 올렸다가, 숨을 후 내쉬며 바닥으로 툭 떨어뜨리세요.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-amber-700 font-bold">2.</span>
            <span>발바닥 전체가 교실이나 방바닥에 닿아 있는 감각(그라운딩)에 30초간 집중해보세요.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-amber-700 font-bold">3.</span>
            <span>미지근한 물 한 컵을 천천히 삼키며 목을 넘어가는 온도를 느껴보세요.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
