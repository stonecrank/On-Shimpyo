import { CounselorPersona } from '../types';

export const COUNSELORS: CounselorPersona[] = [
  {
    id: 'warm_mentor',
    name: '다솜 선생님',
    roleTitle: '25년 경력 수석교사 멘토',
    avatar: '👩‍🏫',
    badge: '따뜻한 온기 · 자책감 치유',
    description: '교직의 온갖 비바람을 겪어낸 선배 교사입니다. "선생님 탓이 아니에요"라며 선생님의 아픈 마음을 품어줍니다.',
    welcomeMessage: '선생님, 오늘 교실 문 닫고 나오실 때 얼마나 애쓰셨어요. 온종일 아이들과 부대끼고 업무에 치여 무거웠던 마음, 여기 잠시 내려놓으세요. 선생님은 오늘 하루도 최선을 다하셨습니다. 무슨 일이 있었는지 편히 말씀해주세요.',
    accentColor: 'from-amber-600 to-orange-600',
  },
  {
    id: 'rights_advocate',
    name: '정원 상담관',
    roleTitle: '교권 보호 및 법률·행정 상담관',
    avatar: '⚖️',
    badge: '악성 민원 · 교권 침해 방패',
    description: '학부모의 무리한 요구, 아동학대 신고 위협, 교권 침해에 당황하지 않도록 냉철한 안전 대책과 절차를 안내합니다.',
    welcomeMessage: '선생님, 부당한 대우나 과도한 민원, 교권 침해 상황으로 두려우셨다면 안심하세요. 선생님은 법률과 정당한 지도 권한으로 보호받아야 할 소중한 교육자입니다. 현재 어떤 상황에 직면하셨는지 구체적으로 말씀해주시면 실질적인 대처 방안을 찾아드리겠습니다.',
    accentColor: 'from-emerald-700 to-teal-700',
  },
  {
    id: 'burnout_coach',
    name: '시우 코치',
    roleTitle: '교사 번아웃 & 마음챙김 테라피스트',
    avatar: '🌿',
    badge: '탈진 회복 · 퇴근 후 경계선',
    description: '가슴 답답함, 출근 공포, 만성 피로에 시달리는 선생님을 위해 몸과 마음의 긴장을 풀고 분리하는 법을 함께합니다.',
    welcomeMessage: '선생님, 지금 어깨에 들어간 힘을 후- 하고 한번 내려놓아 볼까요? 학교에서의 무거운 책임감은 잠시 교실에 두고 오셔도 괜찮습니다. 지금 선생님의 몸과 마음 상태는 어떤가요? 조급해하지 말고 천천히 호흡을 나눠보아요.',
    accentColor: 'from-sky-700 to-indigo-700',
  },
  {
    id: 'bamboo_forest',
    name: '달빛 대나무숲',
    roleTitle: '비밀 보장 무조건적 경청자',
    avatar: '🎋',
    badge: '억울함 토로 · 자유 배출',
    description: '동료에게도, 가족에게도 차마 하지 못했던 원망, 억울함, 교직을 그만두고 싶은 마음을 비밀리에 온전히 쏟아내는 공간입니다.',
    welcomeMessage: '이곳은 그 어떤 기록도, 평가도 남지 않는 선생님만의 비밀 숲입니다. 소리 내어 울어도 좋고, 꾹꾹 눌러 담았던 화와 원망을 거침없이 쏟아내셔도 좋습니다. 그저 다 털어놓으세요. 달빛이 묵묵히 들어드릴게요.',
    accentColor: 'from-purple-700 to-violet-800',
  },
];

export const SITUATION_TEMPLATES = [
  {
    label: '학부모 퇴근 후 연락',
    prompt: '밤 늦은 시간이나 주말에 학부모님께서 계속 카톡과 전화를 하시며 즉각적인 답변을 요구하셔서 심장이 두근거려요.',
  },
  {
    label: '학생 생활지도 무력감',
    prompt: '수업 시간에 지속적으로 방해하고 욕설하는 학생을 지도하다가 다른 아이들 앞에서 자괴감이 들고 눈물이 났어요.',
  },
  {
    label: '아동학대 무고 위협',
    prompt: '싸우는 아이들을 분리하고 훈육했을 뿐인데, 학부모가 정서적 아동학대로 신고하겠다고 소리치며 협박해 너무 불안합니다.',
  },
  {
    label: '끝없는 행정업무 폭탄',
    prompt: '수업 준비는커녕 공문서 처리와 각종 전시성 사업 기안 때문에 밤 9시까지 야근하다 왔습니다. 교사인지 행정원인지 회의가 듭니다.',
  },
  {
    label: '내일 출근의 두려움',
    prompt: '일요일 저녁만 되면 가슴이 답답하고 숨이 턱 막힙니다. 내일 학교 교문을 들어서는 것이 너무나 무섭습니다.',
  },
  {
    label: '동료/관리자 고립감',
    prompt: '어려운 일을 겪고 있는데 교장, 교감 선생님도 제 편을 들어주지 않고 오히려 조용히 넘어가라며 압박해 외롭습니다.',
  },
];

export const EMOTIONAL_WEATHERS = [
  { id: 'sunny', label: '차분한 햇살', icon: '☀️', desc: '조금씩 숨통이 트이고 있어요' },
  { id: 'cloudy', label: '답답한 먹구름', icon: '☁️', desc: '가슴이 답답하고 멍합니다' },
  { id: 'rainy', label: '서러운 빗줄기', icon: '🌧️', desc: '눈물이 왈칵 쏟아질 것 같아요' },
  { id: 'stormy', label: '위태로운 폭풍우', icon: '⛈️', desc: '감정이 주체되지 않고 극도의 불안을 느껴요' },
  { id: 'snowy', label: '시린 얼어붙음', icon: '❄️', desc: '모든 의욕이 사라지고 탈진했어요' },
];
