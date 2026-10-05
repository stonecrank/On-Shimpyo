import React from 'react';
import { PhoneCall, ShieldAlert, BookOpen, AlertTriangle, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

export const TeacherSupportInfo: React.FC = () => {
  const hotlines = [
    {
      name: '교육부 교원마음나눔 직통콜 (교권·심리상담)',
      number: '1395',
      hours: '평일 09:00 ~ 18:00',
      desc: '교권 침해 사안 접수, 법률 상담, 전문 심리상담까지 원스톱 지원',
      highlight: true,
    },
    {
      name: '정신건강 위기상담전화 (24시간)',
      number: '1577-0199',
      hours: '연중무휴 24시간',
      desc: '극심한 스트레스, 공황, 불안으로 당장 숨쉬기 힘들 때 즉시 연결',
      highlight: true,
    },
    {
      name: '자살예방 상담전화',
      number: '109',
      hours: '연중무휴 24시간',
      desc: '세상에 혼자 남겨진 것 같고 절망적일 때 도움을 요청하세요',
      highlight: false,
    },
    {
      name: '대한법률구조공단',
      number: '132',
      hours: '평일 09:00 ~ 18:00',
      desc: '민·형사 소송 및 법률 분쟁 관련 무료 법률상담',
      highlight: false,
    },
  ];

  const rightsProcedures = [
    {
      step: '01',
      title: '감정적 대응 멈춤 및 즉각 증빙 확보',
      desc: '학부모 폭언 통화 녹음, 문자·알림장 캡처, 학생 돌발행동 시간대별 육하원칙 업무일지 기록',
    },
    {
      step: '02',
      title: '학교 관리자(교감·교장) 공식 보고',
      desc: '개인 번호 연락 차단 및 학교 대표 유선전화/공식 소통 채널(e알리미 등)로만 응대하도록 일원화 요청',
    },
    {
      step: '03',
      title: '지역교권보호위원회 소집 요청',
      desc: '시·도 교육지원청 교육활동보호센터에 교권 침해 심의 신청 및 피해교원 특별휴가(5일) 신청',
    },
    {
      step: '04',
      title: '교육청 전담 변호사 및 심리상담 연계',
      desc: '교원치유지원센터를 통해 무료 심리검사, 심리상담비(최대 100~200만원) 및 법률 자문관 선임 지원',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-emerald-50 rounded-2xl p-6 border border-emerald-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs tracking-wider uppercase">
          <ShieldAlert className="w-4 h-4" />
          <span>TEACHER PROTECTION NETWORK</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif-kr">선생님 긴급 지원망 & 교권 안전 가이드</h2>
        <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
          선생님은 결코 혼자가 아닙니다. 부당한 침해나 감당하기 힘든 위기 상황에 처했을 때,
          법률과 제도가 선생님을 지킬 수 있도록 공식 지원망을 안내해 드립니다.
        </p>
      </div>

      {/* Emergency Hotlines */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-emerald-600" />
          <span>선생님을 위한 긴급 직통 연락처</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hotlines.map((h, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border transition-all ${
                h.highlight
                  ? 'bg-emerald-50/70 border-emerald-200 shadow-xs'
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">{h.name}</span>
                <span className="text-[11px] text-stone-400">{h.hours}</span>
              </div>
              <div className="text-2xl font-bold text-stone-900 font-serif-kr mt-1">
                {h.number}
              </div>
              <p className="text-xs text-stone-500 mt-1">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal & Administrative 4-Step Procedure */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span>악성 민원 및 교권 침해 발생 시 4단계 행동 수칙</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {rightsProcedures.map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-base font-bold text-amber-900/70 font-serif-kr shrink-0 mt-0.5">
                {p.step}
              </span>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-stone-900">{p.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Organizations Contact Guide */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 p-5 space-y-3">
        <h3 className="text-xs font-bold text-stone-700">교원 단체 및 노동조합 교권 상담 안내</h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          가입된 교원단체(한국교총, 전교조, 교사노조연맹 등)가 있다면 소속 지부의 교권 전담 국장 또는 고문 변호사의 조력을 무료로 받을 수 있습니다.
          소송 비용 지원 및 변호인 선임 특약 보험을 미리 확인해 두시면 든든한 방패가 됩니다.
        </p>
      </div>
    </div>
  );
};
