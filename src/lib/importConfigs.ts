export interface ImportField {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
}

export interface ImportConfig {
  tableName: string;
  displayName: string;
  fields: ImportField[];
  upsertKeys: string[];
  sampleData: Record<string, any>;
  referenceFields?: { field: string; lookupTable: string; lookupField: string }[];
}

export const importConfigs: Record<string, ImportConfig> = {
  universities: {
    tableName: 'universities',
    displayName: 'Universities',
    fields: [
      { name: 'name', required: true, type: 'string', description: 'Short name (e.g., AKTU)' },
      { name: 'full_name', required: true, type: 'string', description: 'Full university name' },
      { name: 'slug', required: true, type: 'string', description: 'URL-friendly identifier' },
      { name: 'location', required: true, type: 'string', description: 'City, State' },
      { name: 'type', required: false, type: 'string', description: 'State/Central/Private/Deemed' },
      { name: 'logo_url', required: false, type: 'string', description: 'Logo image URL' },
    ],
    upsertKeys: ['slug'],
    sampleData: {
      name: 'AKTU',
      full_name: 'Dr. A.P.J. Abdul Kalam Technical University',
      slug: 'aktu',
      location: 'Lucknow, UP',
      type: 'State',
      logo_url: '',
    },
  },

  courses: {
    tableName: 'courses',
    displayName: 'Courses',
    fields: [
      { name: 'university_name', required: true, type: 'string', description: 'University short name (e.g., AKTU)' },
      { name: 'name', required: true, type: 'string', description: 'Course name (e.g., B.Tech Computer Science)' },
      { name: 'code', required: true, type: 'string', description: 'Course code (e.g., btech-cse)' },
      { name: 'duration_years', required: false, type: 'number', description: 'Duration in years (default: 4)' },
    ],
    upsertKeys: ['university_id', 'code'],
    referenceFields: [
      { field: 'university_name', lookupTable: 'universities', lookupField: 'name' },
    ],
    sampleData: {
      university_name: 'AKTU',
      name: 'B.Tech Computer Science',
      code: 'btech-cse',
      duration_years: 4,
    },
  },

  semesters: {
    tableName: 'semesters',
    displayName: 'Semesters',
    fields: [
      { name: 'university_name', required: true, type: 'string', description: 'University short name (e.g., AKTU)' },
      { name: 'course_code', required: true, type: 'string', description: 'Course code (e.g., btech-cse)' },
      { name: 'number', required: true, type: 'number', description: 'Semester number (1-12)' },
      { name: 'name', required: true, type: 'string', description: 'Display name (e.g., Semester 5)' },
    ],
    upsertKeys: ['course_id', 'number'],
    referenceFields: [
      { field: 'university_name', lookupTable: 'universities', lookupField: 'name' },
      { field: 'course_code', lookupTable: 'courses', lookupField: 'code' },
    ],
    sampleData: {
      university_name: 'AKTU',
      course_code: 'btech-cse',
      number: 5,
      name: 'Semester 5',
    },
  },

  subjects: {
    tableName: 'subjects',
    displayName: 'Subjects',
    fields: [
      { name: 'university_name', required: true, type: 'string', description: 'University short name (e.g., AKTU)' },
      { name: 'course_code', required: true, type: 'string', description: 'Course code (e.g., btech-cse)' },
      { name: 'semester_number', required: true, type: 'number', description: 'Semester number' },
      { name: 'name', required: true, type: 'string', description: 'Subject name (e.g., Database Management System)' },
      { name: 'code', required: true, type: 'string', description: 'Subject code (e.g., KCS501)' },
      { name: 'slug', required: true, type: 'string', description: 'URL slug (e.g., dbms)' },
      { name: 'exam_type', required: false, type: 'string', description: 'End Semester/Mid Semester' },
      { name: 'total_marks', required: false, type: 'number', description: 'Total marks (default: 100)' },
      { name: 'theory_marks', required: false, type: 'number', description: 'Theory marks (default: 70)' },
      { name: 'internal_marks', required: false, type: 'number', description: 'Internal marks (default: 30)' },
      { name: 'duration', required: false, type: 'string', description: 'Exam duration (e.g., 3 Hours)' },
      { name: 'pattern', required: false, type: 'string', description: 'Theory/Practical' },
      { name: 'gradient_from', required: false, type: 'string', description: 'Gradient start color (hex)' },
      { name: 'gradient_to', required: false, type: 'string', description: 'Gradient end color (hex)' },
      { name: 'icon', required: false, type: 'string', description: 'Lucide icon name (e.g., Database)' },
    ],
    upsertKeys: ['semester_id', 'code'],
    referenceFields: [
      { field: 'university_name', lookupTable: 'universities', lookupField: 'name' },
      { field: 'course_code', lookupTable: 'courses', lookupField: 'code' },
      { field: 'semester_number', lookupTable: 'semesters', lookupField: 'number' },
    ],
    sampleData: {
      university_name: 'AKTU',
      course_code: 'btech-cse',
      semester_number: 5,
      name: 'Database Management System',
      code: 'KCS501',
      slug: 'dbms',
      exam_type: 'End Semester',
      total_marks: 100,
      theory_marks: 70,
      internal_marks: 30,
      duration: '3 Hours',
      pattern: 'Theory',
      gradient_from: '#3B82F6',
      gradient_to: '#8B5CF6',
      icon: 'Database',
    },
  },

  units: {
    tableName: 'units',
    displayName: 'Units',
    fields: [
      { name: 'subject_code', required: true, type: 'string', description: 'Subject code (e.g., KCS501)' },
      { name: 'number', required: true, type: 'number', description: 'Unit number (1-10)' },
      { name: 'name', required: true, type: 'string', description: 'Unit name (e.g., Introduction to DBMS)' },
      { name: 'weight', required: false, type: 'number', description: 'Weight percentage (default: 20)' },
    ],
    upsertKeys: ['subject_id', 'number'],
    referenceFields: [
      { field: 'subject_code', lookupTable: 'subjects', lookupField: 'code' },
    ],
    sampleData: {
      subject_code: 'KCS501',
      number: 1,
      name: 'Introduction to DBMS',
      weight: 20,
    },
  },

  important_questions: {
    tableName: 'important_questions',
    displayName: 'Important Questions',
    fields: [
      { name: 'subject_code', required: true, type: 'string', description: 'Subject code (e.g., KCS501)' },
      { name: 'unit_number', required: false, type: 'number', description: 'Unit number (optional)' },
      { name: 'question', required: true, type: 'string', description: 'Question text' },
      { name: 'marks', required: false, type: 'number', description: 'Marks (default: 10)' },
      { name: 'frequency', required: false, type: 'string', description: 'Very Frequent/Repeated/Expected' },
    ],
    upsertKeys: ['subject_id', 'question'],
    referenceFields: [
      { field: 'subject_code', lookupTable: 'subjects', lookupField: 'code' },
      { field: 'unit_number', lookupTable: 'units', lookupField: 'number' },
    ],
    sampleData: {
      subject_code: 'KCS501',
      unit_number: 1,
      question: 'Explain the three-level architecture of DBMS.',
      marks: 10,
      frequency: 'Very Frequent',
    },
  },

  notes: {
    tableName: 'notes',
    displayName: 'Notes',
    fields: [
      { name: 'subject_code', required: true, type: 'string', description: 'Subject code (e.g., KCS501)' },
      { name: 'unit_number', required: true, type: 'number', description: 'Unit number (must exist for subject)' },
      { name: 'chapter_title', required: true, type: 'string', description: 'Chapter/topic title' },
      { name: 'points', required: true, type: 'json', description: 'JSON array of strings: ["Point 1", "Point 2"]' },
      { name: 'order_index', required: false, type: 'number', description: 'Display order (default: 0)' },
    ],
    upsertKeys: ['unit_id', 'chapter_title'],
    referenceFields: [
      { field: 'subject_code', lookupTable: 'subjects', lookupField: 'code' },
      { field: 'unit_number', lookupTable: 'units', lookupField: 'number' },
    ],
    sampleData: {
      subject_code: 'KCS501',
      unit_number: 1,
      chapter_title: 'Introduction to DBMS',
      points: '["DBMS is a software system for managing databases", "Provides data abstraction and independence", "Supports concurrent access and data integrity"]',
      order_index: 1,
    },
  },

  pyq_papers: {
    tableName: 'pyq_papers',
    displayName: 'PYQ Papers',
    fields: [
      { name: 'subject_code', required: true, type: 'string', description: 'Subject code (e.g., KCS501)' },
      { name: 'year', required: true, type: 'string', description: 'Exam year (e.g., 2023 or 2023-24)' },
      { name: 'paper_code', required: false, type: 'string', description: 'Paper code (optional)' },
      { name: 'pdf_url', required: false, type: 'string', description: 'PDF file path or URL' },
    ],
    upsertKeys: ['subject_id', 'year'],
    referenceFields: [
      { field: 'subject_code', lookupTable: 'subjects', lookupField: 'code' },
    ],
    sampleData: {
      subject_code: 'KCS501',
      year: '2023',
      paper_code: 'KCS501-2023',
      pdf_url: '/pyqs/aktu/btech-cse/sem5/dbms/dbms-2023.pdf',
    },
  },

  pyq_questions: {
    tableName: 'pyq_questions',
    displayName: 'PYQ Questions',
    fields: [
      { name: 'subject_code', required: true, type: 'string', description: 'Subject code (e.g., KCS501)' },
      { name: 'year', required: true, type: 'string', description: 'Paper year (must exist in PYQ Papers)' },
      { name: 'unit_number', required: false, type: 'number', description: 'Unit number (optional)' },
      { name: 'question', required: true, type: 'string', description: 'Question text' },
      { name: 'marks', required: false, type: 'number', description: 'Marks (default: 10)' },
      { name: 'answer', required: false, type: 'string', description: 'Model answer (optional)' },
      { name: 'order_index', required: false, type: 'number', description: 'Question order in paper' },
    ],
    upsertKeys: ['pyq_paper_id', 'question'],
    referenceFields: [
      { field: 'subject_code', lookupTable: 'subjects', lookupField: 'code' },
      { field: 'year', lookupTable: 'pyq_papers', lookupField: 'year' },
      { field: 'unit_number', lookupTable: 'units', lookupField: 'number' },
    ],
    sampleData: {
      subject_code: 'KCS501',
      year: '2023',
      unit_number: 1,
      question: 'Explain the three-level architecture of DBMS with diagram.',
      marks: 10,
      answer: '',
      order_index: 1,
    },
  },
};

export function getImportConfig(tableName: string): ImportConfig | undefined {
  return importConfigs[tableName];
}

export function getRequiredFields(config: ImportConfig): string[] {
  return config.fields.filter(f => f.required).map(f => f.name);
}

export function getFieldHeaders(config: ImportConfig): string[] {
  return config.fields.map(f => f.name);
}
