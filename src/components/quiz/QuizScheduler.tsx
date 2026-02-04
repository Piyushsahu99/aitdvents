import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizSchedulerProps {
  scheduledStart: Date | null;
  onScheduleChange: (date: Date | null) => void;
  registrationOpen: boolean;
  onRegistrationChange: (open: boolean) => void;
}

export function QuizScheduler({
  scheduledStart,
  onScheduleChange,
  registrationOpen,
  onRegistrationChange,
}: QuizSchedulerProps) {
  const [isScheduled, setIsScheduled] = useState(!!scheduledStart);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    scheduledStart || undefined
  );
  const [selectedHour, setSelectedHour] = useState(
    scheduledStart ? format(scheduledStart, "HH") : "12"
  );
  const [selectedMinute, setSelectedMinute] = useState(
    scheduledStart ? format(scheduledStart, "mm") : "00"
  );

  const handleScheduleToggle = (enabled: boolean) => {
    setIsScheduled(enabled);
    if (!enabled) {
      onScheduleChange(null);
    } else if (selectedDate) {
      updateScheduledDate(selectedDate, selectedHour, selectedMinute);
    }
  };

  const updateScheduledDate = (date: Date, hour: string, minute: string) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
    onScheduleChange(newDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && isScheduled) {
      updateScheduledDate(date, selectedHour, selectedMinute);
    }
  };

  const handleTimeChange = (hour: string, minute: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    if (selectedDate && isScheduled) {
      updateScheduledDate(selectedDate, hour, minute);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className="space-y-4 p-4 rounded-xl border bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Schedule Quiz</p>
            <p className="text-xs text-muted-foreground">Set a start time for your quiz</p>
          </div>
        </div>
        <Switch checked={isScheduled} onCheckedChange={handleScheduleToggle} />
      </div>

      {isScheduled && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <Label>Time</Label>
              <div className="flex gap-2">
                <Select value={selectedHour} onValueChange={(v) => handleTimeChange(v, selectedMinute)}>
                  <SelectTrigger>
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="flex items-center text-lg font-bold">:</span>
                <Select value={selectedMinute} onValueChange={(v) => handleTimeChange(selectedHour, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Display scheduled time */}
          {scheduledStart && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>Scheduled for: {format(scheduledStart, "PPP 'at' h:mm a")}</span>
            </div>
          )}
        </div>
      )}

      {/* Registration toggle */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium">Open Registration</p>
            <p className="text-xs text-muted-foreground">Allow users to register early</p>
          </div>
        </div>
        <Switch checked={registrationOpen} onCheckedChange={onRegistrationChange} />
      </div>
    </div>
  );
}
