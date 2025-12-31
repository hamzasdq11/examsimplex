import { supabase } from "@/integrations/supabase/client";

export interface ParsedRecord {
  data: Record<string, any>;
  rowIndex: number;
  errors: string[];
  isValid: boolean;
}

export interface ImportResult {
  inserted: number;
  updated: number;
  failed: number;
  errors: { row: number; message: string }[];
}

// Parse CSV string into array of objects
export function parseCSVString(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = values[index]?.trim().replace(/^"|"$/g, '') || '';
      });
      records.push(record);
    }
  }

  return records;
}

// Parse a single CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

// Parse file content based on type
export async function parseFile(file: File): Promise<{ data: Record<string, any>[]; error?: string }> {
  const content = await file.text();
  const isJSON = file.name.endsWith('.json') || file.type === 'application/json';

  try {
    if (isJSON) {
      const parsed = JSON.parse(content);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      return { data };
    } else {
      const data = parseCSVString(content);
      return { data };
    }
  } catch (e) {
    return { data: [], error: `Failed to parse file: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
}

// Generate CSV template string
export function generateCSVTemplate(headers: string[], sampleData?: Record<string, string>): string {
  const headerLine = headers.join(',');
  const sampleLine = sampleData 
    ? headers.map(h => sampleData[h] || '').join(',')
    : headers.map(() => '').join(',');
  return `${headerLine}\n${sampleLine}`;
}

// Generate JSON template
export function generateJSONTemplate(sampleData: Record<string, any>[]): string {
  return JSON.stringify(sampleData, null, 2);
}

// Download template file
export function downloadTemplate(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Lookup functions for reference resolution
export async function fetchUniversityByName(name: string): Promise<string | null> {
  const { data } = await supabase
    .from('universities')
    .select('id')
    .ilike('name', name)
    .single();
  return data?.id || null;
}

export async function fetchCourseByCode(universityId: string, code: string): Promise<string | null> {
  const { data } = await supabase
    .from('courses')
    .select('id')
    .eq('university_id', universityId)
    .ilike('code', code)
    .single();
  return data?.id || null;
}

export async function fetchSemesterByNumber(courseId: string, number: number): Promise<string | null> {
  const { data } = await supabase
    .from('semesters')
    .select('id')
    .eq('course_id', courseId)
    .eq('number', number)
    .single();
  return data?.id || null;
}

export async function fetchSubjectByCode(code: string): Promise<string | null> {
  const { data } = await supabase
    .from('subjects')
    .select('id')
    .ilike('code', code)
    .single();
  return data?.id || null;
}

export async function fetchUnitByNumber(subjectId: string, number: number): Promise<string | null> {
  const { data } = await supabase
    .from('units')
    .select('id')
    .eq('subject_id', subjectId)
    .eq('number', number)
    .single();
  return data?.id || null;
}

// Fetch all lookup data for batch processing
export async function fetchAllLookupData() {
  const [universities, courses, semesters, subjects, units] = await Promise.all([
    supabase.from('universities').select('id, name, slug'),
    supabase.from('courses').select('id, university_id, code'),
    supabase.from('semesters').select('id, course_id, number'),
    supabase.from('subjects').select('id, semester_id, code'),
    supabase.from('units').select('id, subject_id, number'),
  ]);

  return {
    universities: universities.data || [],
    courses: courses.data || [],
    semesters: semesters.data || [],
    subjects: subjects.data || [],
    units: units.data || [],
  };
}

// Convert string to number safely
export function toNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

// Validate required fields
export function validateRequired(record: Record<string, any>, requiredFields: string[]): string[] {
  const errors: string[] = [];
  for (const field of requiredFields) {
    if (!record[field] || record[field].toString().trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }
  return errors;
}
