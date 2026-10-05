/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { CounselingRoom } from './components/CounselingRoom';
import { BoundaryGuard } from './components/BoundaryGuard';
import { PrescriptionCard } from './components/PrescriptionCard';
import { BreathingRoom } from './components/BreathingRoom';
import { TeacherSupportInfo } from './components/TeacherSupportInfo';
import { CounselingArchive } from './components/CounselingArchive';
import { StressAnalytics } from './components/StressAnalytics';
import { TeacherLevel, StressDomainType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'counsel' | 'boundary' | 'prescription' | 'breathe' | 'support' | 'archive' | 'analytics'>('counsel');
  const [selectedWeather, setSelectedWeather] = useState<string>('cloudy');
  const [teacherLevel, setTeacherLevel] = useState<TeacherLevel>('초등학교');
  const [prescriptionStruggle, setPrescriptionStruggle] = useState<string>('');

  const handleOpenPrescription = (struggleText: string) => {
    setPrescriptionStruggle(struggleText);
    setActiveTab('prescription');
  };

  const handleStartCustomChatFromAnalytics = (domain: StressDomainType) => {
    setActiveTab('counsel');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col selection:bg-amber-200/70 selection:text-amber-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedWeather={selectedWeather}
        setSelectedWeather={setSelectedWeather}
        teacherLevel={teacherLevel}
        setTeacherLevel={setTeacherLevel}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-4">
        {activeTab === 'counsel' && (
          <CounselingRoom
            teacherLevel={teacherLevel}
            onOpenPrescription={handleOpenPrescription}
            onOpenArchive={() => setActiveTab('archive')}
          />
        )}

        {activeTab === 'analytics' && (
          <StressAnalytics onStartCustomChat={handleStartCustomChatFromAnalytics} />
        )}

        {activeTab === 'boundary' && <BoundaryGuard />}

        {activeTab === 'prescription' && (
          <PrescriptionCard
            initialStruggle={prescriptionStruggle}
            teacherLevel={teacherLevel}
            selectedWeather={selectedWeather}
          />
        )}

        {activeTab === 'breathe' && <BreathingRoom />}

        {activeTab === 'support' && <TeacherSupportInfo />}

        {activeTab === 'archive' && <CounselingArchive />}
      </main>

      {/* Gentle, Unobtrusive Footer */}
      <footer className="border-t border-stone-200/60 py-4 bg-white/40 mt-auto text-center text-xs text-stone-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-serif-kr">
            온쉼표 (溫 · 쉼표) · "오늘도 교실을 지켜내신 선생님, 참으로 애쓰셨습니다."
          </p>
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span>비밀 보장 및 데이터 보호</span>
            <span>·</span>
            <span>교육활동보호센터 연계</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
