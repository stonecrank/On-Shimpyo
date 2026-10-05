import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, PhoneCall, ShieldCheck, HeartHandshake, Wind, FileText, Settings2, FolderArchive, BarChart3 } from 'lucide-react';
import { EMOTIONAL_WEATHERS } from '../data/counselors';
import { TeacherLevel } from '../types';
import { ambiencePlayer } from '../utils/audioAmbience';

interface HeaderProps {
  activeTab: 'counsel' | 'boundary' | 'prescription' | 'breathe' | 'support' | 'archive' | 'analytics';
  setActiveTab: (tab: 'counsel' | 'boundary' | 'prescription' | 'breathe' | 'support' | 'archive' | 'analytics') => void;
  selectedWeather: string;
  setSelectedWeather: (weather: string) => void;
  teacherLevel: TeacherLevel;
  setTeacherLevel: (level: TeacherLevel) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedWeather,
  setSelectedWeather,
  teacherLevel,
  setTeacherLevel,
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      ambiencePlayer.stop();
      setIsAudioPlaying(false);
    } else {
      ambiencePlayer.start(0.25);
      setIsAudioPlaying(true);
    }
  };

  const currentWeatherObj = EMOTIONAL_WEATHERS.find((w) => w.id === selectedWeather) || EMOTIONAL_WEATHERS[1];

  const levels: TeacherLevel[] = ['초등학교', '중학교', '고등학교', '유치원/어린이집', '특수학교', '기타 교원'];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top row: Brand + Quick Mood & Sound Controls */}
        <div className="flex items-center justify-between py-3 border-b border-stone-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white shadow-sm shadow-amber-900/10">
              <span className="font-serif-kr font-bold text-lg">溫</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-stone-900 tracking-tight font-serif-kr">온쉼표</h1>
                <span className="text-xs text-amber-800/80 font-medium hidden sm:inline">대한민국 교사를 위한 마음 안식처</span>
              </div>
              <p className="text-xs text-stone-500">지친 선생님의 어깨를 토닥이는 따뜻한 심리상담 쉼터</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ambient Sound Button */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isAudioPlaying
                  ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                  : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
              title={isAudioPlaying ? '빗소리 앰비언스 끄기' : '마음을 진정시키는 빗소리 앰비언스 켜기'}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                  <span className="hidden sm:inline">창가 빗소리 On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline">창가 빗소리 Off</span>
                </>
              )}
            </button>

            {/* Teacher Profile / School Level Selector */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-stone-100 text-stone-700 hover:bg-stone-200/70 transition-colors"
              >
                <span>{teacherLevel}</span>
                <span className="text-stone-400 text-[10px]">▼</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-stone-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-stone-400">교원 소속 변경</div>
                  {levels.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setTeacherLevel(lvl);
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                        teacherLevel === lvl ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Emotional Weather Pill Selector */}
            <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-lg">
              {EMOTIONAL_WEATHERS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWeather(w.id)}
                  title={`${w.label} - ${w.desc}`}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    selectedWeather === w.id
                      ? 'bg-white shadow-xs text-stone-900 font-semibold ring-1 ring-stone-200'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <span className="text-sm">{w.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('counsel')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all shrink-0 ${
              activeTab === 'counsel'
                ? 'bg-amber-900 text-amber-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>온(溫) 마음 상담실</span>
          </button>

          <button
            onClick={() => setActiveTab('boundary')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all shrink-0 ${
              activeTab === 'boundary'
                ? 'bg-amber-900 text-amber-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>민원·경계선 소통 방패</span>
          </button>

          <button
            onClick={() => setActiveTab('prescription')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all shrink-0 ${
              activeTab === 'prescription'
                ? 'bg-amber-900 text-amber-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>오늘의 마음 처방전</span>
          </button>

          <button
            onClick={() => setActiveTab('breathe')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all shrink-0 ${
              activeTab === 'breathe'
                ? 'bg-amber-900 text-amber-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>3분 숨고르기</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all shrink-0 ${
              activeTab === 'support'
                ? 'bg-amber-900 text-amber-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>교사 긴급 지원망</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-amber-900 text-amber-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span>스트레스 데이터 분석</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all shrink-0 ${
              activeTab === 'archive'
                ? 'bg-amber-900 text-amber-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-amber-600" />
            <span>내 마음 보관함</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
