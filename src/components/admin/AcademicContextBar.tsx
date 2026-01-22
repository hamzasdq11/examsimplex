import { X, Building2, GraduationCap, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminContext } from '@/contexts/AdminContext';
import { Skeleton } from '@/components/ui/skeleton';

export function AcademicContextBar() {
  const {
    universities,
    filteredCourses,
    filteredSemesters,
    selectedUniversityId,
    selectedCourseId,
    selectedSemesterId,
    setUniversity,
    setCourse,
    setSemester,
    clearContext,
    loading,
    isContextComplete,
  } = useAdminContext();

  if (loading) {
    return (
      <div className="border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    );
  }

  const hasAnySelection = selectedUniversityId || selectedCourseId || selectedSemesterId;

  return (
    <div className="border-b bg-muted/30 px-4 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* University Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select
            value={selectedUniversityId || ""}
            onValueChange={(value) => setUniversity(value || null)}
          >
            <SelectTrigger className="w-[180px] h-8 bg-background">
              <SelectValue placeholder="Select University" />
            </SelectTrigger>
            <SelectContent>
              {universities.map((uni) => (
                <SelectItem key={uni.id} value={uni.id}>
                  {uni.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Course Selector */}
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select
            value={selectedCourseId || ""}
            onValueChange={(value) => setCourse(value || null)}
            disabled={!selectedUniversityId}
          >
            <SelectTrigger className="w-[180px] h-8 bg-background">
              <SelectValue placeholder={selectedUniversityId ? "Select Course" : "Select University first"} />
            </SelectTrigger>
            <SelectContent>
              {filteredCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select
            value={selectedSemesterId || ""}
            onValueChange={(value) => setSemester(value || null)}
            disabled={!selectedCourseId}
          >
            <SelectTrigger className="w-[140px] h-8 bg-background">
              <SelectValue placeholder={selectedCourseId ? "Select Semester" : "Select Course first"} />
            </SelectTrigger>
            <SelectContent>
              {filteredSemesters.map((sem) => (
                <SelectItem key={sem.id} value={sem.id}>
                  {sem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Button */}
        {hasAnySelection && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={clearContext}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear context</span>
          </Button>
        )}

        {/* Context Status */}
        {!isContextComplete && hasAnySelection && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 ml-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Complete selection for full access</span>
          </div>
        )}
      </div>
    </div>
  );
}
