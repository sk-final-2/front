import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

export function Analytics() {
  const applicationTrends = [
    { month: "1월", applications: 65, hired: 8 },
    { month: "2월", applications: 78, hired: 12 },
    { month: "3월", applications: 95, hired: 15 },
    { month: "4월", applications: 102, hired: 18 },
    { month: "5월", applications: 89, hired: 14 },
    { month: "6월", applications: 156, hired: 23 },
  ];

  const hiringFunnel = [
    { stage: "지원", count: 156, percentage: 100 },
    { stage: "서류 통과", count: 89, percentage: 57 },
    { stage: "1차 면접", count: 56, percentage: 36 },
    { stage: "2차 면접", count: 34, percentage: 22 },
    { stage: "최종 합격", count: 23, percentage: 15 },
  ];

  const departmentPerformance = [
    { department: "개발팀", applications: 68, hired: 12, rate: 17.6 },
    { department: "디자인팀", applications: 34, hired: 6, rate: 17.6 },
    { department: "기획팀", applications: 28, hired: 3, rate: 10.7 },
    { department: "마케팅팀", applications: 26, hired: 2, rate: 7.7 },
  ];

  const sourceAnalysis = [
    { name: "채용 사이트", value: 45, color: "#8884d8" },
    { name: "추천", value: 28, color: "#82ca9d" },
    { name: "링크드인", value: 18, color: "#ffc658" },
    { name: "직접 지원", value: 9, color: "#ff7300" },
  ];

  const timeToHire = [
    { position: "프론트엔드", days: 28 },
    { position: "백엔드", days: 35 },
    { position: "디자이너", days: 22 },
    { position: "기획자", days: 31 },
    { position: "마케터", days: 26 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">채용 분석</h1>
          <p className="text-muted-foreground">
            채용 데이터를 분석하고 인사이트를 확인하세요
          </p>
        </div>
        <Select defaultValue="6months">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">최근 1개월</SelectItem>
            <SelectItem value="3months">최근 3개월</SelectItem>
            <SelectItem value="6months">최근 6개월</SelectItem>
            <SelectItem value="1year">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지원자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">585</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15.2% 전월 대비
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">합격률</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.2%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.1% 전월 대비
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              평균 채용 기간
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.5일</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingDown className="w-3 h-3 mr-1" />
              +3.2일 전월 대비
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 채용</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23명</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +9명 전월 대비
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>지원자 및 채용 추이</CardTitle>
            <CardDescription>월별 지원자 수와 채용 완료자 수</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="지원자"
                />
                <Area
                  type="monotone"
                  dataKey="hired"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.8}
                  name="채용 완료"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>지원자 유입 경로</CardTitle>
            <CardDescription>채널별 지원자 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hiring Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>채용 깔때기 분석</CardTitle>
          <CardDescription>각 단계별 전환율 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hiringFunnel.map((stage) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {stage.count}명
                    </span>
                    <Badge variant="outline">{stage.percentage}%</Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>부서별 채용 성과</CardTitle>
            <CardDescription>부서별 지원자 수와 합격률</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance.map((dept) => (
                <div
                  key={dept.department}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{dept.department}</p>
                    <p className="text-sm text-muted-foreground">
                      지원자 {dept.applications}명 • 채용 {dept.hired}명
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{dept.rate}%</div>
                    <p className="text-xs text-muted-foreground">합격률</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>직무별 평균 채용 기간</CardTitle>
            <CardDescription>직무별 채용 완료까지 소요 일수</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeToHire} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="position" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="days" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>주요 인사이트</CardTitle>
          <CardDescription>채용 데이터 기반 개선 제안</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800">긍정적 트렌드</h4>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 6월 지원자 수 전월 대비 75% 증가</li>
                <li>• 채용 사이트를 통한 양질의 지원자 유입 증가</li>
                <li>• 디자인팀 합격률 업계 평균 대비 높음</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">개선 필요 영역</h4>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 백엔드 개발자 채용 기간 35일로 과도하게 길음</li>
                <li>• 마케팅팀 합격률 7.7%로 낮음</li>
                <li>• 직접 지원 비중 9%로 채널 다양화 필요</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
