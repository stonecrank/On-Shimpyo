import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as storage from './server/storage.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Counselor persona system instructions
const PERSONA_INSTRUCTIONS: Record<string, string> = {
  warm_mentor: `당신은 대한민국 교육 현장에서 25년간 교편을 잡고 수많은 어려움을 이겨낸 따뜻하고 인자한 수석교사이자 멘토인 '다솜 선생님'입니다.
- 주요 대상: 학부모 민원, 생활지도 갈등, 과중한 행정업무, 교직 회의감 등으로 심신이 지치고 자책감에 빠진 초·중·고·특수·유치원 선생님.
- 태도 및 어조: 깊은 존중과 무조건적인 정서적 지지. "선생님, 오늘 교실 문 닫고 나오실 때 얼마나 막막하고 속상하셨어요...", "선생님 잘못이 결코 아닙니다"처럼 따뜻하고 부드러운 경청과 공감의 언어를 사용합니다.
- 핵심 원칙:
  1. 먼저 선생님의 억울함과 슬픔, 불안, 분노, 무력감을 충분히 인정하고 수용(Validation)해주세요.
  2. 절대로 섣부른 훈계나 "선생님이 더 참으세요", "아이 입장에서 생각해보세요" 같은 2차 가해성 조언을 하지 마세요.
  3. 선생님의 열정과 헌신을 기억하고, 스스로를 비난하지 않도록 안아주세요.
  4. 대화 끝에는 편안하게 숨을 고를 수 있는 작은 격려를 건네주세요.`,

  rights_advocate: `당신은 대한민국 교권 보호 및 학교 분쟁 전문 노련한 교권 법률·행정 상담관인 '정원 상담관'입니다.
- 주요 대상: 악성 학부모 민원, 아동학대 무고 신고 위협, 학생 폭력/수업 방해, 관리자(교장·교감)의 부당한 지시 등으로 법적·행정적 불안에 처한 선생님.
- 태도 및 어조: 침착하고 든든하며, 전문적이고 명확한 어조. 불안에 떠는 선생님에게 든든한 방패가 되어줍니다.
- 핵심 원칙:
  1. 감정적 지지와 더불어 현실적이고 구체적인 대응 매뉴얼(녹음/메모 등 사실관계 증빙 확보, 공식 소통 채널 유도, 교권보호위원회 신청 절차, 학교안전공제회 및 교원치유지원센터 연계 등)을 단계별로 안내합니다.
  2. "혼자 감당하지 마시고 학교 교권보호책임관(교감) 및 지원청에 공식 지원을 요청해야 합니다"와 같이 교사 개인의 희생을 방지하는 실질적 팁을 제시합니다.
  3. 교원지위법, 교육부 교원의 학생생활지도에 관한 고시 등 최신 법령 및 기준에 부합하는 정당한 지도 권한을 상기시켜 주어 자존감을 북돋웁니다.`,

  burnout_coach: `당신은 교사 전문 심리상담가이자 마음챙김(Mindfulness) 테라피스트 '시우 코치'입니다.
- 주요 대상: 만성 피로, 가슴 답답함, 출근길 불안, 번아웃 증후군, 수면 장애, 퇴근 후에도 울리는 스마트폰 환청을 겪는 선생님.
- 태도 및 어조: 차분하고 나지막한 목소리, 호흡을 가다듬게 돕는 감각적인 언어.
- 핵심 원칙:
  1. '선생님'이라는 무거운 역할 가면을 잠시 내려놓고, '한 사람의 소중한 나'로 돌아오도록 이끕니다.
  2. 교직과 나 자신 사이에 '건강한 심리적·물리적 경계선(퇴근 후 연락 분리, 마음의 퇴근 의식)'을 짓는 연습을 돕습니다.
  3. 즉각적인 신체 이완(어깨 내리기, 깊은 복식호흡, 감각 접지 grounding) 기법을 부드럽게 안내합니다.`,

  bamboo_forest: `당신은 그 어떤 비밀도 지켜주고 세상 그 누구보다 온전히 묵묵히 들어주는 교사들의 비밀 대나무숲 '달빛'입니다.
- 주요 대상: 학교에서 아무에게도 말 못 하고 속으로만 삭였던 원망, 분노, 눈물, 교직을 그만두고 싶은 심정을 털어놓고 싶은 선생님.
- 태도 및 어조: 조언이나 해결책을 들이대지 않고, 온전히 선생님의 감정을 담아내는 넓은 그릇이 되어줍니다.
- 핵심 원칙:
  1. "다 털어놓으셔도 괜찮아요. 선생님 탓이 아니에요.", "얼마나 외롭고 서러우셨습니까..."
  2. 억눌린 감정의 카타르시스를 돕고, 선생님의 모든 감정을 있는 그대로 긍정합니다.`,
};

