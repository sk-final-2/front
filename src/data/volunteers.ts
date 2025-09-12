export const jobs = [
  {
    id: 1,
    title: "시니어 프론트엔드 개발자",
    department: "개발팀",
    location: "서울 강남구",
    type: "정규직",
    salary: "4000-6000만원",
    applicants: 45,
    status: "active",
    posted: "2025-09-11",
    deadline: "2025-10-01",
    views: 14,
  },
  {
    id: 2,
    title: "UX/UI 디자이너",
    department: "디자인팀",
    location: "서울 강남구",
    type: "정규직",
    salary: "3500-5000만원",
    applicants: 32,
    status: "active",
    posted: "2025-08-18",
    deadline: "2025-10-01",
    views: 92,
  },
  {
    id: 3,
    title: "백엔드 개발자",
    department: "개발팀",
    location: "서울 강남구",
    type: "정규직",
    salary: "4500-6500만원",
    applicants: 28,
    status: "draft",
    posted: "2025-08-27",
    deadline: "2025-09-24",
    views: 10,
  },
  {
    id: 4,
    title: "프로덕트 매니저",
    department: "기획팀",
    location: "서울 강남구",
    type: "정규직",
    salary: "5000-7000만원",
    applicants: 51,
    status: "active",
    posted: "2025-08-30",
    deadline: "2025-10-01",
    views: 56,
  },
  {
    id: 5,
    title: "데이터 분석가",
    department: "개발팀",
    location: "서울 강남구",
    type: "계약직",
    salary: "3000-4500만원",
    applicants: 23,
    status: "closed",
    posted: "2025-08-13",
    deadline: "2025-09-01",
    views: 76,
  },
];

export const monthlyApplications = [
  { month: "3월", applications: 65 },
  { month: "4월", applications: 78 },
  { month: "5월", applications: 95 },
  { month: "6월", applications: 102 },
  { month: "7월", applications: 89 },
  { month: "8월", applications: 156 },
];

// 부서별 지원자
export const departmentData = [
  { name: "개발팀", value: 45, fill: "var(--pie-chart-2)" },
  { name: "디자인팀", value: 25, fill: "var(--pie-chart-3)" },
  { name: "마케팅팀", value: 20, fill: "var(--pie-chart-4)" },
  { name: "영업팀", value: 10, fill: "var(--pie-chart-5)" },
];

export const recentJobs = [
  {
    id: 1,
    title: "시니어 프론트엔드 개발자",
    applicants: 45,
    status: "active",
    posted: "2024-06-01",
  },
  {
    id: 2,
    title: "UX/UI 디자이너",
    applicants: 32,
    status: "active",
    posted: "2024-06-03",
  },
  {
    id: 3,
    title: "백엔드 개발자",
    applicants: 28,
    status: "draft",
    posted: "2024-06-05",
  },
  {
    id: 4,
    title: "프로덕트 매니저",
    applicants: 51,
    status: "active",
    posted: "2024-05-28",
  },
];

export const upcomingInterviews = [
  {
    id: 1,
    candidate: "이지원",
    position: "프론트엔드 개발자",
    time: "14:00",
    date: "오늘",
  },
  {
    id: 2,
    candidate: "박개발",
    position: "UX 디자이너",
    time: "16:30",
    date: "오늘",
  },
  {
    id: 3,
    candidate: "김코딩",
    position: "백엔드 개발자",
    time: "10:00",
    date: "내일",
  },
  {
    id: 4,
    candidate: "정디자인",
    position: "프로덕트 매니저",
    time: "15:00",
    date: "내일",
  },
];

export const applicationTrends = [
  { month: "3월", applications: 65, hired: 8 },
  { month: "4월", applications: 78, hired: 12 },
  { month: "5월", applications: 95, hired: 15 },
  { month: "6월", applications: 102, hired: 18 },
  { month: "7월", applications: 89, hired: 14 },
  { month: "8월", applications: 156, hired: 23 },
];

export const hiringFunnel = [
  { stage: "지원", count: 156, percentage: 100 },
  { stage: "서류 통과", count: 89, percentage: 57 },
  { stage: "1차 면접", count: 56, percentage: 36 },
  { stage: "2차 면접", count: 34, percentage: 22 },
  { stage: "최종 합격", count: 23, percentage: 15 },
];

export const departmentPerformance = [
  { department: "개발팀", applications: 68, hired: 12, rate: 17.6 },
  { department: "디자인팀", applications: 34, hired: 6, rate: 17.6 },
  { department: "기획팀", applications: 28, hired: 3, rate: 10.7 },
  { department: "마케팅팀", applications: 26, hired: 2, rate: 7.7 },
];

export const sourceAnalysis = [
  { name: "채용 사이트", value: 45, color: "#8884d8" },
  { name: "추천", value: 28, color: "#82ca9d" },
  { name: "링크드인", value: 18, color: "#ffc658" },
  { name: "직접 지원", value: 9, color: "#ff7300" },
];

export const timeToHire = [
  { position: "프론트엔드", days: 28 },
  { position: "백엔드", days: 35 },
  { position: "디자이너", days: 22 },
  { position: "기획자", days: 31 },
  { position: "마케터", days: 26 },
];
