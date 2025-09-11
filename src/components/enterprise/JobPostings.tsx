import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Filter,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextareaAutosize from "react-textarea-autosize";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { jobs } from "@/data/volunteers";
import { Calendar28 } from "./Calendar";

export default function JobPostings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">활성</Badge>;
      case "draft":
        return <Badge variant="secondary">임시저장</Badge>;
      case "closed":
        return <Badge variant="destructive">마감</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">채용 공고</h1>
          <p className="text-muted-foreground">
            채용 공고를 관리하고 지원자를 확인하세요
          </p>
        </div>
        <Dialog open={isNewJobDialogOpen} onOpenChange={setIsNewJobDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />새 공고 작성
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] border-border overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 채용 공고 작성</DialogTitle>
              <DialogDescription>
                새로운 채용 공고를 작성하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job-title">직무명</Label>
                  <Input
                    id="job-title"
                    placeholder="예: 시니어 프론트엔드 개발자"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="department" className="mb-2">
                    부서
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="부서 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">개발팀</SelectItem>
                      <SelectItem value="design">디자인팀</SelectItem>
                      <SelectItem value="planning">기획팀</SelectItem>
                      <SelectItem value="marketing">마케팅팀</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">근무지</Label>
                  <Input
                    id="location"
                    placeholder="예: 서울 강남구"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="mb-2">
                    고용형태
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="고용형태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulltime">정규직</SelectItem>
                      <SelectItem value="contract">계약직</SelectItem>
                      <SelectItem value="intern">인턴</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-row gap-4">
                <div>
                  <Label htmlFor="salary">연봉</Label>
                  <Input
                    id="salary"
                    placeholder="예: 4000-6000만원"
                    className="mt-2"
                  />
                </div>
                {/** 마감 일자 */}
                <div>
                  <Calendar28 />
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="mb-2">
                  직무 설명
                </Label>
                <TextareaAutosize
                  id="description"
                  placeholder="직무에 대한 상세한 설명을 입력하세요"
                  minRows={3} // 최소 높이 (4줄)
                  maxRows={10} // 최대 높이 (10줄), 이후에는 내부 스크롤 생성
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <Label htmlFor="requirements" className="mb-2">
                  자격 요건
                </Label>
                <TextareaAutosize
                  id="requirements"
                  placeholder="필요한 자격 요건을 입력하세요"
                  minRows={3} // 최소 높이
                  maxRows={8} // 최대 높이
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewJobDialogOpen(false)}
                >
                  취소
                </Button>
                <Button variant="outline">임시저장</Button>
                <Button onClick={() => setIsNewJobDialogOpen(false)}>
                  공고 게시
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="직무명, 부서로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="draft">임시저장</SelectItem>
                <SelectItem value="closed">마감</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.department}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      마감: {job.deadline}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{job.applicants}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">지원자</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{job.views}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">조회수</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">
                다른 검색어를 시도하거나 필터를 변경해보세요
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