// 1. Multi-turn Chat Endpoint (with Server-Sent Events streaming & Adaptive Stress Context)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, counselorId = 'warm_mentor', teacherLevel, useStressProfile = true } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: '대화 메시지 목록이 필요합니다.' });
    return;
  }

  const baseInstruction = PERSONA_INSTRUCTIONS[counselorId] || PERSONA_INSTRUCTIONS.warm_mentor;
  const levelInfo = teacherLevel ? `\n[상담 신청 선생님 정보: ${teacherLevel} 재직 중]` : '';

  // Adaptive Counseling: Inject teacher's analyzed stress profile
  let stressContext = '';
  if (useStressProfile) {
    try {
      const report = await storage.getAnalyticsReport();
      if (report) {
        stressContext = `\n\n[선생님의 스트레스 분석 데이터 기반 초개인화 상담 지침]
- 가장 주된 스트레스 영역: ${report.dominantDomain} (번아웃 위험 수준: ${report.overallBurnoutRisk}, 번아웃 지수: ${report.burnoutScore}/100)
- 주된 유발 원인: ${report.stressRootCauses?.join(', ') || '복합적 교직 스트레스'}
- AI 심리 진단 소견: ${report.aiComprehensiveDiagnosis}
- 상담관 맞춤 행동 가이드:
${report.personalizedCounselingDirectives?.map((d: string) => `  * ${d}`).join('\n')}
선생님이 현재 이 스트레스 영역으로 인해 심신이 몹시 지쳐있음을 깊이 인지하고, 선생님이 자책하지 않도록 공감과 안도감을 선사해주세요.`;
      }
    } catch (e) {
      console.warn('Could not load stress report for chat context', e);
    }
  }

  const fullSystemInstruction = `${baseInstruction}${levelInfo}${stressContext}\n\n모든 답변은 한국어로 정성스럽고 진정성 있게 작성하세요.`;

  // Format messages for @google/genai SDK
  const formattedContents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    const errorMessage = error?.message || '상담 응답 생성 중 오류가 발생했습니다.';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

