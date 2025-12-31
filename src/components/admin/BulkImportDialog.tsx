import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Download, FileJson, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  parseFile, 
  generateCSVTemplate, 
  generateJSONTemplate, 
  downloadTemplate,
  fetchAllLookupData,
  validateRequired,
  toNumber,
  type ParsedRecord,
  type ImportResult 
} from '@/lib/importUtils';
import { 
  getImportConfig, 
  getRequiredFields, 
  getFieldHeaders,
  type ImportConfig 
} from '@/lib/importConfigs';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  onImportComplete: () => void;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

export function BulkImportDialog({ open, onOpenChange, tableName, onImportComplete }: BulkImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const config = getImportConfig(tableName);

  const resetState = useCallback(() => {
    setStep('upload');
    setFile(null);
    setParsedRecords([]);
    setImportProgress(0);
    setImportResult(null);
  }, []);

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!config) return;

    setFile(selectedFile);
    const { data, error } = await parseFile(selectedFile);

    if (error) {
      toast({ title: 'Parse Error', description: error, variant: 'destructive' });
      return;
    }

    const requiredFields = getRequiredFields(config);
    const records: ParsedRecord[] = data.map((row, index) => {
      const errors = validateRequired(row, requiredFields);
      return {
        data: row,
        rowIndex: index + 1,
        errors,
        isValid: errors.length === 0,
      };
    });

    setParsedRecords(records);
    setStep('preview');
  };

  const downloadCSVTemplate = () => {
    if (!config) return;
    const headers = getFieldHeaders(config);
    const content = generateCSVTemplate(headers, config.sampleData);
    downloadTemplate(content, `${tableName}_template.csv`);
  };

  const downloadJSONTemplate = () => {
    if (!config) return;
    const content = generateJSONTemplate([config.sampleData]);
    downloadTemplate(content, `${tableName}_template.json`);
  };

  const performImport = async () => {
    if (!config) return;

    setStep('importing');
    setImportProgress(0);

    const result: ImportResult = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    const lookupData = await fetchAllLookupData();
    const validRecords = parsedRecords.filter(r => r.isValid);
    const total = validRecords.length;

    for (let i = 0; i < validRecords.length; i++) {
      const record = validRecords[i];
      try {
        const processedData = await processRecord(record.data, config, lookupData);
        
        if (processedData.error) {
          result.failed++;
          result.errors.push({ row: record.rowIndex, message: processedData.error });
        } else {
          const upsertResult = await upsertRecord(config.tableName, processedData.data, config.upsertKeys);
          if (upsertResult.error) {
            result.failed++;
            result.errors.push({ row: record.rowIndex, message: upsertResult.error });
          } else if (upsertResult.updated) {
            result.updated++;
          } else {
            result.inserted++;
          }
        }
      } catch (e) {
        result.failed++;
        result.errors.push({ row: record.rowIndex, message: e instanceof Error ? e.message : 'Unknown error' });
      }

      setImportProgress(Math.round(((i + 1) / total) * 100));
    }

    setImportResult(result);
    setStep('complete');
    onImportComplete();
  };

  if (!config) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import {config.displayName}</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file to bulk import {config.displayName.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Download Templates */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadCSVTemplate}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
                <Button variant="outline" size="sm" onClick={downloadJSONTemplate}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Download JSON Template
                </Button>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your file here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <Input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild variant="secondary">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select File
                  </label>
                </Button>
              </div>

              {/* Field Reference */}
              <div className="text-sm">
                <p className="font-medium mb-2">Expected Fields:</p>
                <div className="flex flex-wrap gap-2">
                  {config.fields.map(field => (
                    <Badge key={field.name} variant={field.required ? 'default' : 'secondary'}>
                      {field.name}{field.required && '*'}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    File: {file?.name}
                  </span>
                  <Badge variant="outline">
                    {parsedRecords.length} records
                  </Badge>
                  <Badge variant="default" className="bg-green-500">
                    {parsedRecords.filter(r => r.isValid).length} valid
                  </Badge>
                  {parsedRecords.some(r => !r.isValid) && (
                    <Badge variant="destructive">
                      {parsedRecords.filter(r => !r.isValid).length} errors
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  <X className="h-4 w-4 mr-1" /> Change File
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      {config.fields.slice(0, 5).map(field => (
                        <TableHead key={field.name}>{field.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRecords.slice(0, 100).map((record, idx) => (
                      <TableRow key={idx} className={!record.isValid ? 'bg-destructive/10' : ''}>
                        <TableCell>{record.rowIndex}</TableCell>
                        <TableCell>
                          {record.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span className="text-xs text-destructive">{record.errors[0]}</span>
                            </div>
                          )}
                        </TableCell>
                        {config.fields.slice(0, 5).map(field => (
                          <TableCell key={field.name} className="max-w-[150px] truncate">
                            {String(record.data[field.name] || '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button 
                  onClick={performImport} 
                  disabled={parsedRecords.filter(r => r.isValid).length === 0}
                >
                  Import {parsedRecords.filter(r => r.isValid).length} Records
                </Button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-12 space-y-6">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Importing records...</p>
                <p className="text-sm text-muted-foreground">Please wait while we process your data.</p>
              </div>
              <Progress value={importProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">{importProgress}% complete</p>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="py-8 space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">Import Complete</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{importResult.inserted}</p>
                  <p className="text-sm text-muted-foreground">Inserted</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{importResult.updated}</p>
                  <p className="text-sm text-muted-foreground">Updated</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <ScrollArea className="h-[150px] border rounded-md p-4">
                  <p className="font-medium mb-2">Errors:</p>
                  {importResult.errors.map((err, idx) => (
                    <p key={idx} className="text-sm text-destructive">
                      Row {err.row}: {err.message}
                    </p>
                  ))}
                </ScrollArea>
              )}

              <div className="flex justify-center">
                <Button onClick={handleClose}>Done</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Process a single record, resolving references
async function processRecord(
  record: Record<string, any>,
  config: ImportConfig,
  lookupData: Awaited<ReturnType<typeof fetchAllLookupData>>
): Promise<{ data: Record<string, any>; error?: string }> {
  const processed: Record<string, any> = {};

  // Handle reference resolution based on table type
  switch (config.tableName) {
    case 'universities':
      processed.name = record.name;
      processed.full_name = record.full_name;
      processed.slug = record.slug;
      processed.location = record.location;
      if (record.type) processed.type = record.type;
      if (record.logo_url) processed.logo_url = record.logo_url;
      break;

    case 'courses': {
      const university = lookupData.universities.find(
        u => u.name?.toLowerCase() === record.university_name?.toLowerCase()
      );
      if (!university) {
        const availableUniversities = lookupData.universities.map(u => u.name).join(', ');
        return { data: {}, error: `University not found: "${record.university_name}". Available: ${availableUniversities || 'none'}` };
      }
      
      processed.university_id = university.id;
      processed.name = record.name;
      processed.code = record.code;
      if (record.duration_years) processed.duration_years = toNumber(record.duration_years, 4);
      break;
    }

    case 'semesters': {
      const university = lookupData.universities.find(
        u => u.name?.toLowerCase() === record.university_name?.toLowerCase()
      );
      if (!university) {
        const availableUniversities = lookupData.universities.map(u => u.name).join(', ');
        return { data: {}, error: `University not found: "${record.university_name}". Available: ${availableUniversities || 'none'}` };
      }

      const course = lookupData.courses.find(
        c => c.university_id === university.id && c.code?.toLowerCase() === record.course_code?.toLowerCase()
      );
      if (!course) {
        const availableCourses = lookupData.courses.filter(c => c.university_id === university.id).map(c => c.code).join(', ');
        return { data: {}, error: `Course not found: "${record.course_code}" for ${university.name}. Available: ${availableCourses || 'none'}` };
      }

      processed.course_id = course.id;
      processed.number = toNumber(record.number);
      processed.name = record.name;
      break;
    }

    case 'subjects': {
      const university = lookupData.universities.find(
        u => u.name?.toLowerCase() === record.university_name?.toLowerCase()
      );
      if (!university) {
        const availableUniversities = lookupData.universities.map(u => u.name).join(', ');
        return { data: {}, error: `University not found: "${record.university_name}". Available: ${availableUniversities || 'none'}` };
      }

      const course = lookupData.courses.find(
        c => c.university_id === university.id && c.code?.toLowerCase() === record.course_code?.toLowerCase()
      );
      if (!course) {
        const availableCourses = lookupData.courses.filter(c => c.university_id === university.id).map(c => c.code).join(', ');
        return { data: {}, error: `Course not found: "${record.course_code}" for ${university.name}. Available: ${availableCourses || 'none'}` };
      }

      const semester = lookupData.semesters.find(
        s => s.course_id === course.id && s.number === toNumber(record.semester_number)
      );
      if (!semester) {
        const availableSemesters = lookupData.semesters.filter(s => s.course_id === course.id).map(s => s.number).join(', ');
        return { data: {}, error: `Semester not found: ${record.semester_number} for ${course.code}. Available: ${availableSemesters || 'none'}` };
      }

      processed.semester_id = semester.id;
      processed.name = record.name;
      processed.code = record.code;
      processed.slug = record.slug;
      if (record.exam_type) processed.exam_type = record.exam_type;
      if (record.total_marks) processed.total_marks = toNumber(record.total_marks, 100);
      if (record.theory_marks) processed.theory_marks = toNumber(record.theory_marks, 70);
      if (record.internal_marks) processed.internal_marks = toNumber(record.internal_marks, 30);
      if (record.duration) processed.duration = record.duration;
      if (record.pattern) processed.pattern = record.pattern;
      if (record.gradient_from) processed.gradient_from = record.gradient_from;
      if (record.gradient_to) processed.gradient_to = record.gradient_to;
      if (record.icon) processed.icon = record.icon;
      break;
    }

    case 'units': {
      const subject = lookupData.subjects.find(
        s => s.code?.toLowerCase() === record.subject_code?.toLowerCase()
      );
      if (!subject) return { data: {}, error: `Subject not found: ${record.subject_code}` };

      processed.subject_id = subject.id;
      processed.number = toNumber(record.number);
      processed.name = record.name;
      if (record.weight) processed.weight = toNumber(record.weight, 20);
      break;
    }

    case 'important_questions': {
      const subject = lookupData.subjects.find(
        s => s.code?.toLowerCase() === record.subject_code?.toLowerCase()
      );
      if (!subject) return { data: {}, error: `Subject not found: ${record.subject_code}` };

      processed.subject_id = subject.id;
      processed.question = record.question;
      if (record.marks) processed.marks = toNumber(record.marks, 10);
      if (record.frequency) processed.frequency = record.frequency;

      if (record.unit_number) {
        const unit = lookupData.units.find(
          u => u.subject_id === subject.id && u.number === toNumber(record.unit_number)
        );
        if (unit) processed.unit_id = unit.id;
      }
      break;
    }

    case 'notes': {
      const subject = lookupData.subjects.find(
        s => s.code?.toLowerCase() === record.subject_code?.toLowerCase()
      );
      if (!subject) return { data: {}, error: `Subject not found: ${record.subject_code}` };

      const unit = lookupData.units.find(
        u => u.subject_id === subject.id && u.number === toNumber(record.unit_number)
      );
      if (!unit) return { data: {}, error: `Unit not found: ${record.unit_number}` };

      processed.unit_id = unit.id;
      processed.chapter_title = record.chapter_title;
      processed.order_index = toNumber(record.order_index, 0);

      // Parse points - could be JSON string or already parsed
      let points = record.points;
      if (typeof points === 'string') {
        try {
          points = JSON.parse(points);
        } catch {
          points = points.split('\n').filter(Boolean);
        }
      }
      processed.points = points;
      break;
    }

    case 'pyq_papers': {
      const subject = lookupData.subjects.find(
        s => s.code?.toLowerCase() === record.subject_code?.toLowerCase()
      );
      if (!subject) return { data: {}, error: `Subject not found: ${record.subject_code}` };

      processed.subject_id = subject.id;
      processed.year = record.year;
      if (record.paper_code) processed.paper_code = record.paper_code;
      if (record.pdf_url) processed.pdf_url = record.pdf_url;
      break;
    }

    default:
      return { data: {}, error: `Unknown table: ${config.tableName}` };
  }

  return { data: processed };
}

// Upsert a single record
async function upsertRecord(
  tableName: string,
  data: Record<string, any>,
  upsertKeys: string[]
): Promise<{ error?: string; updated?: boolean }> {
  // Build upsert query with onConflict
  const { data: result, error } = await supabase
    .from(tableName as any)
    .upsert(data, { 
      onConflict: upsertKeys.join(','),
      ignoreDuplicates: false 
    })
    .select('id');

  if (error) {
    // If conflict resolution fails, try insert/update manually
    if (error.code === '23505' || error.message.includes('duplicate')) {
      // Record exists, update it
      let updateQuery = supabase.from(tableName as any).update(data);
      for (const key of upsertKeys) {
        if (data[key] !== undefined) {
          updateQuery = updateQuery.eq(key, data[key]);
        }
      }
      const { error: updateError } = await updateQuery;
      if (updateError) return { error: updateError.message };
      return { updated: true };
    }
    return { error: error.message };
  }

  // Check if it was an insert or update based on returned data
  return { updated: false };
    
}
