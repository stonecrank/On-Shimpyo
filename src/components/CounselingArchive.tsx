import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Search,
  Calendar,
  Tag,
  Trash2,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  FileText,
  Shield,
  MessageSquare,
  BarChart3,
  Coffee,
  Heart,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { CounselingRecord, SavedPrescriptionItem, SavedIncidentLog, TeacherStats } from '../types';

export const CounselingArchive: React.FC = () => {
  const [subTab, setSubTab] = useState<'sessions' | 'prescriptions' | 'incidents' | 'stats'>('sessions');
  const [sessions, setSessions] = useState<CounselingRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<SavedPrescriptionItem[]>([]);
  const [incidents, setIncidents] = useState<SavedIncidentLog[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const categories = [
    '전체',
    '학부모 민원 및 소통',
    '학생 생활지도 및 훈육',
    '과중한 행정업무',
    '번아웃 및 심신 피로',
    '동료 및 관리자 관계',
    '기타 교직 고민',
  ];

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resSessions, resPrescriptions, resIncidents, resStats] = await Promise.all([
        fetch(`/api/records?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`),
        fetch('/api/prescriptions'),
        fetch('/api/incident-logs'),
        fetch('/api/stats'),
      ]);

      if (resSessions.ok) setSessions(await resSessions.json());
      if (resPrescriptions.ok) setPrescriptions(await resPrescriptions.json());
      if (resIncidents.ok) setIncidents(await resIncidents.json());
      if (resStats.ok) setStats(await resStats.json());
    } catch (e) {
      console.error('Failed to fetch backend counseling data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('이 상담 기록을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        fetchData();
      }
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSaveNote = async (id: string) => {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherNote: noteDraft }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
        setEditingNoteId(null);
      }
    } catch (e) {
      alert('메모 저장에 실패했습니다.');
    }
  };

  const handleDeletePrescription = async (id: string) => {
    if (!confirm('이 처방전을 보관함에서 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/prescriptions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPrescriptions((prev) => prev.filter((p) => p.id !== id));
        fetchData();
      }
    } catch (e) {
      alert('삭제 실패');
    }
  };

  const handleDeleteIncident = async (id: string) => {
    if (!confirm('이 민원 대응 기록을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/incident-logs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIncidents((prev) => prev.filter((i) => i.id !== id));
        fetchData();
      }
    } catch (e) {
      alert('삭제 실패');
    }
  };

  const handleExportBackup = () => {
    window.open('/api/export', '_blank');
  };

  const handleClearAll = async () => {
    if (
      confirm(
        '정말로 백엔드 서버에 저장된 모든 상담 데이터와 일지를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      try {
        const res = await fetch('/api/clear-all', { method: 'POST' });
        if (res.ok) {
          alert('모든 데이터가 안전하게 초기화되었습니다.');
          fetchData();
        }
      } catch (e) {
        alert('초기화 실패');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wider uppercase">
            <FolderArchive className="w-4 h-4" />
            <span>SERVER DATA MANAGEMENT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-kr mt-1">내 마음 기록 보관함</h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            백엔드 서버에 안전하게 축적된 선생님의 상담 기록, 처방전, 민원 일지를 열람하고 관리하세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-colors border border-stone-700"
            title="상담 데이터 JSON 백업 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            <span>데이터 백업</span>
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-red-950/60 hover:bg-red-900/80 text-red-200 rounded-xl transition-colors border border-red-900/50"
            title="데이터 전체 초기화"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>전체 삭제</span>
          </button>
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('sessions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            subTab === 'sessions'
              ? 'bg-amber-900 text-amber-50 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>상담 일지 ({sessions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('prescriptions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            subTab === 'prescriptions'
              ? 'bg-amber-900 text-amber-50 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>보관된 처방전 ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('incidents')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            subTab === 'incidents'
              ? 'bg-amber-900 text-amber-50 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>민원 대응 일지 ({incidents.length})</span>
        </button>

        <button
          onClick={() => setSubTab('stats')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            subTab === 'stats'
              ? 'bg-amber-900 text-amber-50 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>마음 회복 통계</span>
        </button>
      </div>

      {/* 1. Counseling Sessions Subview */}
      {subTab === 'sessions' && (
        <div className="space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목, 요약, 태그, 메모 검색..."
                className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2 rounded-xl border border-stone-300 focus:border-amber-800 outline-hidden bg-white"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </form>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-stone-800 text-white font-medium'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 space-y-2">
              <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
              <h3 className="text-sm font-bold text-stone-700">저장된 상담 기록이 없습니다.</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                '온(溫) 마음 상담실'에서 상담을 진행하신 후, 상단의 '💾 상담 일지에 저장' 버튼을 누르면 백엔드에 안전하게
                기록됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const isEditingNote = editingNoteId === session.id;

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition-all space-y-3"
                  >
                    {/* Top Row: Counselor & Date & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                          {session.counselorName}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">· {session.category}</span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-50 transition-colors"
                          title="기록 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <div>
                      <h3 className="text-base font-bold text-stone-900 font-serif-kr">{session.title}</h3>
                      <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">{session.summary}</p>
                    </div>

                    {/* Tags */}
                    {session.tags && session.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {session.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Teacher Personal Note Area */}
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-700 flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-amber-700" />
                          <span>선생님의 개인 회고 메모</span>
                        </span>
                        {!isEditingNote && (
                          <button
                            onClick={() => {
                              setEditingNoteId(session.id);
                              setNoteDraft(session.teacherNote || '');
                            }}
                            className="text-[11px] text-amber-800 hover:underline"
                          >
                            {session.teacherNote ? '수정' : '+ 메모 작성'}
                          </button>
                        )}
                      </div>

                      {isEditingNote ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            rows={2}
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="상담 후 느낀 점, 내일 실천할 행동, 나만의 다짐 등을 적어보세요..."
                            className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white focus:outline-hidden"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2.5 py-1 text-xs text-stone-500 hover:bg-stone-200 rounded-md"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handleSaveNote(session.id)}
                              className="px-3 py-1 text-xs bg-amber-900 text-white rounded-md flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>저장</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-600 italic">
                          {session.teacherNote || '작성된 메모가 없습니다. 나만의 회고를 남겨보세요.'}
                        </p>
                      )}
                    </div>

                    {/* Toggle Conversation Transcript Accordion */}
                    <div className="border-t border-stone-100 pt-2 flex items-center justify-between">
                      <button
                        onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                        className="text-xs text-stone-500 hover:text-stone-900 font-medium flex items-center gap-1"
                      >
                        <span>대화 전문 ({session.messages?.length || 0}개 메시지)</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Conversation */}
                    {isExpanded && (
                      <div className="mt-3 p-3.5 bg-stone-50 rounded-xl space-y-3 max-h-80 overflow-y-auto border border-stone-200">
                        {session.messages?.map((msg, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-stone-800 text-white ml-6'
                                : 'bg-white text-stone-800 border border-stone-200 mr-6 font-serif-kr'
                            }`}
                          >
                            <div className="font-bold text-[10px] text-stone-400 mb-0.5">
                              {msg.role === 'user' ? '선생님' : session.counselorName}
                            </div>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Prescriptions Subview */}
      {subTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 space-y-2">
              <FileText className="w-8 h-8 text-stone-300 mx-auto" />
              <h3 className="text-sm font-bold text-stone-700">보관된 처방전이 없습니다.</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                '오늘의 마음 처방전' 메뉴에서 조제받은 위로 카드를 보관함에 저장해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FAF8F5] rounded-2xl border border-amber-900/15 p-5 shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
                    <div>
                      <span className="text-[10px] text-amber-900/70 font-bold uppercase tracking-wider">
                        SAVED PRESCRIPTION
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 font-serif-kr mt-0.5">
                        {item.data.prescriptionTitle}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleDeletePrescription(item.id)}
                      className="text-stone-400 hover:text-red-600 p-1"
                      title="처방전 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-700 line-clamp-3 font-serif-kr bg-white/70 p-2.5 rounded-lg border border-amber-900/10">
                    {item.data.counselorLetter}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                    <div className="bg-white/60 p-2 rounded-lg">
                      <span className="font-semibold text-amber-900 block">☕ 추천 차</span>
                      {item.data.recommendedTea.name}
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg">
                      <span className="font-semibold text-emerald-900 block">🌙 3분 미션</span>
                      <span className="line-clamp-1">{item.data.threeMinuteMission}</span>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-stone-400">
                    발급일:{' '}
                    {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Incident Logs Subview */}
      {subTab === 'incidents' && (
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 space-y-2">
              <Shield className="w-8 h-8 text-stone-300 mx-auto" />
              <h3 className="text-sm font-bold text-stone-700">기록된 민원 대응 일지가 없습니다.</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                '민원·경계선 소통 방패'에서 작성한 모범 답장 및 대응 내역을 일지로 저장하여 향후 공식 기록으로 활용하세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {inc.situationTitle}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(inc.createdAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteIncident(inc.id)}
                      className="p-1 text-stone-400 hover:text-red-600"
                      title="일지 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-stone-700">발생 상황 / 원문 기록:</span>
                    <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                      {inc.originalSituation}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-amber-900">발송/대응한 모범 문안:</span>
                    <p className="text-xs text-stone-800 bg-[#FAF8F5] p-3 rounded-xl border border-amber-900/15 font-serif-kr whitespace-pre-wrap leading-relaxed">
                      {inc.selectedDraft}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Teacher Statistics & Health Analytics */}
      {subTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-400 font-medium">총 상담 세션</span>
              <div className="text-2xl font-bold text-stone-900 font-serif-kr mt-1">{stats.totalSessions}회</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-400 font-medium">나눈 대화 메시지</span>
              <div className="text-2xl font-bold text-stone-900 font-serif-kr mt-1">{stats.totalMessages}건</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-400 font-medium">간직한 처방전</span>
              <div className="text-2xl font-bold text-amber-900 font-serif-kr mt-1">{stats.totalPrescriptions}개</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-400 font-medium">민원 대응 기록</span>
              <div className="text-2xl font-bold text-emerald-900 font-serif-kr mt-1">
                {stats.totalIncidentLogs}건
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">나를 가장 힘들게 했던 고민 영역</h3>
            <div className="space-y-2">
              {Object.entries(stats.categoryDistribution).map(([cat, count]) => {
                const percentage = Math.round((count / (stats.totalSessions || 1)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-stone-700">{cat}</span>
                      <span className="text-stone-400">
                        {count}회 ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-800 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(stats.categoryDistribution).length === 0 && (
                <p className="text-xs text-stone-400 py-4 text-center">아직 축적된 카테고리 데이터가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
