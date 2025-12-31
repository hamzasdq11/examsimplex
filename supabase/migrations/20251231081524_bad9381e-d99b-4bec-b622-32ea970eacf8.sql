-- Add unique constraint on subjects table for upsert operations
ALTER TABLE subjects 
ADD CONSTRAINT subjects_semester_id_code_unique 
UNIQUE (semester_id, code);