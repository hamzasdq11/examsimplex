import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { University, Course, Semester } from '@/types/database';

interface AdminContextType {
  // Data
  universities: University[];
  courses: Course[];
  semesters: Semester[];
  loading: boolean;
  
  // Selected values
  selectedUniversityId: string | null;
  selectedCourseId: string | null;
  selectedSemesterId: string | null;
  
  // Computed selected objects
  selectedUniversity: University | null;
  selectedCourse: Course | null;
  selectedSemester: Semester | null;
  
  // Filtered data based on selection
  filteredCourses: Course[];
  filteredSemesters: Semester[];
  
  // Actions
  setUniversity: (id: string | null) => void;
  setCourse: (id: string | null) => void;
  setSemester: (id: string | null) => void;
  clearContext: () => void;
  refreshData: () => Promise<void>;
  
  // Context completeness
  isContextComplete: boolean;
  hasUniversity: boolean;
  hasCourse: boolean;
}

const STORAGE_KEY = 'admin-academic-context';

interface StoredContext {
  universityId: string | null;
  courseId: string | null;
  semesterId: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminContextProvider({ children }: { children: ReactNode }) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);

  // Load stored context on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StoredContext = JSON.parse(stored);
        setSelectedUniversityId(parsed.universityId);
        setSelectedCourseId(parsed.courseId);
        setSelectedSemesterId(parsed.semesterId);
      } catch (e) {
        console.error('Failed to parse stored admin context:', e);
      }
    }
  }, []);

  // Save context to localStorage whenever it changes
  useEffect(() => {
    const context: StoredContext = {
      universityId: selectedUniversityId,
      courseId: selectedCourseId,
      semesterId: selectedSemesterId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  }, [selectedUniversityId, selectedCourseId, selectedSemesterId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: uniData },
        { data: courseData },
        { data: semData },
      ] = await Promise.all([
        supabase.from('universities').select('*').order('name'),
        supabase.from('courses').select('*').order('name'),
        supabase.from('semesters').select('*').order('number'),
      ]);

      setUniversities(uniData || []);
      setCourses(courseData || []);
      setSemesters(semData || []);
    } catch (error) {
      console.error('Error fetching admin context data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Validate stored selections against fetched data
  // Only run validation when ALL data is loaded to prevent race conditions
  useEffect(() => {
    if (!loading && universities.length > 0 && courses.length > 0 && semesters.length > 0) {
      // Validate university
      if (selectedUniversityId && !universities.find(u => u.id === selectedUniversityId)) {
        setSelectedUniversityId(null);
        setSelectedCourseId(null);
        setSelectedSemesterId(null);
        return;
      }
      
      // Validate course belongs to selected university
      if (selectedCourseId) {
        const course = courses.find(c => c.id === selectedCourseId);
        if (!course || course.university_id !== selectedUniversityId) {
          setSelectedCourseId(null);
          setSelectedSemesterId(null);
          return;
        }
      }
      
      // Validate semester belongs to selected course
      if (selectedSemesterId) {
        const semester = semesters.find(s => s.id === selectedSemesterId);
        if (!semester || semester.course_id !== selectedCourseId) {
          setSelectedSemesterId(null);
        }
      }
    }
  }, [loading, universities, courses, semesters, selectedUniversityId, selectedCourseId, selectedSemesterId]);
  
  // Handle case when no data exists
  useEffect(() => {
    if (!loading && universities.length === 0 && selectedUniversityId) {
      setSelectedUniversityId(null);
      setSelectedCourseId(null);
      setSelectedSemesterId(null);
    }
  }, [loading, universities.length, selectedUniversityId]);

  // Computed values
  const selectedUniversity = universities.find(u => u.id === selectedUniversityId) || null;
  const selectedCourse = courses.find(c => c.id === selectedCourseId) || null;
  const selectedSemester = semesters.find(s => s.id === selectedSemesterId) || null;
  
  const filteredCourses = selectedUniversityId 
    ? courses.filter(c => c.university_id === selectedUniversityId) 
    : [];
    
  const filteredSemesters = selectedCourseId 
    ? semesters.filter(s => s.course_id === selectedCourseId) 
    : [];

  // Actions
  const setUniversity = useCallback((id: string | null) => {
    setSelectedUniversityId(id);
    // Clear dependent selections
    setSelectedCourseId(null);
    setSelectedSemesterId(null);
  }, []);

  const setCourse = useCallback((id: string | null) => {
    setSelectedCourseId(id);
    // Clear dependent selection
    setSelectedSemesterId(null);
  }, []);

  const setSemester = useCallback((id: string | null) => {
    setSelectedSemesterId(id);
  }, []);

  const clearContext = useCallback(() => {
    setSelectedUniversityId(null);
    setSelectedCourseId(null);
    setSelectedSemesterId(null);
  }, []);

  const value: AdminContextType = {
    universities,
    courses,
    semesters,
    loading,
    selectedUniversityId,
    selectedCourseId,
    selectedSemesterId,
    selectedUniversity,
    selectedCourse,
    selectedSemester,
    filteredCourses,
    filteredSemesters,
    setUniversity,
    setCourse,
    setSemester,
    clearContext,
    refreshData: fetchData,
    isContextComplete: !!selectedUniversityId && !!selectedCourseId && !!selectedSemesterId,
    hasUniversity: !!selectedUniversityId,
    hasCourse: !!selectedCourseId,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminContextProvider');
  }
  return context;
}
