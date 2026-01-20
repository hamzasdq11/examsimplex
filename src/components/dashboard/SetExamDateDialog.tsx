import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarDays } from 'lucide-react';

interface SetExamDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date, examType: string) => void;
  initialDate?: Date;
  initialType?: string;
}

export function SetExamDateDialog({
  open,
  onOpenChange,
  onConfirm,
  initialDate,
  initialType = 'end_sem'
}: SetExamDateDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [examType, setExamType] = useState(initialType);

  const handleConfirm = () => {
    if (selectedDate) {
      onConfirm(selectedDate, examType);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Set Your Exam Date
          </DialogTitle>
          <DialogDescription>
            We'll personalize your study plan based on your exam timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Exam Type */}
          <div className="space-y-2">
            <Label>Exam Type</Label>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger>
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mid_sem">Mid Semester</SelectItem>
                <SelectItem value="end_sem">End Semester</SelectItem>
                <SelectItem value="viva">Viva / Practical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Exam Start Date</Label>
            <div className="flex justify-center border rounded-lg p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </div>
            {selectedDate && (
              <p className="text-sm text-muted-foreground text-center">
                Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedDate}>
            Save Exam Date
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
