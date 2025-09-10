import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, User, Calendar } from "lucide-react";

type InterviewInfoType = {
  createdAt: string | null;
  job: string | null;
  career: string | null;
  type: string | null;
  level: string | null;
  language: string | null;
};

const Item = ({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  tone?: "primary" | "success" | "warning";
}) => {
  const toneBg =
    tone === "success"
      ? "bg-emerald-50 text-emerald-600"
      : tone === "warning"
      ? "bg-amber-50 text-amber-600"
      : "bg-blue-50 text-blue-600";
  return (
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${toneBg}`}>{icon}</div>
      <div className="ml-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? "-"}</p>
      </div>
    </div>
  );
};

const InterviewInfoComponent = ({
  createdAt,
  job,
  career,
  type,
  level,
  language,
}: InterviewInfoType) => {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">면접 정보</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Item
          icon={<Briefcase className="w-5 h-5" />}
          label="지원 직무"
          value={job}
          tone="primary"
        />
        <Item
          icon={<User className="w-5 h-5" />}
          label="면접 유형"
          value={type}
          tone="success"
        />
        <Item
          icon={<Calendar className="w-5 h-5" />}
          label="면접 일시"
          value={createdAt}
          tone="warning"
        />
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">경력</p>
            <p className="text-sm font-medium">{career ?? "-"}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">난이도</p>
            <p className="text-sm font-medium">{level ?? "-"}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">언어</p>
            <p className="text-sm font-medium">{language ?? "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewInfoComponent;