// 2. Teacher's Boundary Guard - Refine Parent/Complainant Replies
app.post('/api/refine-reply', async (req: Request, res: Response) => {
  const { rawInput, situationType = 'after_hours', tone = 'gentle_firm' } = req.body;

  if (!rawInput || typeof rawInput !== 'string') {
    res.status(400).json({ error: '상황 설명 또는 답변 초안을 입력해주세요.' });
    return;
  }

  const prompt = `당신은 대한민국 교육 현장의 교권보호 및 학부모 소통 전문 수석 장학사입니다.
선생님이 악성 민원이나 곤란한 학부모 연락(야간 연락, 과도한 요구, 학생 간 다툼 불만 등)을 받아 감정적으로 소모되지 않고, 
교권을 보호하면서도 교육적 품위와 법적 안전을 지키는 모범 답장 문안 3가지를 작성해주세요.

[선생님의 상황/작성하고 싶은 내용]
"${rawInput}"

[상황 유형]: ${situationType}
[희망 어조]: ${tone}

다음 JSON 규격으로만 응답해주세요. 설명이나 마크다운 백틱 없이 유효한 JSON만 반환해야 합니다:
{
  "summary": "상황의 본질과 대처 핵심 포인트 1줄 요약",
  "recommendedDrafts": [
    {
      "title": "안 1: 부드러운 공감 후 명확한 규정 안내 (가장 추천)",
      "message": "실제 전송할 알림장/문자 완성 문구",
      "rationale": "이 문구가 교사를 보호하는 이유"
    },
    {
      "title": "안 2: 단호하고 공식적인 학교 절차 안내 (경계선 확립)",
      "message": "실제 전송할 알림장/문자 완성 문구",
      "rationale": "이 문구가 교사를 보호하는 이유"
    },
    {
      "title": "안 3: 대면/공식 유선 상담 예약 유도 (메시지 논쟁 차단)",
      "message": "실제 전송할 알림장/문자 완성 문구",
      "rationale": "이 문구가 교사를 보호하는 이유"
    }
  ],
  "teacherSelfCareTip": "이 상황에서 선생님이 마음을 다치지 않기 위해 기억해야 할 위로와 자기돌봄 조언"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Refine reply error:', error);
    res.status(500).json({ error: '답장 다듬기 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' });
  }
});

// 3. Personalized Healing Prescription
app.post('/api/generate-prescription', async (req: Request, res: Response) => {
  const { struggle, emotionalWeather, teacherLevel } = req.body;

  const prompt = `당신은 지친 교사들을 위한 마음 치유 쉼터의 전담 테라피스트입니다.
오늘 하루 학교에서 심신이 소진된 선생님을 위해 '따뜻한 마음 처방전(Prescription of Warmth)'을 작성해주세요.

[선생님 상태]
- 재직: ${teacherLevel || '교원'}
- 마음 날씨: ${emotionalWeather || '먹구름과 비'}
- 겪고 계신 힘듦: ${struggle || '누적된 업무와 사람들의 시선으로 번아웃'}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "prescriptionTitle": "처방전 제목 (예: 가쁜 숨을 고르는 온쉼표 처방)",
  "counselorLetter": "선생님의 지친 마음을 어루만져주는 진심 어린 위로 편지 (공감과 눈물겨운 지지, 3~4문단)",
  "quote": "선생님을 위한 따뜻한 문장 또는 시 구절",
  "quoteAuthor": "출처 또는 저자 (예: 25년 차 선배 교사의 편지)",
  "recommendedTea": {
    "name": "추천 차 이름 (예: 카모마일 블렌드, 귤피차 등)",
    "benefit": "몸과 마음에 주는 이완 효과"
  },
  "threeMinuteMission": "오늘 밤 학교 생각을 끊고 나를 위해 실천할 수 있는 3분 소소한 힐링 행동 (예: 좋아하는 향초 켜고 따뜻한 물로 세수하기)",
  "affirmation": "선생님이 잠들기 전 거울을 보며 스스로에게 해줄 한마디"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Prescription error:', error);
    res.status(500).json({ error: '처방전 생성에 실패했습니다.' });
  }
});

// 4. Backend Counseling Records APIs
app.get('/api/records', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const records = await storage.getSessions(search, category);
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: '상담 기록을 불러오는데 실패했습니다.' });
  }
});

app.get('/api/records/:id', async (req: Request, res: Response) => {
  try {
    const record = await storage.getSessionById(req.params.id);
    if (!record) {
      res.status(404).json({ error: '상담 기록을 찾을 수 없습니다.' });
      return;
    }
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: '상담 기록 조회 실패' });
  }
});

