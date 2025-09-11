import React, { ChangeEvent, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  Star,
  Download,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
} from "lucide-react";

type Applicant = {
    id: number;
    name: string;
    email: string;
    phone: string;
    position: string;
    status: string;
    appliedDate: string;
    experience: string;
    education: string;
    location: string;
    rating: number;
    skills: string[];
    resume: string;
    coverLetter: string;
    avatar: string | null;
}

export function Applicants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const applicants = [
    {
      id: 1,
      name: "이지원",
      email: "jiwon.lee@email.com",
      phone: "010-1234-5678",
      position: "시니어 프론트엔드 개발자",
      status: "review",
      appliedDate: "2024-06-08",
      experience: "5년",
      education: "컴퓨터공학과 학사",
      location: "서울 강남구",
      rating: 4,
      skills: ["React", "TypeScript", "Next.js", "Node.js"],
      resume: "resume_이지원.pdf",
      coverLetter: "안녕하세요. 5년 경력의 프론트엔드 개발자 이지원입니다...",
      avatar: null,
    },
    {
      id: 2,
      name: "박개발",
      email: "dev.park@email.com",
      phone: "010-2345-6789",
      position: "UX/UI 디자이너",
      status: "interview",
      appliedDate: "2024-06-07",
      experience: "3년",
      education: "디자인학과 학사",
      location: "서울 서초구",
      rating: 5,
      skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
      resume: "resume_박개발.pdf",
      coverLetter: "사용자 중심의 디자인을 추구하는 UX/UI 디자이너입니다...",
      avatar: null,
    },
    {
      id: 3,
      name: "김코딩",
      email: "coding.kim@email.com",
      phone: "010-3456-7890",
      position: "백엔드 개발자",
      status: "pending",
      appliedDate: "2024-06-09",
      experience: "7년",
      education: "컴퓨터공학과 석사",
      location: "경기 성남시",
      rating: 4,
      skills: ["Java", "Spring Boot", "PostgreSQL", "AWS"],
      resume: "resume_김코딩.pdf",
      coverLetter: "안정적이고 확장 가능한 백엔드 시스템 구축 전문가입니다...",
      avatar: null,
    },
    {
      id: 4,
      name: "정디자인",
      email: "design.jung@email.com",
      phone: "010-4567-8901",
      position: "프로덕트 매니저",
      status: "hired",
      appliedDate: "2024-05-25",
      experience: "6년",
      education: "경영학과 학사",
      location: "서울 마포구",
      rating: 5,
      skills: ["Product Strategy", "Data Analysis", "Agile", "Jira"],
      resume: "resume_정디자인.pdf",
      coverLetter:
        "데이터 기반의 제품 전략을 수립하는 프로덕트 매니저입니다...",
      avatar: null,
    },
    {
      id: 5,
      name: "최신입",
      email: "newbie.choi@email.com",
      phone: "010-5678-9012",
      position: "프론트엔드 개발자",
      status: "rejected",
      appliedDate: "2024-06-06",
      experience: "신입",
      education: "컴퓨터공학과 학사",
      location: "서울 강동구",
      rating: 3,
      skills: ["HTML", "CSS", "JavaScript", "React"],
      resume: "resume_최신입.pdf",
      coverLetter: "열정적인 신입 개발자로서 성장하고 싶습니다...",
      avatar: null,
    },
  ];

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || applicant.status === statusFilter;
    const matchesPosition =
      positionFilter === "all" || applicant.position.includes(positionFilter);
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">검토 대기</Badge>;
      case "review":
        return <Badge className="bg-blue-100 text-blue-800">검토 중</Badge>;
      case "interview":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">면접 예정</Badge>
        );
      case "hired":
        return <Badge className="bg-green-100 text-green-800">채용</Badge>;
      case "rejected":
        return <Badge variant="destructive">불합격</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">지원자 관리</h1>
        <p className="text-muted-foreground">
          지원자를 검토하고 면접을 진행하세요
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">12</div>
              <p className="text-sm text-muted-foreground">검토 대기</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <p className="text-sm text-muted-foreground">검토 중</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">15</div>
              <p className="text-sm text-muted-foreground">면접 예정</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <p className="text-sm text-muted-foreground">채용</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">45</div>
              <p className="text-sm text-muted-foreground">불합격</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="이름, 직무, 이메일로 검색..."
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
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="pending">검토 대기</SelectItem>
                <SelectItem value="review">검토 중</SelectItem>
                <SelectItem value="interview">면접 예정</SelectItem>
                <SelectItem value="hired">채용</SelectItem>
                <SelectItem value="rejected">불합격</SelectItem>
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="직무" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 직무</SelectItem>
                <SelectItem value="개발자">개발자</SelectItem>
                <SelectItem value="디자이너">디자이너</SelectItem>
                <SelectItem value="매니저">매니저</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      <div className="space-y-4">
        {filteredApplicants.map((applicant) => (
          <Card key={applicant.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{applicant.name}</h3>
                      {getStatusBadge(applicant.status)}
                      <div className="flex">
                        {renderStars(applicant.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {applicant.position}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {applicant.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {applicant.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {applicant.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        지원일: {applicant.appliedDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplicant(applicant)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{applicant.name} 상세 정보</DialogTitle>
                        <DialogDescription>
                          지원자의 상세한 정보를 확인하세요
                        </DialogDescription>
                      </DialogHeader>
                      {selectedApplicant && (
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">개요</TabsTrigger>
                            <TabsTrigger value="resume">이력서</TabsTrigger>
                            <TabsTrigger value="evaluation">평가</TabsTrigger>
                          </TabsList>
                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">
                                    기본 정보
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      이름:
                                    </span>
                                    <span>{selectedApplicant.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      이메일:
                                    </span>
                                    <span>{selectedApplicant.email}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      전화:
                                    </span>
                                    <span>{selectedApplicant.phone}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      위치:
                                    </span>
                                    <span>{selectedApplicant.location}</span>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">
                                    경력 정보
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      경력:
                                    </span>
                                    <span>{selectedApplicant.experience}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      학력:
                                    </span>
                                    <span>{selectedApplicant.education}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      지원일:
                                    </span>
                                    <span>{selectedApplicant.appliedDate}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      평점:
                                    </span>
                                    <div className="flex">
                                      {renderStars(selectedApplicant.rating)}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  기술 스택
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {selectedApplicant.skills.map(
                                    (skill: string, index: number) => (
                                      <Badge key={index} variant="secondary">
                                        {skill}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          <TabsContent value="resume" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  자기소개서
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm leading-relaxed">
                                  {selectedApplicant.coverLetter}
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  첨부 파일
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    <span>{selectedApplicant.resume}</span>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    다운로드
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          <TabsContent value="evaluation" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  평가 및 노트
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    상태 변경
                                  </label>
                                  <Select
                                    defaultValue={selectedApplicant.status}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">
                                        검토 대기
                                      </SelectItem>
                                      <SelectItem value="review">
                                        검토 중
                                      </SelectItem>
                                      <SelectItem value="interview">
                                        면접 예정
                                      </SelectItem>
                                      <SelectItem value="hired">
                                        채용
                                      </SelectItem>
                                      <SelectItem value="rejected">
                                        불합격
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    평가 노트
                                  </label>
                                  <textarea
                                    className="w-full mt-1 p-2 border rounded-md"
                                    rows={4}
                                    placeholder="지원자에 대한 평가나 노트를 작성하세요..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button>저장</Button>
                                  <Button variant="outline">
                                    면접 일정 잡기
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplicants.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">지원자가 없습니다</h3>
              <p className="text-muted-foreground">
                검색 조건을 변경하거나 새로운 채용 공고를 게시해보세요
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
