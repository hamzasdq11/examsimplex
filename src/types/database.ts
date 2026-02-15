export type AppRole = 'admin' | 'moderator' | 'user';

export interface University {
  id: string;
  name: string;
  full_name: string;
  slug: string;
  location: string;
  logo_url: string | null;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  university_id: string;
  name: string;
  code: string;
  duration_years: number;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  course_id: string;
  number: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  semester_id: string;
  name: string;
  code: string;
  slug: string;
  exam_type: string;
  total_marks: number;
  theory_marks: number;
  internal_marks: number;
  duration: string;
  pattern: string;
  gradient_from: string | null;
  gradient_to: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  number: number;
  name: string;
  weight: number;
  created_at: string;
  updated_at: string;
}

export interface ImportantQuestion {
  id: string;
  subject_id: string;
  unit_id: string | null;
  question: string;
  marks: number;
  frequency: string;
  answer_template: any;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  unit_id: string;
  chapter_title: string;
  points: any[];
  html_content: string | null;
  css_content: string | null;
  js_content: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PYQPaper {
  id: string;
  subject_id: string;
  year: string;
  paper_code: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PYQQuestion {
  id: string;
  pyq_paper_id: string;
  unit_id: string | null;
  question: string;
  marks: number;
  answer: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface MCQQuestion {
  id: string;
  subject_id: string;
  unit_id: string | null;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

export interface UserMCQAttempt {
  id: string;
  user_id: string;
  mcq_question_id: string;
  selected_option: string;
  is_correct: boolean;
  time_taken_seconds: number | null;
  attempted_at: string;
}
