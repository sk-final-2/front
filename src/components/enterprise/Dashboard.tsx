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
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
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
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지원자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0%</span> 지난달 대비
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 공고</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">0개</span> 새 공고
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 면접</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">0개</span> 대기중
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">합격률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0%</span> 지난달 대비
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
          <CardContent>{/** 원(비율) 차트 */}</CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>부서별 지원자 분포</CardTitle>
            <CardDescription>현재 활성 공고 기준</CardDescription>
          </CardHeader>
          <CardContent>{/** 파이 차트 */}</CardContent>
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
            <Button variant="outline" size="sm">
              전체 보기
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>다가오는 면접</CardTitle>
              <CardDescription>오늘과 내일 일정</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              일정 보기
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              
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
            >
              <Briefcase className="w-6 h-6" />
              <span>새 공고 작성</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2 cursor-pointer"
            >
              <Calendar className="w-6 h-6" />
              <span>면접 일정 등록</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2 cursor-pointer"
            >
              <Users className="w-6 h-6" />
              <span>지원자 검토</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2 cursor-pointer"
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
