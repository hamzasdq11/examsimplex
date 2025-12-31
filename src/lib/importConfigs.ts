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
      { name: 'type', required: false, type: 'string', description: 'State/Central/Private' },
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
      { name: 'university_name', required: true, type: 'string', description: 'University short name' },
      { name: 'name', required: true, type: 'string', description: 'Course name (e.g., B.Tech CSE)' },
      { name: 'code', required: true, type: 'string', description: 'Course code (e.g., btech-cse)' },
      { name: 'duration_years', required: false, type: 'number', description: 'Duration in years' },
    ],
    upsertKeys: ['university_id', 'code'],
    referenceFields: [
      { field: 'university_name', lookupTable: 'universities', lookupField: 'name' },
    ],
    sampleData: {
      university_name: 'AKTU',
      name: 'B.Tech Computer Science',
      code: 'tech-cse',
      duration_years: 4,
    },
  },

  semesters: {
    tableName: 'semesters',
    displayName: 'Semesters',
    fields: [
      { name: 'university_name', required: true, type: 'string', description: 'University short name' },
      { name: 'course_code', required: true, type: 'string', description: 'Course code' },
      { name: 'number', required: true, type: 'number', description: 'Semester number' },
      { name: 'name', required: true, type: 'string', description: 'Semester name (e.g., Semester 5)' },
    ],
    upsertKeys: ['course_id', 'number'],
    referenceFields: [
      { field: 'university_name', lookupTable: 'universities', lookupField: 'name' },
      { field: 'course_code', lookupTable: 'courses', lookupField: 'code' },
    ],
    sampleData: {
      university_name: 'AKTU',
      course_code: 'tech-cse',
      number: 5,
      name: 'Semester 5',
    },
  },

  subjects: {
    tableName: 'subjects',
    displayName: 'Subjects',
    fields: [
      { name: 'university_name', required: true, type: 'string', description: 'University short name' },
      { name: 'course_code', required: true, type: 'string', description: 'Course code' },
      { name: 'semester_number', required: true, type: 'number', description: 'Semester number' },
      { name: 'name', required: true, type: 'string', description: 'Subject name' },
      { name: 'code', required: true, type: 'string', description: 'Subject code' },
      { name: 'slug', required: true, type: 'string', description: 'URL-friendly identifier' },
      { name: 'exam_type', required: false, type: 'string', description: 'End Semester/Mid Semester' },
      { name: 'total_marks', required: false, type: 'number', description: 'Total marks' },
      { name: 'theory_marks', required: false, type: 'number', description: 'Theory marks' },
      { name: 'internal_marks', required: false, type: 'number', description: 'Internal marks' },
      { name: 'duration', required: false, type: 'string', description: 'Exam duration' },
      { name: 'pattern', required: false, type: 'string', description: 'Theory/Practical' },
      { name: 'gradient_from', required: false, type: 'string', description: 'Gradient start color' },
      { name: 'gradient_to', required: false, type: 'string', description: 'Gradient end color' },
      { name: 'icon', required: false, type: 'string', description: 'Lucide icon name' },
    ],
    upsertKeys: ['semester_id', 'code'],
    referenceFields: [
      { field: 'university_name', lookupTable: 'universities', lookupField: 'name' },
      { field: 'course_code', lookupTable: 'courses', lookupField: 'code' },
      { field: 'semester_number', lookupTable: 'semesters', lookupField: 'number' },
    ],
    sampleData: {
      university_name: 'AKTU',
      course_code: 'tech-cse',
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
      { name: 'subject_code', required: true, type: 'string', description: 'Subject code' },
      { name: 'number', required: true, type: 'number', description: 'Unit number' },
      { name: 'name', required: true, type: 'string', description: 'Unit name' },
      { name: 'weight', required: false, type: 'number', description: 'Weight percentage' },
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
      { name: 'subject_code', required: true, type: 'string', description: 'Subject code' },
      { name: 'unit_number', required: false, type: 'number', description: 'Unit number (optional)' },
      { name: 'question', required: true, type: 'string', description: 'Question text' },
      { name: 'marks', required: false, type: 'number', description: 'Marks (default: 10)' },
      { name: 'frequency', required: false, type: 'string', description: 'Expected/Most Expected/Asked Once' },
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
      frequency: 'Most Expected',
    },
  },

  notes: {
    tableName: 'notes',
    displayName: 'Notes',
    fields: [
      { name: 'subject_code', required: true, type: 'string', description: 'Subject code' },
      { name: 'unit_number', required: true, type: 'number', description: 'Unit number' },
      { name: 'chapter_title', required: true, type: 'string', description: 'Chapter title' },
      { name: 'points', required: true, type: 'json', description: 'Points as JSON array of strings' },
      { name: 'order_index', required: false, type: 'number', description: 'Display order' },
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
      points: '["DBMS is a software system", "Manages data efficiently", "Provides data abstraction"]',
      order_index: 1,
    },
  },

  pyq_papers: {
    tableName: 'pyq_papers',
    displayName: 'PYQ Papers',
    fields: [
      { name: 'subject_code', required: true, type: 'string', description: 'Subject code' },
      { name: 'year', required: true, type: 'string', description: 'Year (e.g., 2023-24)' },
      { name: 'paper_code', required: false, type: 'string', description: 'Paper code' },
      { name: 'pdf_url', required: false, type: 'string', description: 'PDF URL' },
    ],
    upsertKeys: ['subject_id', 'year'],
    referenceFields: [
      { field: 'subject_code', lookupTable: 'subjects', lookupField: 'code' },
    ],
    sampleData: {
      subject_code: 'KCS501',
      year: '2023-24',
      paper_code: 'KCS501-2023',
      pdf_url: '/pyqs/aktu/btech-cse/sem5/dbms/dbms-2023.pdf',
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
