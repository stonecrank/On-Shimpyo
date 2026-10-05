import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, RefreshCw, Trash2, Copy, Check, MessageSquare, Heart, Shield, ArrowDown, BookmarkPlus, X } from 'lucide-react';
import { COUNSELORS, SITUATION_TEMPLATES } from '../data/counselors';
import { ChatMessage, CounselorId, TeacherLevel, CounselingRecord } from '../types';

interface CounselingRoomProps {
  teacherLevel: TeacherLevel;
  onOpenPrescription: (struggleText: string) => void;
  onOpenArchive?: () => void;
}

export const CounselingRoom: React.FC<CounselingRoomProps> = ({ teacherLevel, onOpenPrescription, onOpenArchive }) => {
  const [selectedCounselorId, setSelectedCounselorId] = useState<CounselorId>('warm_mentor');
  
  // History stored per counselor in localStorage
  const [threads, setThreads] = useState<Record<CounselorId, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('on_shimpyo_threads');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved chat threads');
    }
    // Initial welcome state
    return {
      warm_mentor: [
        {
          id: 'welcome-1',
          role: 'model',
          content: COUNSELORS[0].welcomeMessage,
          timestamp: Date.now(),
        },
      ],
      rights_advocate: [
        {
          id: 'welcome-2',
          role: 'model',
          content: COUNSELORS[1].welcomeMessage,
          timestamp: Date.now(),
        },
      ],
      burnout_coach: [
        {
          id: 'welcome-3',
          role: 'model',
          content: COUNSELORS[2].welcomeMessage,
          timestamp: Date.now(),
        },
      ],
      bamboo_forest: [
        {
          id: 'welcome-4',
          role: 'model',
          content: COUNSELORS[3].welcomeMessage,
          timestamp: Date.now(),
        },
      ],
    };
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Archive Save Modal States
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [saveDraft, setSaveDraft] = useState({
    title: '',
    summary: '',
    category: '학부모 민원 및 소통',
    tags: [] as string[],
    teacherNote: '',
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('on_shimpyo_threads', JSON.stringify(threads));
    } catch (e) {
      console.warn('Storage quota exceeded');
    }
  }, [threads]);

  // Current active counselor
  const currentCounselor = COUNSELORS.find((c) => c.id === selectedCounselorId) || COUNSELORS[0];
  const currentMessages = threads[selectedCounselorId] || [];

  // Scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [selectedCounselorId]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [currentMessages, isStreaming]);

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || isStreaming) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    const modelMessageId = `model-${Date.now() + 1}`;
    const newModelPlaceholder: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now() + 1,
    };

    // Update state with user message and placeholder
    const updatedMessages = [...currentMessages, newUserMsg, newModelPlaceholder];
    setThreads((prev) => ({
      ...prev,
      [selectedCounselorId]: updatedMessages,
    }));

    setInputMessage('');
    setIsStreaming(true);

    try {
      // Send conversation to backend SSE stream
      // We pass prior messages + user message (excluding the empty placeholder)
      const payloadMessages = [...currentMessages, newUserMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: payloadMessages,
          counselorId: selectedCounselorId,
          teacherLevel,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('서버 응답 오류가 발생했습니다.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                // Live update the placeholder
                setThreads((prev) => {
                  const msgs = [...(prev[selectedCounselorId] || [])];
                  const idx = msgs.findIndex((m) => m.id === modelMessageId);
                  if (idx !== -1) {
                    msgs[idx] = {
                      ...msgs[idx],
                      content: accumulatedText,
                    };
                  }
                  return { ...prev, [selectedCounselorId]: msgs };
                });
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setThreads((prev) => {
        const msgs = [...(prev[selectedCounselorId] || [])];
        const idx = msgs.findIndex((m) => m.id === modelMessageId);
        if (idx !== -1) {
          msgs[idx] = {
            ...msgs[idx],
            content: '선생님, 순간적으로 대화 연결이 원활하지 못했습니다. 잠시 후 다시 한 번 편안히 말씀해 주시겠어요? 온 마음으로 기다리고 있습니다.',
          };
        }
        return { ...prev, [selectedCounselorId]: msgs };
      });
    } finally {
      setIsStreaming(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleClearHistory = () => {
    if (confirm('현재 상담관과의 대화 기록을 비우고 새 상담을 시작할까요?')) {
      setThreads((prev) => ({
        ...prev,
        [selectedCounselorId]: [
          {
            id: `welcome-${Date.now()}`,
            role: 'model',
            content: currentCounselor.welcomeMessage,
            timestamp: Date.now(),
          },
        ],
      }));
    }
  };

  const handleOpenSaveModal = async () => {
    // Only save if there is at least one user message
    const userMessages = currentMessages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) {
      alert('저장할 상담 대화 내용이 아직 없습니다. 먼저 편히 마음을 말씀해주세요.');
      return;
    }

    setShowSaveModal(true);
    setIsSummarizing(true);

    try {
      const res = await fetch('/api/records/auto-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          counselorName: currentCounselor.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSaveDraft({
          title: data.title || `${currentCounselor.name}과의 상담 기록`,
          summary: data.summary || '오늘 나눈 따뜻한 상담 대화입니다.',
          category: data.category || '학부모 민원 및 소통',
          tags: data.tags || ['교직상담'],
          teacherNote: '',
        });
      }
    } catch (e) {
      setSaveDraft({
        title: `${currentCounselor.name}과의 상담 기록`,
        summary: '오늘 나눈 소중한 상담 대화입니다.',
        category: '학부모 민원 및 소통',
        tags: ['교직상담'],
        teacherNote: '',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleConfirmSaveRecord = async () => {
    setIsSavingRecord(true);
    try {
      const newRecord: CounselingRecord = {
        id: `rec-${Date.now()}`,
        counselorId: selectedCounselorId,
        counselorName: currentCounselor.name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: saveDraft.title.trim() || `${currentCounselor.name}과의 상담 기록`,
        summary: saveDraft.summary.trim() || '상담 대화 기록',
        category: saveDraft.category,
        tags: saveDraft.tags,
        weather: 'cloudy',
        teacherNote: saveDraft.teacherNote.trim(),
        messages: currentMessages,
      };

      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });

      if (res.ok) {
        setShowSaveModal(false);
        setSaveSuccessMsg(true);
        setTimeout(() => setSaveSuccessMsg(false), 3000);
      } else {
        alert('서버 저장에 실패했습니다.');
      }
    } catch (e) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsSavingRecord(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[620px] max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* Save Success Alert Notification */}
      {saveSuccessMsg && (
        <div className="mb-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">상담 일지가 백엔드 서버의 '내 마음 기록 보관함'에 안전하게 저장되었습니다!</span>
          </div>
          {onOpenArchive && (
            <button onClick={onOpenArchive} className="underline text-emerald-900 font-bold hover:text-emerald-950">
              보관함 바로가기
            </button>
          )}
        </div>
      )}

      {/* 1. Counselor Persona Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-3">
        {COUNSELORS.map((counselor) => {
          const isSelected = counselor.id === selectedCounselorId;
          return (
            <button
              key={counselor.id}
              onClick={() => setSelectedCounselorId(counselor.id)}
              className={`flex items-start gap-2.5 p-3 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-white border-amber-800/40 shadow-sm ring-1 ring-amber-800/20'
                  : 'bg-white/60 border-stone-200/80 hover:bg-white hover:border-stone-300'
              }`}
            >
              <span className="text-2xl shrink-0 p-1 bg-stone-100/80 rounded-lg">{counselor.avatar}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-stone-900' : 'text-stone-700'}`}>
                    {counselor.name}
                  </h3>
                </div>
                <p className="text-[11px] text-amber-900/80 font-medium truncate">{counselor.badge}</p>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{counselor.roleTitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Chat Main Container */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Active Counselor Subheader */}
        <div className="px-4 py-2.5 bg-stone-50/80 border-b border-stone-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentCounselor.avatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-900">{currentCounselor.name}</span>
                <span className="text-[11px] text-stone-500 font-normal">· {currentCounselor.roleTitle}</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium border border-amber-200 hidden md:inline">
                  ✨ 스트레스 분석 맞춤 연동
                </span>
              </div>
              <p className="text-xs text-stone-600 line-clamp-1">{currentCounselor.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save to Backend Server Archive Button */}
            <button
              onClick={handleOpenSaveModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
              title="현재 상담 내용을 백엔드 일지에 저장"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">서버 일지 저장</span>
            </button>

            <button
              onClick={() => {
                const lastUserMsg = [...currentMessages].reverse().find((m) => m.role === 'user');
                onOpenPrescription(lastUserMsg?.content || '오늘 하루 교직 스트레스와 피로');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-100/70 hover:bg-amber-100 rounded-lg transition-colors"
              title="이 대화를 바탕으로 위로 처방전 발급"
            >
              <Heart className="w-3.5 h-3.5 text-amber-700 fill-amber-700/20" />
              <span className="hidden sm:inline">마음 처방전 받기</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              title="대화 기록 비우기"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {currentMessages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isLast = index === currentMessages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-lg shrink-0 mt-0.5">
                    {currentCounselor.avatar}
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[85%] sm:max-w-[78%]`}>
                  {/* Speaker name */}
                  <div className={`text-[11px] font-medium text-stone-400 ${isUser ? 'text-right' : 'text-left'}`}>
                    {isUser ? `${teacherLevel} 선생님` : currentCounselor.name}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap transition-all shadow-xs ${
                      isUser
                        ? 'bg-stone-800 text-stone-50 rounded-tr-xs'
                        : 'bg-[#FAF8F5] text-stone-800 border border-stone-200/90 rounded-tl-xs font-serif-kr'
                    }`}
                  >
                    {msg.content === '' && isStreaming && isLast ? (
                      <div className="flex items-center gap-1.5 py-1 text-stone-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                        <span className="text-xs">선생님의 마음을 깊이 헤아리는 중입니다...</span>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Action buttons (Copy, Timestamp) */}
                  {!isUser && msg.content && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="text-[11px] text-stone-400 hover:text-stone-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-100 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>위로의 말 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-amber-800/10 border border-amber-800/20 text-amber-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    교사
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Preset Icebreaker Situation Prompts */}
        <div className="px-4 py-2 bg-stone-50/70 border-t border-stone-100 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 w-max">
            <span className="text-[11px] font-medium text-stone-400 shrink-0 mr-1">마음 털어놓기:</span>
            {SITUATION_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                disabled={isStreaming}
                onClick={() => handleSendMessage(tpl.prompt)}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:border-amber-300 border border-stone-200 text-stone-700 text-xs rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Textarea Input Box */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
          <div className="relative flex items-end gap-2 bg-[#FAF8F5] border border-stone-300 rounded-xl p-2 focus-within:border-amber-800 focus-within:ring-1 focus-within:ring-amber-800 transition-all">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputMessage}
              disabled={isStreaming}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${currentCounselor.name}에게 오늘 학교에서 있었던 힘든 일이나 마음의 짐을 편히 말씀해주세요. (Shift+Enter 줄바꿈)`}
              className="flex-1 bg-transparent resize-none text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden leading-relaxed"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isStreaming || !inputMessage.trim()}
              className="p-2.5 rounded-lg bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-40 disabled:hover:bg-amber-900 transition-colors shrink-0"
              title="상담 메시지 전송"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-stone-400">
            <span>💡 백엔드 서버에 상담 일지를 저장하면 영구 보관 및 통계 분석이 가능합니다.</span>
            <span>Gemini 3.8 Flash 지원</span>
          </div>
        </div>
      </div>

      {/* Save Session Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-amber-800" />
                <h3 className="text-base font-bold text-stone-900 font-serif-kr">상담 일지 서버 저장</h3>
              </div>
              <button onClick={() => setShowSaveModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSummarizing ? (
              <div className="py-8 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-amber-700 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-stone-700">상담 대화의 핵심을 AI가 요약하는 중입니다...</p>
                <p className="text-xs text-stone-400">제목과 핵심 카테고리를 자동으로 정리하고 있습니다.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">상담 일지 제목</label>
                  <input
                    type="text"
                    value={saveDraft.title}
                    onChange={(e) => setSaveDraft({ ...saveDraft, title: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 focus:border-amber-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">상담 요약</label>
                  <textarea
                    rows={2}
                    value={saveDraft.summary}
                    onChange={(e) => setSaveDraft({ ...saveDraft, summary: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:border-amber-800 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">고민 카테고리</label>
                    <select
                      value={saveDraft.category}
                      onChange={(e) => setSaveDraft({ ...saveDraft, category: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="학부모 민원 및 소통">학부모 민원 및 소통</option>
                      <option value="학생 생활지도 및 훈육">학생 생활지도 및 훈육</option>
                      <option value="과중한 행정업무">과중한 행정업무</option>
                      <option value="번아웃 및 심신 피로">번아웃 및 심신 피로</option>
                      <option value="동료 및 관리자 관계">동료 및 관리자 관계</option>
                      <option value="기타 교직 고민">기타 교직 고민</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">태그</label>
                    <input
                      type="text"
                      value={saveDraft.tags.join(', ')}
                      onChange={(e) =>
                        setSaveDraft({
                          ...saveDraft,
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      placeholder="쉼표로 구분"
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    선생님의 소회 & 내일을 위한 한 줄 다짐 (선택)
                  </label>
                  <textarea
                    rows={2}
                    value={saveDraft.teacherNote}
                    onChange={(e) => setSaveDraft({ ...saveDraft, teacherNote: e.target.value })}
                    placeholder="예: 오늘 다솜 선생님과 이야기 나누고 죄책감을 덜었다. 내일은 공식 채널로만 응대하자."
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-[#FAF8F5] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="px-3 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmSaveRecord}
                    disabled={isSavingRecord}
                    className="px-4 py-2 text-xs font-semibold bg-amber-900 hover:bg-amber-800 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSavingRecord ? '저장 중...' : '서버에 저장하기'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