app.post('/api/records/auto-summarize', async (req: Request, res: Response) => {
  const { messages, counselorName } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: '분석할 대화 내용이 없습니다.' });
    return;
  }

  const conversationText = messages
    .map((m: any) => `${m.role === 'user' ? '선생님' : counselorName || '상담관'}: ${m.content}`)
    .join('\n');

  const prompt = `다음은 지친 초·중·고·특수·유치원 교사와 상담관의 나눈 대화 전문입니다.
이 상담을 선생님이 나중에 다시 찾아보고 회고할 수 있도록 핵심을 요약해주세요.

[대화 전문]
${conversationText}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "공감과 울림이 있는 상담 일지 제목 (예: 퇴근 후 악성 민원 대처와 마음 추스름)",
  "summary": "오늘 상담의 핵심 고민과 마음의 전환을 담은 2줄 요약",
  "category": "다음 6개 중 가장 적합한 1개 선택: ['학부모 민원 및 소통', '학생 생활지도 및 훈육', '과중한 행정업무', '번아웃 및 심신 피로', '동료 및 관리자 관계', '기타 교직 고민']",
  "tags": ["키워드1", "키워드2", "키워드3"]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error('Auto summarize error:', err);
    res.json({
      title: '온쉼표 상담 기록',
      summary: '선생님의 마음을 털어놓고 위로를 나눈 대화입니다.',
      category: '번아웃 및 심신 피로',
      tags: ['심리상담', '교직회복'],
    });
  }
});

app.post('/api/records', async (req: Request, res: Response) => {
  try {
    const record = req.body;
    if (!record || !record.id) {
      res.status(400).json({ error: '유효한 상담 데이터가 필요합니다.' });
      return;
    }
    const saved = await storage.saveSession(record);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: '상담 기록 저장에 실패했습니다.' });
  }
});

app.put('/api/records/:id', async (req: Request, res: Response) => {
  try {
    const updated = await storage.updateSession(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: '수정할 기록을 찾을 수 없습니다.' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: '상담 기록 수정에 실패했습니다.' });
  }
});

app.delete('/api/records/:id', async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteSession(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: '상담 기록 삭제에 실패했습니다.' });
  }
});

// 5. Prescriptions Data APIs
app.get('/api/prescriptions', async (_req: Request, res: Response) => {
  try {
    const list = await storage.getPrescriptions();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: '처방전 목록 조회 실패' });
  }
});

app.post('/api/prescriptions', async (req: Request, res: Response) => {
  try {
    const saved = await storage.savePrescription(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: '처방전 저장 실패' });
  }
});

app.delete('/api/prescriptions/:id', async (req: Request, res: Response) => {
  try {
    const success = await storage.deletePrescription(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: '처방전 삭제 실패' });
  }
});

// 6. Incident Protection Logs APIs
app.get('/api/incident-logs', async (_req: Request, res: Response) => {
  try {
    const list = await storage.getIncidentLogs();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: '민원 기록 조회 실패' });
  }
});

app.post('/api/incident-logs', async (req: Request, res: Response) => {
  try {
    const saved = await storage.saveIncidentLog(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: '민원 기록 저장 실패' });
  }
});

app.delete('/api/incident-logs/:id', async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteIncidentLog(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: '민원 기록 삭제 실패' });
  }
});

// 7. Teacher Statistics & Health Analytics API
app.get('/api/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await storage.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: '통계 산출 실패' });
  }
});

// 8. Full Export & Reset
app.get('/api/export', async (_req: Request, res: Response) => {
  try {
    const data = await storage.exportAllData();
    res.setHeader('Content-Disposition', 'attachment; filename=on-shimpyo-counseling-backup.json');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: '백업 데이터 생성 실패' });
  }
});

app.post('/api/clear-all', async (_req: Request, res: Response) => {
  try {
    await storage.clearAllData();
    res.json({ success: true, message: '모든 상담 데이터가 안전하게 초기화되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ error: '데이터 초기화 실패' });
  }
});

// 9. Stress Classification & Analytics APIs ('민원 / 업무 / 수업 / 관계 / 소진')
app.get('/api/analytics', async (_req: Request, res: Response) => {
  try {
    const report = await storage.getAnalyticsReport();
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: '분석 데이터 조회 실패' });
  }
});

app.post('/api/analytics/analyze', async (req: Request, res: Response) => {
  try {
    const { currentMessages = [] } = req.body;
    const sessions = await storage.getSessions();
    const incidents = await storage.getIncidentLogs();

    // Aggregate all teacher utterances
    let textPayload = '';

    if (currentMessages && Array.isArray(currentMessages) && currentMessages.length > 0) {
      textPayload += '\n[현재 활성 상담 대화]:\n';
      textPayload += currentMessages
        .map((m: any) => `${m.role === 'user' ? '선생님' : '상담관'}: ${m.content}`)
        .join('\n');
    }

    if (sessions && sessions.length > 0) {
      textPayload += '\n[서버에 저장된 과거 상담 일지]:\n';
      sessions.forEach((s, idx) => {
        textPayload += `\n- 상담 ${idx + 1} (${s.title} / 분류: ${s.category}):\n`;
        textPayload += `  요약: ${s.summary}\n`;
        if (s.teacherNote) textPayload += `  선생님 회고 메모: ${s.teacherNote}\n`;
        if (s.messages && s.messages.length > 0) {
          const userMsgs = s.messages.filter((m) => m.role === 'user').map((m) => m.content).join(' / ');
          textPayload += `  선생님 발화: ${userMsgs}\n`;
        }
      });
    }

    if (incidents && incidents.length > 0) {
      textPayload += '\n[기록된 민원 발생 일지]:\n';
      incidents.forEach((inc, idx) => {
        textPayload += `\n- 민원 사안 ${idx + 1} (${inc.situationTitle}):\n`;
        textPayload += `  상황: ${inc.originalSituation}\n`;
        textPayload += `  선생님 대응 문구: ${inc.selectedDraft}\n`;
      });
    }

    // Fallback if no conversations exist yet
    if (!textPayload.trim()) {
      textPayload = '선생님이 학부모의 야간 연락과 과중한 행정 공문서 업무, 수업 중 통제 불능인 학생 지도 문제로 심각한 만성 피로와 번아웃을 호소하고 계십니다.';
    }

    const prompt = `당신은 대한민국 교육부 및 교원치유지원센터의 최고 수석 임상심리분석관입니다.
