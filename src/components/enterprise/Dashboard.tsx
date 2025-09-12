import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  Calendar,
  Eye,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  departmentData,
  monthlyApplications,
  recentJobs,
  upcomingInterviews,
} from "@/data/volunteers";
import {
  Bar,
  CartesianGrid,
  XAxis,
  BarChart,
  PieChart,
  Pie,
  LabelList,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  month: {
    label: "Month",
    color: "var(--chart-1)",
  },
  개발팀: {
    label: "개발팀",
    color: "var(--accent)",
  },
  디자인팀: {
    label: "디자인팀",
    color: "var(--accent)",
  },
  마케팅팀: {
    label: "마케팅팀",
    color: "var(--accent)",
  },
  영업팀: {
    label: "영업팀",
    color: "var(--accent)",
  },
} satisfies ChartConfig;

export default function Dashboard({
  handleTabChange,
}: {
  handleTabChange: (tab: string) => void;
}) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">채용 현황을 한눈에 확인하세요</p>
        </div>
        <span className="text-base">SK 쉴더스</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:border-ring"
          onClick={() => handleTabChange("applicants")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지원자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> 지난달 대비
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-ring"
          onClick={() => handleTabChange("jobs")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 공고</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">3개</span> 새 공고
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-ring"
          onClick={() => handleTabChange("interviews")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 면접</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">2개</span> 대기중
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-ring"
          onClick={() => handleTabChange("analytics")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">합격률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3%</span> 지난달 대비
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>월별 지원자 현황</CardTitle>
            <CardDescription>최근 6개월 지원자 수</CardDescription>
          </CardHeader>
          <CardContent>
            {/** 바 차트 */}
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={monthlyApplications}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideIndicator hideLabel />}
                />
                <Bar
                  dataKey="applications"
                  fill="var(--color-month)"
                  radius={8}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>부서별 지원자 분포</CardTitle>
            <CardDescription>현재 활성 공고 기준</CardDescription>
          </CardHeader>
          <CardContent>
            {/** 파이 차트 */}
            <ChartContainer config={chartConfig}>
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={departmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                >
                  <LabelList
                    dataKey="name"
                    className="fill-accent-foreground font-bold"
                    stroke="none"
                    fontSize={12}
                    color="#000000"
                    formatter={(value: keyof typeof chartConfig) =>
                      chartConfig[value]?.label
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 최근 채용 공고 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 채용 공고</CardTitle>
              <CardDescription>현재 진행중인 채용</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleTabChange("jobs")}>
              전체 보기
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      지원자 {job.applicants}명
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        job.status === "active" ? "default" : "secondary"
                      }
                    >
                      {job.status === "active" ? "활성" : "임시저장"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>다가오는 면접</CardTitle>
              <CardDescription>오늘과 내일 일정</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTabChange("interviews")}
            >
              일정 보기
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{interview.candidate}</p>
                    <p className="text-sm text-muted-foreground">
                      {interview.position}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{interview.time}</p>
                    <p className="text-xs text-muted-foreground">
                      {interview.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
          <CardDescription>자주 사용하는 기능들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2 cursor-pointer"
              onClick={() => handleTabChange("jobs")}
            >
              <Briefcase className="w-6 h-6" />
              <span>새 공고 작성</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2 cursor-pointer"
              onClick={() => handleTabChange("interviews")}
            >
              <Calendar className="w-6 h-6" />
              <span>면접 일정 등록</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2 cursor-pointer"
              onClick={() => handleTabChange("applicants")}
            >
              <Users className="w-6 h-6" />
              <span>지원자 검토</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2 cursor-pointer"
              onClick={() => handleTabChange("applicants")}
            >
              <MessageSquare className="w-6 h-6" />
              <span>메시지 보내기</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
