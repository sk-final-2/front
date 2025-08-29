import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일`;
}

export default function BirthCalendar({
  onChangeBirth,
}: {
  onChangeBirth: (birth: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-3 flex-1">
      <Label htmlFor="date" className="px-1">
        생년월일
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {date ? formatDate(date) : "생년월일 선택"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(selectedDate) => {
              if (selectedDate) {
                setDate(selectedDate);
                const isoDate = new Date(
                  selectedDate.getTime() -
                    selectedDate.getTimezoneOffset() * 60000,
                )
                  .toISOString()
                  .split("T")[0];
                onChangeBirth(isoDate);
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