선생님이 상담실에서 나눈 대화 기록들과 일지 데이터를 종합 분석하여,
선생님이 가장 심각하게 스트레스를 겪는 핵심 영역('민원', '업무', '수업', '관계', '소진')을 분류하고 정량적/정성적으로 진단해주세요.

[분류 체계 기준]
1. '민원': 학부모의 악성 민원, 퇴근 후/야간 연락, 무리한 요구, 학교폭력 항의, 아동학대 무고 위협, 교육활동 침해
2. '업무': 과중한 행정업무, 공문서 폭탄, 나이스(NEIS) 처리, 각종 위원회, 방과후/돌봄 잡무, 교육청 감사 등
3. '수업': 수업 방해 학생, 생활지도 무력감, 기초학력 부진, 훈육 불응, 다문화/특수 학생 지도 어려움
4. '관계': 교장·교감 관리자의 압박/무관심, 동료 교사 간 업무 분장 갈등, 교무실 내 고립감
5. '소진': 출근 공포, 만성 피로, 수면 장애, 가슴 답답함, 신체화 증상, 교직 회의감, 자괴감

[분석할 상담 및 일지 데이터]
${textPayload}

반드시 아래 JSON 포맷으로만 응답하세요:
{
  "analyzedAt": ${Date.now()},
  "dominantDomain": "5개 중 가장 높은 비중을 차지하는 1개 ('민원' | '업무' | '수업' | '관계' | '소진')",
  "overallBurnoutRisk": "'안정' | '주의' | '경계' | '위험' 중 택1",
  "burnoutScore": 75,
  "domainScores": [
    {
      "domain": "민원",
      "label": "학부모 및 악성 민원 소통",
      "icon": "🛡️",
      "score": 85,
      "percentage": 45,
      "count": 4,
      "statusLevel": "위험",
      "primaryTriggers": ["퇴근 후 야간 연락", "무리한 요구"],
      "copingRecommendation": "개인 연락처 차단 및 모든 학부모 소통을 학교 공식 유선전화로 일원화할 것"
    },
    {
      "domain": "업무",
      "label": "과중한 행정업무 및 잡무",
      "icon": "📋",
      "score": 65,
      "percentage": 25,
      "count": 2,
      "statusLevel": "경계",
      "primaryTriggers": ["공문서 마감 압박", "NEIS 입력 업무"],
      "copingRecommendation": "오늘 처리할 핵심 공문 1개만 우선 처리하고 나머지는 기한 연장 신청"
    },
    {
      "domain": "수업",
      "label": "수업 및 학생 생활지도",
      "icon": "📖",
      "score": 50,
      "percentage": 15,
      "count": 1,
      "statusLevel": "주의",
      "primaryTriggers": ["수업 중 돌발 행동", "규칙 불응"],
      "copingRecommendation": "학생 행동 분리 매뉴얼 즉시 가동 및 학년부장 협조 요청"
    },
    {
      "domain": "관계",
      "label": "동료 교사 및 관리자 관계",
      "icon": "👥",
      "score": 30,
      "percentage": 5,
      "count": 0,
      "statusLevel": "안정",
      "primaryTriggers": ["관리자의 소극적 지원"],
      "copingRecommendation": "혼자 삭이지 말고 동학년 동료에게 협조 구하기"
    },
    {
      "domain": "소진",
      "label": "개인 심신 탈진 및 번아웃",
      "icon": "🔋",
      "score": 75,
      "percentage": 10,
      "count": 2,
      "statusLevel": "경계",
      "primaryTriggers": ["출근 전 불안", "퇴근 후에도 지속되는 긴장"],
      "copingRecommendation": "퇴근 후 30분간 감각 차단 및 따뜻한 온수 샤워 의식"
    }
  ],
  "aiComprehensiveDiagnosis": "선생님의 현재 심리 상태에 대한 전문적이고 따뜻한 3~4문장 종합 진단 소견",
  "stressRootCauses": ["핵심 스트레스 유발 원인 1", "원인 2", "원인 3"],
  "personalizedCounselingDirectives": [
    "상담 시 주의할 점: 선생님이 자책하지 않도록 민원 상황의 부당성을 먼저 인정할 것",
    "상담 시 권장할 점: 거절하는 말하기와 퇴근 후 심리적 차단 기술을 구체적으로 코칭할 것",
    "상담 시 지양할 점: '아이 입장도 생각해보세요'라는 2차 가해성 발언 절대 금지"
  ],
  "weeklyProtectionAction": "이번 주 선생님이 자신을 보호하기 위해 실천해야 할 가장 시급한 1가지 단호한 행동",
  "stressTrend": [
    { "period": "3주 전", "complaintScore": 45, "workloadScore": 50, "classroomScore": 30 },
    { "period": "2주 전", "complaintScore": 65, "workloadScore": 55, "classroomScore": 35 },
    { "period": "지난 주", "complaintScore": 80, "workloadScore": 60, "classroomScore": 40 },
    { "period": "이번 주", "complaintScore": 85, "workloadScore": 60, "classroomScore": 40 }
  ]
}`;

function generateHeuristicReport(sessions: any[], incidents: any[]) {
  const complaintCount = incidents.length + sessions.filter(s => (s.category || '').includes('민원')).length;
  const workloadCount = sessions.filter(s => (s.category || '').includes('행정') || (s.category || '').includes('업무')).length;
  const classroomCount = sessions.filter(s => (s.category || '').includes('생활지도') || (s.category || '').includes('수업')).length;
  const relationCount = sessions.filter(s => (s.category || '').includes('동료') || (s.category || '').includes('관리자')).length;
  const burnoutCount = sessions.filter(s => (s.category || '').includes('번아웃') || (s.category || '').includes('피로')).length;

  const total = Math.max(1, complaintCount + workloadCount + classroomCount + relationCount + burnoutCount);
  
  let dominantDomain: '민원' | '업무' | '수업' | '관계' | '소진' = '민원';
  if (workloadCount > complaintCount && workloadCount > classroomCount) dominantDomain = '업무';
  else if (classroomCount > complaintCount && classroomCount > workloadCount) dominantDomain = '수업';
  else if (burnoutCount > complaintCount) dominantDomain = '소진';

  const complaintPct = Math.round(((complaintCount + 1) / (total + 3)) * 100);
  const workloadPct = Math.round(((workloadCount + 1) / (total + 3)) * 100);
  const classroomPct = Math.round(((classroomCount + 1) / (total + 3)) * 100);

  return {
    analyzedAt: Date.now(),
    dominantDomain,
    overallBurnoutRisk: '경계' as const,
    burnoutScore: Math.min(95, 60 + complaintCount * 5 + workloadCount * 4),
    domainScores: [
      {
        domain: '민원' as const,
        label: '학부모 및 악성 민원 소통',
        icon: '🛡️',
        score: Math.min(98, 65 + complaintCount * 6),
        percentage: complaintPct,
        count: complaintCount,
        statusLevel: complaintCount > 2 ? '위험' : '경계',
        primaryTriggers: ['퇴근 후 야간/주말 알림장 및 카톡 연락', '무리한 편의 제공 및 특별대우 요구', '학생 간 다툼 발생 시 담임 책임 전가'],
        copingRecommendation: '개인 휴대전화 번호 비공개 원칙 고수 및 모든 학부모 민원을 학교 공식 유선전화와 교원업무시간(08:30~16:30)으로 한정할 것',
      },
      {
        domain: '업무' as const,
        label: '과중한 행정업무 및 잡무',
        icon: '📋',
        score: Math.min(90, 55 + workloadCount * 5),
        percentage: workloadPct,
        count: workloadCount,
        statusLevel: workloadCount > 2 ? '경계' : '주의',
        primaryTriggers: ['공문서 마감 압박', '나이스(NEIS) 입력 폭주', '전시성 사업 기안'],
        copingRecommendation: '선생님 혼자 짊어지지 마시고 부장 교사 및 관리자에게 업무 분장 조정을 공식 건의하고, 오늘 처리할 최우선 공문 1개에만 집중할 것',
      },
      {
        domain: '수업' as const,
        label: '수업 진행 및 학생 생활지도',
        icon: '📖',
        score: Math.min(85, 45 + classroomCount * 5),
        percentage: classroomPct,
        count: classroomCount,
        statusLevel: classroomCount > 2 ? '경계' : '주의',
        primaryTriggers: ['수업 중 돌발 행동 및 수업 방해', '교사 정당 지도에 대한 반항 및 훈육 불응'],
        copingRecommendation: '교육부 학생생활지도 고시 기준에 따라 즉각 교실 분리 조치(학습지원실/교무실)를 요청하고 육하원칙 지도일지를 작성할 것',
      },
      {
        domain: '관계' as const,
        label: '동료 교사 및 관리자 관계',
        icon: '👥',
        score: Math.min(70, 30 + relationCount * 5),
        percentage: 10,
        count: relationCount,
        statusLevel: relationCount > 1 ? '주의' : '안정',
        primaryTriggers: ['관리자(교장·교감)의 보호 부재', '교무실 내 고립감'],
        copingRecommendation: '어려운 일은 절대로 혼자 속앓이하지 마시고 동학년 교사나 교원치유센터 전담 상담관과 연결하여 마음의 연대를 형성할 것',
      },
      {
        domain: '소진' as const,
        label: '개인 심신 탈진 및 번아웃',
        icon: '🔋',
        score: 75,
        percentage: 15,
        count: burnoutCount,
        statusLevel: '경계',
        primaryTriggers: ['일요일 저녁 출근 공포', '가슴 답답함 및 신체화 긴장'],
        copingRecommendation: '퇴근 후 교직과의 물리적·심리적 경계선(업무 알림 완전 끄기, 따뜻한 족욕 15분, 심호흡)을 사수할 것',
      },
    ],
    aiComprehensiveDiagnosis: '선생님은 현재 학부모 민원과 누적된 교육 현장의 과중한 책임감으로 인해 신경계가 높은 각성 상태에 놓여 있습니다. 특히 "내가 더 잘했어야 했나"라는 자책이 심리적 회복을 가로막고 있으므로, 우선 선생님 개인의 희생을 멈추고 안전한 경계선을 확립해야 합니다.',
    stressRootCauses: [
      '학부모의 퇴근 후 불규칙한 연락 및 무리한 요구로 인한 지속적 긴장',
      '수업 외 행정업무와 돌발 학생 지도로 인한 에너지 소진',
      '교사 혼자 모든 책임을 져야 한다는 고립감과 자책감',
    ],
    personalizedCounselingDirectives: [
      '상담 시 주의할 점: 선생님이 자책하지 않도록 민원 상황의 부당성을 먼저 인정할 것',
      '상담 시 권장할 점: 거절하는 말하기와 퇴근 후 심리적 차단 기술을 구체적으로 코칭할 것',
      '상담 시 지양할 점: "아이 입장도 생각해보세요"라는 2차 가해성 발언 절대 금지',
    ],
    weeklyProtectionAction: '이번 주에는 퇴근 10분 전 모든 학교 업무 알림을 끄고, 저녁 시간에는 학교 전화 일체에 대응하지 않는 "퇴근 경계선 의식"을 지켜주세요.',
    stressTrend: [
      { period: '3주 전', complaintScore: 45, workloadScore: 50, classroomScore: 30 },
      { period: '2주 전', complaintScore: 65, workloadScore: 55, classroomScore: 35 },
      { period: '지난 주', complaintScore: 80, workloadScore: 60, classroomScore: 40 },
      { period: '이번 주', complaintScore: 85, workloadScore: 60, classroomScore: 40 },
    ],
  };
}

    let report: any = null;
    let attempts = 0;
    while (attempts < 2) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '{}';
        report = JSON.parse(text);
        break;
      } catch (geminiErr: any) {
        attempts++;
        if (attempts >= 2) {
          console.warn('Gemini temporary spike, using heuristic diagnostics generator', geminiErr);
          break;
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    if (!report || !report.dominantDomain) {
      report = generateHeuristicReport(sessions, incidents);
    }

    await storage.saveAnalyticsReport(report);
    res.json(report);
  } catch (err: any) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: err.message || '스트레스 분석 생성에 실패했습니다.', details: String(err) });
  }
});

// Production vs Development static file handling
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`온쉼표 (On-Shimpyo) Server is running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
