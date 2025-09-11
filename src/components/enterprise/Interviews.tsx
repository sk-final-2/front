import { ChangeEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  User,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function Interviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewInterviewDialogOpen, setIsNewInterviewDialogOpen] =
    useState(false);

  const interviews = [
    {
      id: 1,
      candidate: "이지원",
      position: "시니어 프론트엔드 개발자",
      interviewer: "김개발",
      date: "2024-06-10",
      time: "14:00",
      duration: "60분",
      type: "video",
      location: "Zoom",
      status: "scheduled",
      notes: "기술 면접 + 문화적 적합성 평가",
      round: 1,
    },
    {
      id: 2,
      candidate: "박개발",
      position: "UX/UI 디자이너",
      interviewer: "이디자인",
      date: "2024-06-10",
      time: "16:30",
      duration: "45분",
      type: "onsite",
      location: "회의실 A",
      status: "scheduled",
      notes: "포트폴리오 리뷰 + 디자인 사고 과정",
      round: 1,
    },
    {
      id: 3,
      candidate: "김코딩",
      position: "백엔드 개발자",
      interviewer: "박서버",
      date: "2024-06-11",
      time: "10:00",
      duration: "90분",
      type: "onsite",
      location: "회의실 B",
      status: "scheduled",
      notes: "시스템 설계 + 코딩 테스트",
      round: 2,
    },
    {
      id: 4,
      candidate: "정기획",
      position: "프로덕트 매니저",
      interviewer: "최매니저",
      date: "2024-06-09",
      time: "15:00",
      duration: "60분",
      type: "video",
      location: "Google Meet",
      status: "completed",
      notes: "제품 전략 + 로드맵 수립 능력 평가",
      round: 2,
      feedback: "매우 우수한 제품 이해도와 전략적 사고력을 보여줌",
    },
    {
      id: 5,
      candidate: "최신입",
      position: "프론트엔드 개발자",
      interviewer: "김개발",
      date: "2024-06-08",
      time: "11:00",
      duration: "45분",
      type: "phone",
      location: "전화",
      status: "completed",
      notes: "기초 기술 지식 확인",
      round: 1,
      feedback: "기본기는 있으나 실무 경험 부족",
    },
    {
      id: 6,
      candidate: "강지원",
      position: "데이터 분석가",
      interviewer: "데이터팀",
      date: "2024-06-07",
      time: "14:00",
      duration: "60분",
      type: "onsite",
      location: "회의실 C",
      status: "cancelled",
      notes: "지원자 개인 사정으로 취소",
      round: 1,
    },
  ];

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.interviewer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">예정</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">완료</Badge>;
      case "cancelled":
        return <Badge variant="destructive">취소</Badge>;
      case "no-show":
        return <Badge variant="outline">불참</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "onsite":
        return <MapPin className="w-4 h-4" />;
      case "phone":
        return <Clock className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const todayInterviews = interviews.filter(
    (interview) =>
      interview.date === "2024-06-10" && interview.status === "scheduled",
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">면접 일정</h1>
          <p className="text-muted-foreground">
            면접 일정을 관리하고 피드백을 기록하세요
          </p>
        </div>
        <Dialog
          open={isNewInterviewDialogOpen}
          onOpenChange={setIsNewInterviewDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              면접 일정 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 면접 일정 등록</DialogTitle>
              <DialogDescription>
                새로운 면접 일정을 등록하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidate">지원자</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="지원자 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate1">이지원</SelectItem>
                      <SelectItem value="candidate2">박개발</SelectItem>
                      <SelectItem value="candidate3">김코딩</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interviewer">면접관</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="면접관 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interviewer1">김개발</SelectItem>
                      <SelectItem value="interviewer2">이디자인</SelectItem>
                      <SelectItem value="interviewer3">박서버</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">면접 날짜</Label>
                  <Input type="date" id="date" />
                </div>
                <div>
                  <Label htmlFor="time">면접 시간</Label>
                  <Input type="time" id="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">소요 시간</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="시간 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30분</SelectItem>
                      <SelectItem value="45">45분</SelectItem>
                      <SelectItem value="60">60분</SelectItem>
                      <SelectItem value="90">90분</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">면접 방식</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="방식 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">대면</SelectItem>
                      <SelectItem value="video">화상</SelectItem>
                      <SelectItem value="phone">전화</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="location">장소/링크</Label>
                <Input
                  id="location"
                  placeholder="회의실명 또는 화상회의 링크"
                />
              </div>
              <div>
                <Label htmlFor="notes">면접 노트</Label>
                <Textarea
                  id="notes"
                  placeholder="면접 내용이나 평가 기준을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewInterviewDialogOpen(false)}
                >
                  취소
                </Button>
                <Button onClick={() => setIsNewInterviewDialogOpen(false)}>
                  일정 등록
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Interviews */}
      {todayInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>오늘의 면접 ({todayInterviews.length}건)</CardTitle>
            <CardDescription>오늘 예정된 면접 일정입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(interview.type)}
                    <div>
                      <p className="font-medium">{interview.candidate}</p>
                      <p className="text-sm text-muted-foreground">
                        {interview.time} • {interview.duration} •{" "}
                        {interview.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      완료
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="지원자명, 직무, 면접관으로 검색..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="scheduled">예정</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="cancelled">취소</SelectItem>
                <SelectItem value="no-show">불참</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Interviews List */}
      <div className="space-y-4">
        {filteredInterviews.map((interview) => (
          <Card key={interview.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                    {getTypeIcon(interview.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{interview.candidate}</h3>
                      {getStatusBadge(interview.status)}
                      <Badge variant="outline">{interview.round}차 면접</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {interview.position}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {interview.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {interview.time} ({interview.duration})
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {interview.interviewer}
                      </div>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(interview.type)}
                        {interview.location}
                      </div>
                    </div>
                    {interview.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        메모: {interview.notes}
                      </p>
                    )}
                    {interview.feedback && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                        <strong>피드백:</strong> {interview.feedback}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {interview.status === "scheduled" && (
                    <>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  {interview.status !== "completed" && (
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInterviews.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">면접 일정이 없습니다</h3>
              <p className="text-muted-foreground">
                새로운 면접 일정을 등록하거나 검색 조건을 변경해보세요
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
