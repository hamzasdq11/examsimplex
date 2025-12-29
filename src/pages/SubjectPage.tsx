import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  FileQuestion,
  FileText,
  MessageSquare,
  Clock,
  Award,
  ChevronRight,
  ChevronDown,
  Download,
  Printer,
  Send,
  Target,
  TrendingUp,
} from "lucide-react";

// Mock data for AKTU B.Tech CSE - Database Management System
const subjectData = {
  code: "BCS501",
  name: "Database Management System",
  university: "AKTU",
  course: "B.Tech CSE",
  semester: "Semester 5",
  examInfo: {
    type: "End Semester",
    totalMarks: 100,
    theoryMarks: 70,
    internalMarks: 30,
    duration: "3 Hours",
    pattern: "Theory + Numerical",
  },
  units: [
    { id: 1, name: "Introduction to DBMS", weight: 15 },
    { id: 2, name: "Relational Model & SQL", weight: 25 },
    { id: 3, name: "Database Design & Normalization", weight: 20 },
    { id: 4, name: "Transaction Management", weight: 20 },
    { id: 5, name: "File Organization & Indexing", weight: 20 },
  ],
  importantQuestions: [
    {
      id: 1,
      question: "Explain the three-level architecture of DBMS with a neat diagram.",
      marks: 10,
      frequency: "Very Frequent",
      unit: "Unit 1",
      hasTemplate: true,
    },
    {
      id: 2,
      question: "What is normalization? Explain 1NF, 2NF, 3NF, and BCNF with examples.",
      marks: 10,
      frequency: "Repeated",
      unit: "Unit 3",
      hasTemplate: true,
    },
    {
      id: 3,
      question: "Explain ACID properties of transactions with suitable examples.",
      marks: 7,
      frequency: "Very Frequent",
      unit: "Unit 4",
      hasTemplate: true,
    },
    {
      id: 4,
      question: "Write SQL queries for the following operations: JOIN, GROUP BY, HAVING, and subqueries.",
      marks: 10,
      frequency: "Repeated",
      unit: "Unit 2",
      hasTemplate: true,
    },
    {
      id: 5,
      question: "Differentiate between B-tree and B+ tree indexing with diagrams.",
      marks: 7,
      frequency: "Expected",
      unit: "Unit 5",
      hasTemplate: true,
    },
    {
      id: 6,
      question: "Explain deadlock detection and prevention techniques in DBMS.",
      marks: 10,
      frequency: "Repeated",
      unit: "Unit 4",
      hasTemplate: true,
    },
    {
      id: 7,
      question: "What is ER model? Draw an ER diagram for a university database system.",
      marks: 10,
      frequency: "Very Frequent",
      unit: "Unit 1",
      hasTemplate: true,
    },
    {
      id: 8,
      question: "Explain various types of joins in SQL with examples.",
      marks: 7,
      frequency: "Expected",
      unit: "Unit 2",
      hasTemplate: true,
    },
  ],
  notes: [
    {
      unit: "Unit 1: Introduction to DBMS",
      chapters: [
        {
          title: "Database Concepts",
          points: [
            "**Database**: Organized collection of interrelated data",
            "**DBMS**: Software system to manage databases efficiently",
            "**Data Independence**: Logical and Physical independence",
            "Advantages: Data sharing, integrity, security, backup",
          ],
        },
        {
          title: "Three-Level Architecture",
          points: [
            "**External Level**: User views, different for different users",
            "**Conceptual Level**: Logical structure of entire database",
            "**Internal Level**: Physical storage structure",
            "Mappings ensure data independence between levels",
          ],
        },
      ],
    },
    {
      unit: "Unit 2: Relational Model & SQL",
      chapters: [
        {
          title: "Relational Model Basics",
          points: [
            "**Relation**: Table with rows (tuples) and columns (attributes)",
            "**Domain**: Set of atomic values for an attribute",
            "**Keys**: Super key, Candidate key, Primary key, Foreign key",
            "Relational algebra: Select, Project, Join, Union, Difference",
          ],
        },
        {
          title: "SQL Fundamentals",
          points: [
            "**DDL**: CREATE, ALTER, DROP, TRUNCATE",
            "**DML**: SELECT, INSERT, UPDATE, DELETE",
            "**DCL**: GRANT, REVOKE",
            "**TCL**: COMMIT, ROLLBACK, SAVEPOINT",
          ],
        },
      ],
    },
    {
      unit: "Unit 3: Database Design & Normalization",
      chapters: [
        {
          title: "Normalization Forms",
          points: [
            "**1NF**: Eliminate repeating groups, atomic values only",
            "**2NF**: 1NF + No partial dependency on candidate key",
            "**3NF**: 2NF + No transitive dependency",
            "**BCNF**: Every determinant is a candidate key",
          ],
        },
      ],
    },
    {
      unit: "Unit 4: Transaction Management",
      chapters: [
        {
          title: "ACID Properties",
          points: [
            "**Atomicity**: All or nothing execution",
            "**Consistency**: Database remains in valid state",
            "**Isolation**: Concurrent transactions don't interfere",
            "**Durability**: Committed changes are permanent",
          ],
        },
      ],
    },
    {
      unit: "Unit 5: File Organization & Indexing",
      chapters: [
        {
          title: "Indexing Techniques",
          points: [
            "**Primary Index**: On ordering key field",
            "**Secondary Index**: On non-ordering field",
            "**B-Tree**: Balanced tree, keys in all nodes",
            "**B+ Tree**: Keys only in leaves, linked leaves",
          ],
        },
      ],
    },
  ],
  pyqs: [
    {
      year: "January 2025",
      code: "BCS501",
      pdfUrl: "/pyqs/aktu/btech-cse/sem5/dbms/dbms-2025.pdf",
      questions: [
        { 
          question: "Explain the three-level architecture of DBMS with a neat diagram.", 
          marks: 10, 
          unit: "Unit 1",
          answer: "**Three-Level Architecture (ANSI-SPARC):**\n\n1. **External Level (View Level):** User-specific views of the database. Different users see different portions based on their needs.\n\n2. **Conceptual Level (Logical Level):** Describes the logical structure of the entire database including entities, relationships, constraints, and security.\n\n3. **Internal Level (Physical Level):** Describes physical storage of data including file structures, indexing, and access paths.\n\n**Key Benefits:** Data abstraction, data independence (logical & physical), and security through multiple levels."
        },
        { 
          question: "Write SQL queries for JOIN, GROUP BY, HAVING and aggregate functions.", 
          marks: 10, 
          unit: "Unit 2",
          answer: "**SQL Examples:**\n\n```sql\n-- INNER JOIN\nSELECT e.name, d.dept_name \nFROM employees e \nINNER JOIN departments d ON e.dept_id = d.id;\n\n-- GROUP BY with COUNT\nSELECT dept_id, COUNT(*) as emp_count \nFROM employees \nGROUP BY dept_id;\n\n-- HAVING clause\nSELECT dept_id, AVG(salary) as avg_sal \nFROM employees \nGROUP BY dept_id \nHAVING AVG(salary) > 50000;\n\n-- Aggregate Functions\nSELECT MAX(salary), MIN(salary), SUM(salary), AVG(salary) FROM employees;\n```"
        },
        { 
          question: "Explain normalization with examples up to BCNF.", 
          marks: 10, 
          unit: "Unit 3",
          answer: "**Normalization Forms:**\n\n**1NF:** Eliminate repeating groups, ensure atomic values.\n- Before: Student(Roll, Name, Courses[C1,C2])\n- After: Student(Roll, Name, Course)\n\n**2NF:** 1NF + No partial dependency.\n- Remove attributes dependent on part of composite key.\n\n**3NF:** 2NF + No transitive dependency.\n- A→B and B→C means remove C from main table.\n\n**BCNF:** For every FD X→Y, X must be a superkey.\n- Stricter than 3NF, eliminates all redundancy."
        },
        { 
          question: "Describe ACID properties of transactions with examples.", 
          marks: 7, 
          unit: "Unit 4",
          answer: "**ACID Properties:**\n\n**Atomicity:** All-or-nothing execution. Bank transfer: both debit & credit must succeed or neither.\n\n**Consistency:** Database moves from one valid state to another. Total balance remains same after transfer.\n\n**Isolation:** Concurrent transactions don't interfere. Each sees consistent snapshot of data.\n\n**Durability:** Once committed, changes are permanent and survive system failures."
        },
        { 
          question: "Draw ER diagram for a library management system.", 
          marks: 10, 
          unit: "Unit 1",
          answer: "**Entities:** Book, Member, Author, Publisher, Loan\n\n**Relationships:**\n- Book --- Written_By --- Author (M:N)\n- Book --- Published_By --- Publisher (M:1)\n- Member --- Borrows --- Book (M:N with Loan as associative entity)\n\n**Attributes:**\n- Book: ISBN(PK), Title, Category, Copies\n- Member: MemberID(PK), Name, Address, Phone\n- Loan: LoanID(PK), IssueDate, DueDate, ReturnDate"
        },
        { 
          question: "Explain different types of file organization methods.", 
          marks: 7, 
          unit: "Unit 5",
          answer: "**File Organization Methods:**\n\n**1. Heap/Unordered:** Records stored in insertion order. Simple but slow search O(n).\n\n**2. Sequential/Ordered:** Records sorted by key. Binary search possible O(log n).\n\n**3. Hashed:** Hash function determines location. O(1) for exact match queries.\n\n**4. Clustered:** Related records stored together. Good for range queries."
        },
      ],
    },
    {
      year: "2023",
      code: "KCS501",
      pdfUrl: "/pyqs/aktu/btech-cse/sem5/dbms/dbms-2023.pdf",
      questions: [
        { 
          question: "Explain ER model and draw ER diagram for university database.", 
          marks: 10, 
          unit: "Unit 1",
          answer: "**ER Model Components:**\n- **Entity:** Real-world object (Student, Course, Faculty)\n- **Attribute:** Property of entity (Name, Roll_No)\n- **Relationship:** Association between entities\n\n**University Database ER:**\n- Student(Roll_No, Name, DOB) --- Enrolls --- Course(Code, Title, Credits)\n- Faculty(ID, Name, Dept) --- Teaches --- Course\n- Department(Dept_ID, Name) --- Offers --- Course"
        },
        { 
          question: "Write SQL queries using subqueries and nested queries.", 
          marks: 10, 
          unit: "Unit 2",
          answer: "**Subquery Examples:**\n\n```sql\n-- Find employees with salary > average\nSELECT name FROM employees \nWHERE salary > (SELECT AVG(salary) FROM employees);\n\n-- Find departments with no employees\nSELECT name FROM departments \nWHERE id NOT IN (SELECT dept_id FROM employees);\n\n-- Correlated subquery\nSELECT e.name FROM employees e \nWHERE salary > (SELECT AVG(salary) FROM employees WHERE dept_id = e.dept_id);\n\n-- EXISTS clause\nSELECT name FROM departments d \nWHERE EXISTS (SELECT 1 FROM employees WHERE dept_id = d.id);\n```"
        },
        { 
          question: "Differentiate between 3NF and BCNF with examples.", 
          marks: 7, 
          unit: "Unit 3",
          answer: "**3NF vs BCNF:**\n\n| Aspect | 3NF | BCNF |\n|--------|-----|------|\n| Definition | No transitive dependency | Every determinant is superkey |\n| Strictness | Less strict | More strict |\n| Redundancy | May have some | Completely eliminated |\n\n**Example:** R(A,B,C) with FDs: AB→C, C→B\n- In 3NF: Allowed (C→B doesn't violate)\n- Not in BCNF: C is not a superkey"
        },
        { 
          question: "Explain deadlock detection and prevention techniques.", 
          marks: 10, 
          unit: "Unit 4",
          answer: "**Deadlock Handling:**\n\n**Detection:**\n- Wait-for graph: Detect cycles\n- Timeout-based: Rollback long-waiting transactions\n\n**Prevention:**\n- **Wait-Die:** Older waits, younger dies (rolls back)\n- **Wound-Wait:** Older wounds (preempts) younger\n- **Lock ordering:** Acquire locks in fixed order\n- **Timestamp ordering:** Use timestamps to avoid conflicts"
        },
        { 
          question: "Explain serializability and its types.", 
          marks: 7, 
          unit: "Unit 4",
          answer: "**Serializability:**\nA schedule is serializable if it's equivalent to some serial schedule.\n\n**Types:**\n\n**1. Conflict Serializability:**\n- Two operations conflict if they access same data and at least one is write\n- Use precedence graph: No cycle = conflict serializable\n\n**2. View Serializability:**\n- Same initial reads, final writes, and read-from relationships\n- Includes blind writes\n- Superset of conflict serializability"
        },
        { 
          question: "What are triggers? Explain with syntax and example.", 
          marks: 7, 
          unit: "Unit 2",
          answer: "**Triggers:**\nAutomatic procedures executed in response to database events.\n\n```sql\nCREATE TRIGGER salary_audit\nAFTER UPDATE ON employees\nFOR EACH ROW\nBEGIN\n  INSERT INTO audit_log(emp_id, old_sal, new_sal, change_date)\n  VALUES(OLD.id, OLD.salary, NEW.salary, NOW());\nEND;\n```\n\n**Types:** BEFORE/AFTER triggers, INSERT/UPDATE/DELETE triggers"
        },
      ],
    },
    {
      year: "2022",
      code: "RCS501",
      pdfUrl: "/pyqs/aktu/btech-cse/sem5/dbms/dbms-2022.pdf",
      questions: [
        { 
          question: "Draw ER diagram for hospital management system.", 
          marks: 10, 
          unit: "Unit 1",
          answer: "**Hospital ER Diagram:**\n\n**Entities:**\n- Patient(PID, Name, Age, Address)\n- Doctor(DID, Name, Specialization)\n- Department(Dept_ID, Name, Location)\n- Appointment(App_ID, Date, Time)\n\n**Relationships:**\n- Patient --- Consults --- Doctor (M:N)\n- Doctor --- Works_In --- Department (M:1)\n- Patient --- Books --- Appointment (1:M)"
        },
        { 
          question: "Explain ACID properties with examples.", 
          marks: 7, 
          unit: "Unit 4",
          answer: "**ACID Properties:**\n\n**Atomicity:** Transaction is indivisible. Example: Money transfer - debit and credit both must complete.\n\n**Consistency:** Database constraints maintained. Example: Account balance can't be negative.\n\n**Isolation:** Concurrent transactions isolated. Example: Two users booking same seat see consistent data.\n\n**Durability:** Committed changes permanent. Example: After commit, data survives power failure."
        },
        { 
          question: "Differentiate between B-tree and B+ tree with diagrams.", 
          marks: 7, 
          unit: "Unit 5",
          answer: "**B-Tree vs B+ Tree:**\n\n| Feature | B-Tree | B+ Tree |\n|---------|--------|--------|\n| Data storage | All nodes | Leaf nodes only |\n| Leaf linking | No | Yes (linked list) |\n| Search efficiency | Variable | Consistent |\n| Range queries | Slower | Faster |\n| Space utilization | Less | More efficient |\n\n**B+ Tree Advantage:** All leaf nodes linked, excellent for range queries."
        },
        { 
          question: "What is normalization? Explain up to 3NF with example.", 
          marks: 10, 
          unit: "Unit 3",
          answer: "**Normalization Process:**\n\n**1NF (First Normal Form):**\n- Atomic values only, no repeating groups\n- Example: Split multi-valued phone into separate rows\n\n**2NF (Second Normal Form):**\n- 1NF + No partial dependencies\n- All non-key attributes fully depend on entire primary key\n\n**3NF (Third Normal Form):**\n- 2NF + No transitive dependencies\n- Non-key attributes depend only on primary key\n\n**Example:** Student_Course(Roll, Course, Instructor, Dept)\n- FD: Course → Instructor → Dept (transitive)\n- Decompose into: Student_Course(Roll, Course), Course_Info(Course, Instructor, Dept)"
        },
        { 
          question: "Explain relational algebra operations with examples.", 
          marks: 10, 
          unit: "Unit 2",
          answer: "**Relational Algebra Operations:**\n\n**Unary:**\n- **Selection (σ):** σ_salary>50000(Employee) - Filter rows\n- **Projection (π):** π_name,salary(Employee) - Select columns\n\n**Binary:**\n- **Union (∪):** R ∪ S - All tuples from both\n- **Intersection (∩):** R ∩ S - Common tuples\n- **Difference (−):** R − S - Tuples in R not in S\n- **Cartesian Product (×):** R × S - All combinations\n- **Join (⋈):** R ⋈ S - Combine on common attributes"
        },
        { 
          question: "What is data dictionary? Explain its components.", 
          marks: 7, 
          unit: "Unit 1",
          answer: "**Data Dictionary:**\nRepository of metadata (data about data) in DBMS.\n\n**Components:**\n- **Table definitions:** Names, column details\n- **Constraints:** Primary keys, foreign keys, check constraints\n- **User information:** Access privileges, roles\n- **Storage information:** File locations, indexes\n- **Statistics:** Table sizes, column distributions\n\n**Purpose:** Used by DBMS for query optimization and integrity enforcement."
        },
      ],
    },
    {
      year: "2020",
      code: "NCS502",
      pdfUrl: "/pyqs/aktu/btech-cse/sem5/dbms/dbms-2020.pdf",
      questions: [
        { 
          question: "Explain relational algebra operations with examples.", 
          marks: 10, 
          unit: "Unit 2",
          answer: "**Relational Algebra:**\n\n**Selection (σ):** Filters rows based on condition.\nσ_age>25(Student) - Students older than 25\n\n**Projection (π):** Selects specific columns.\nπ_name,dept(Employee) - Only name and dept columns\n\n**Join (⋈):** Combines related tables.\nEmployee ⋈ Department - Match on common attribute\n\n**Set Operations:**\n- Union: Combines all tuples\n- Intersection: Common tuples\n- Difference: Tuples in first not in second"
        },
        { 
          question: "What are different types of keys in DBMS? Explain each.", 
          marks: 7, 
          unit: "Unit 2",
          answer: "**Types of Keys:**\n\n**Super Key:** Any set of attributes that uniquely identifies a tuple.\n\n**Candidate Key:** Minimal super key (no proper subset is a super key).\n\n**Primary Key:** Chosen candidate key to identify tuples.\n\n**Alternate Key:** Candidate keys not chosen as primary key.\n\n**Foreign Key:** Attribute referencing primary key of another table.\n\n**Composite Key:** Key consisting of multiple attributes."
        },
        { 
          question: "Explain concurrency control techniques in DBMS.", 
          marks: 10, 
          unit: "Unit 4",
          answer: "**Concurrency Control Techniques:**\n\n**1. Lock-Based Protocols:**\n- Shared lock (S): Read-only access\n- Exclusive lock (X): Read-write access\n- 2-Phase Locking (2PL): Growing and shrinking phases\n\n**2. Timestamp-Based:**\n- Each transaction gets unique timestamp\n- Older transactions have priority\n\n**3. Optimistic Concurrency Control:**\n- Read, validate, write phases\n- No locks during read phase\n\n**4. Multi-Version Concurrency Control (MVCC):**\n- Maintain multiple versions of data\n- Readers don't block writers"
        },
        { 
          question: "Describe file organization methods in DBMS.", 
          marks: 7, 
          unit: "Unit 5",
          answer: "**File Organization Methods:**\n\n**1. Heap File:** Records in no particular order. Fast insert, slow search.\n\n**2. Sequential File:** Sorted by key. Good for range queries, costly inserts.\n\n**3. Hash File:** Hash function maps key to bucket. O(1) for exact match.\n\n**4. Indexed Sequential (ISAM):** Sequential file with index. Balanced performance.\n\n**5. Clustered:** Related records stored together for faster joins."
        },
        { 
          question: "What is transaction? Explain transaction states with diagram.", 
          marks: 7, 
          unit: "Unit 4",
          answer: "**Transaction:**\nLogical unit of work consisting of one or more database operations.\n\n**Transaction States:**\n1. **Active:** Transaction executing\n2. **Partially Committed:** After final statement\n3. **Committed:** After successful completion\n4. **Failed:** After error discovery\n5. **Aborted:** After rollback and recovery\n\n**State Diagram:** Active → Partially Committed → Committed\n                      ↓                              ↓\n                   Failed → Aborted"
        },
        { 
          question: "Explain view in SQL. How is it different from table?", 
          marks: 7, 
          unit: "Unit 2",
          answer: "**View in SQL:**\nVirtual table based on result of SELECT query.\n\n```sql\nCREATE VIEW emp_dept AS\nSELECT e.name, d.dept_name\nFROM employees e JOIN departments d\nON e.dept_id = d.id;\n```\n\n**View vs Table:**\n| View | Table |\n|------|-------|\n| Virtual, no storage | Physical storage |\n| Derived from query | Contains actual data |\n| Always up-to-date | Static until modified |\n| Security layer | Direct access |"
        },
      ],
    },
    {
      year: "2019",
      code: "NCS502",
      pdfUrl: "/pyqs/aktu/btech-cse/sem5/dbms/dbms-2019.pdf",
      questions: [
        { 
          question: "Explain data models used in DBMS with examples.", 
          marks: 10, 
          unit: "Unit 1",
          answer: "**Data Models:**\n\n**1. Hierarchical Model:**\n- Tree structure, parent-child relationships\n- Example: Organization hierarchy\n\n**2. Network Model:**\n- Graph structure, many-to-many relationships\n- Uses pointers to link records\n\n**3. Relational Model:**\n- Tables (relations) with rows and columns\n- Most widely used, SQL-based\n\n**4. Object-Oriented Model:**\n- Objects with attributes and methods\n- Supports inheritance and encapsulation\n\n**5. Entity-Relationship Model:**\n- Conceptual design using entities and relationships"
        },
        { 
          question: "Write SQL queries for various DML and DDL operations.", 
          marks: 10, 
          unit: "Unit 2",
          answer: "**DDL (Data Definition Language):**\n```sql\n-- Create table\nCREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50));\n\n-- Alter table\nALTER TABLE students ADD email VARCHAR(100);\n\n-- Drop table\nDROP TABLE students;\n```\n\n**DML (Data Manipulation Language):**\n```sql\n-- Insert\nINSERT INTO students VALUES (1, 'John', 'john@email.com');\n\n-- Update\nUPDATE students SET name = 'Jane' WHERE id = 1;\n\n-- Delete\nDELETE FROM students WHERE id = 1;\n\n-- Select\nSELECT * FROM students WHERE name LIKE 'J%';\n```"
        },
        { 
          question: "Explain functional dependencies and normalization.", 
          marks: 10, 
          unit: "Unit 3",
          answer: "**Functional Dependency (FD):**\nX → Y means value of X uniquely determines value of Y.\n\n**Types:**\n- **Trivial FD:** Y ⊆ X (e.g., AB → A)\n- **Non-trivial FD:** Y ⊄ X\n- **Fully Functional:** X → Y where no proper subset of X determines Y\n\n**Armstrong's Axioms:**\n- Reflexivity: If Y ⊆ X, then X → Y\n- Augmentation: If X → Y, then XZ → YZ\n- Transitivity: If X → Y and Y → Z, then X → Z\n\n**Normalization uses FDs to eliminate redundancy.**"
        },
        { 
          question: "What is transaction? Explain transaction states and properties.", 
          marks: 7, 
          unit: "Unit 4",
          answer: "**Transaction:**\nSequence of operations performed as a single logical unit.\n\n**Properties (ACID):**\n- Atomicity: All or nothing\n- Consistency: Valid state to valid state\n- Isolation: Concurrent transactions independent\n- Durability: Permanent after commit\n\n**States:**\nActive → Partially Committed → Committed\n       ↘ Failed → Aborted ↗"
        },
        { 
          question: "Explain different types of joins in SQL with examples.", 
          marks: 10, 
          unit: "Unit 2",
          answer: "**Types of Joins:**\n\n**1. INNER JOIN:** Returns matching rows only.\n```sql\nSELECT * FROM A INNER JOIN B ON A.id = B.a_id;\n```\n\n**2. LEFT JOIN:** All rows from left + matching from right.\n```sql\nSELECT * FROM A LEFT JOIN B ON A.id = B.a_id;\n```\n\n**3. RIGHT JOIN:** All rows from right + matching from left.\n\n**4. FULL OUTER JOIN:** All rows from both tables.\n\n**5. CROSS JOIN:** Cartesian product of both tables.\n\n**6. SELF JOIN:** Table joined with itself."
        },
        { 
          question: "What is indexing? Explain types of indexes.", 
          marks: 7, 
          unit: "Unit 5",
          answer: "**Indexing:**\nData structure to speed up data retrieval operations.\n\n**Types:**\n\n**1. Primary Index:** On ordering key field of sorted file.\n\n**2. Clustering Index:** On non-key ordering field.\n\n**3. Secondary Index:** On non-ordering field (can be on any attribute).\n\n**4. Dense Index:** Entry for every record.\n\n**5. Sparse Index:** Entry for some records only.\n\n**6. Multi-level Index:** Index on index for large files."
        },
      ],
    },
    {
      year: "2018",
      code: "NCS502",
      pdfUrl: "/pyqs/aktu/btech-cse/sem5/dbms/dbms-2018.pdf",
      questions: [
        { 
          question: "Explain three-level architecture of DBMS with diagram.", 
          marks: 10, 
          unit: "Unit 1",
          answer: "**ANSI-SPARC Three-Level Architecture:**\n\n**1. External Level:**\n- Individual user views\n- Different subsets for different users\n- Provides security and simplification\n\n**2. Conceptual Level:**\n- Logical structure of entire database\n- Entities, relationships, constraints\n- Independent of physical storage\n\n**3. Internal Level:**\n- Physical storage details\n- File structures, indexing, compression\n- Access paths and storage allocation\n\n**Mappings:** External-Conceptual and Conceptual-Internal mappings provide data independence."
        },
        { 
          question: "What is relational model? Explain relational algebra operations.", 
          marks: 10, 
          unit: "Unit 2",
          answer: "**Relational Model:**\nData represented as relations (tables) with tuples (rows) and attributes (columns).\n\n**Relational Algebra Operations:**\n\n**Unary:**\n- σ (Selection): Filter rows by condition\n- π (Projection): Select specific columns\n- ρ (Rename): Rename relation/attributes\n\n**Binary:**\n- ∪ (Union): Combine tuples from two relations\n- ∩ (Intersection): Common tuples\n- − (Difference): Tuples in first not in second\n- × (Cartesian Product): All combinations\n- ⋈ (Join): Combine on matching attributes"
        },
        { 
          question: "Explain normalization process with examples up to BCNF.", 
          marks: 10, 
          unit: "Unit 3",
          answer: "**Normalization:**\nProcess of organizing data to minimize redundancy.\n\n**1NF:** Atomic values, no repeating groups.\n\n**2NF:** 1NF + No partial dependency.\nExample: Order_Item(OrderID, ItemID, ItemName, Qty)\n- ItemID → ItemName (partial dependency)\n- Decompose: Order_Item(OrderID, ItemID, Qty), Item(ItemID, ItemName)\n\n**3NF:** 2NF + No transitive dependency.\nExample: Employee(EmpID, DeptID, DeptName)\n- EmpID → DeptID → DeptName (transitive)\n- Decompose: Employee(EmpID, DeptID), Dept(DeptID, DeptName)\n\n**BCNF:** Every determinant is a superkey."
        },
        { 
          question: "Describe indexing techniques in DBMS.", 
          marks: 7, 
          unit: "Unit 5",
          answer: "**Indexing Techniques:**\n\n**1. Ordered Indices:**\n- Primary Index: On sorted key field\n- Clustering Index: On sorted non-key field\n- Secondary Index: On unsorted field\n\n**2. Hash Indices:**\n- Static Hashing: Fixed buckets\n- Dynamic Hashing: Buckets grow/shrink\n\n**3. Tree Indices:**\n- B-Tree: Keys in all nodes\n- B+ Tree: Keys only in leaves, leaves linked\n\n**4. Bitmap Index:** Bit vectors for low-cardinality columns."
        },
        { 
          question: "Explain 2-Phase Locking Protocol.", 
          marks: 7, 
          unit: "Unit 4",
          answer: "**2-Phase Locking (2PL):**\nConcurrency control protocol ensuring serializability.\n\n**Phases:**\n\n**1. Growing Phase:**\n- Transaction acquires locks\n- Cannot release any lock\n\n**2. Shrinking Phase:**\n- Transaction releases locks\n- Cannot acquire new locks\n\n**Variants:**\n- **Strict 2PL:** Hold all exclusive locks until commit\n- **Rigorous 2PL:** Hold all locks until commit\n\n**Ensures conflict serializability but may cause deadlocks.**"
        },
        { 
          question: "What is data independence? Explain its types.", 
          marks: 7, 
          unit: "Unit 1",
          answer: "**Data Independence:**\nAbility to modify schema at one level without affecting higher levels.\n\n**Types:**\n\n**1. Logical Data Independence:**\n- Change conceptual schema without changing external schema\n- Add/modify entities, attributes\n- Example: Add new table without affecting views\n\n**2. Physical Data Independence:**\n- Change internal schema without changing conceptual schema\n- Modify storage, indexing, file organization\n- Example: Change from B-tree to hash index\n\n**Achieved through mappings between levels in three-schema architecture.**"
        },
      ],
    },
  ],
  answerTemplates: [
    {
      id: 1,
      question: "Explain the three-level architecture of DBMS with a neat diagram.",
      template: {
        intro: "The three-level architecture, also known as ANSI-SPARC architecture, provides data abstraction and data independence in DBMS.",
        keyPoints: [
          "External Level (View Level): Describes user-specific views of the database. Different users see different portions of the database.",
          "Conceptual Level (Logical Level): Describes the logical structure of the entire database. Contains entities, relationships, and constraints.",
          "Internal Level (Physical Level): Describes physical storage of data. Includes file structures, indexing, and access paths.",
        ],
        keywords: ["Data Abstraction", "Data Independence", "Schema", "Mapping", "ANSI-SPARC"],
        diagramSuggestion: "Draw three horizontal layers with External at top, Conceptual in middle, Internal at bottom. Show multiple external views connecting to single conceptual schema.",
        conclusion: "This architecture ensures logical and physical data independence, making database systems flexible and maintainable.",
        wordLimit: "300-400 words for 10 marks",
      },
    },
    {
      id: 2,
      question: "Explain ACID properties of transactions with suitable examples.",
      template: {
        intro: "ACID properties ensure reliable processing of database transactions and maintain data integrity even in case of failures.",
        keyPoints: [
          "Atomicity: Transaction is treated as single unit. Either all operations complete or none. Example: Bank transfer - debit and credit must both succeed.",
          "Consistency: Database moves from one valid state to another. Constraints are maintained. Example: Total balance remains same after transfer.",
          "Isolation: Concurrent transactions don't interfere. Each sees consistent snapshot. Example: Two withdrawals from same account handled correctly.",
          "Durability: Once committed, changes are permanent. Survives system failures. Example: Transaction log ensures recovery.",
        ],
        keywords: ["Transaction", "Commit", "Rollback", "Integrity", "Recovery"],
        diagramSuggestion: "Show transaction states: Active → Partially Committed → Committed/Aborted with arrows.",
        conclusion: "ACID properties are fundamental to transaction processing and ensure database reliability in multi-user environments.",
        wordLimit: "250-300 words for 7 marks",
      },
    },
  ],
  progress: {
    overall: 45,
    notesRead: 60,
    pyqsSolved: 30,
    questionsAttempted: 40,
  },
  focusAreas: [
    { area: "Normalization (Unit 3)", priority: "High", reason: "20% weightage, frequently asked" },
    { area: "SQL Queries (Unit 2)", priority: "High", reason: "Numerical questions expected" },
    { area: "Transaction Management (Unit 4)", priority: "Medium", reason: "Theory questions common" },
  ],
};

const SubjectPage = () => {
  const { universityId, courseId, semesterId, subjectId } = useParams();
  const [activeTab, setActiveTab] = useState("questions"); // Important Questions as default
  const [openUnits, setOpenUnits] = useState<string[]>([subjectData.notes[0]?.unit || ""]);
  const [openPyqYears, setOpenPyqYears] = useState<string[]>([subjectData.pyqs[0]?.year || ""]);
  const [aiMessage, setAiMessage] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I'm your DBMS exam assistant. Ask me anything about Database Management System - concepts, SQL queries, normalization, or exam preparation tips.",
    },
  ]);

  const toggleUnit = (unit: string) => {
    setOpenUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  const togglePyqYear = (year: string) => {
    setOpenPyqYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "Very Frequent":
        return "bg-red-100 text-red-700 border-red-200";
      case "Repeated":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Expected":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleAiSubmit = () => {
    if (!aiMessage.trim()) return;
    setAiMessages((prev) => [...prev, { role: "user", content: aiMessage }]);
    // Mock AI response
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Regarding "${aiMessage}":\n\n**Key Points for Exam:**\n1. Focus on the definition and core concept first\n2. Include relevant examples from AKTU previous years\n3. Use proper keywords that carry marks\n4. Draw diagrams wherever applicable\n\nWould you like me to explain this topic in more detail or provide an answer template?`,
        },
      ]);
    }, 1000);
    setAiMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/university/${universityId}`} className="hover:text-foreground">{subjectData.university}</Link>
          <ChevronRight className="h-4 w-4" />
          <span>{subjectData.course}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{subjectData.semester}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Subject Header */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">
                      {subjectData.name}
                    </h1>
                    <Badge variant="secondary" className="text-xs">
                      {subjectData.code}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {subjectData.university} · {subjectData.course} · {subjectData.semester}
                  </p>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    Exam-focused
                  </Badge>
                </div>

                {/* Exam Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>{subjectData.examInfo.totalMarks} Marks</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{subjectData.examInfo.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{subjectData.examInfo.pattern}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Strip */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTab === "notes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("notes")}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Notes
                </Button>
                <Button
                  variant={activeTab === "questions" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("questions")}
                  className="gap-2"
                >
                  <FileQuestion className="h-4 w-4" />
                  Important Questions
                </Button>
                <Button
                  variant={activeTab === "pyqs" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("pyqs")}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  PYQs
                </Button>
                <Button
                  variant={activeTab === "ai" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("ai")}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Ask AI
                </Button>
              </div>
            </div>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Important Questions Tab */}
              <TabsContent value="questions" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Important Questions</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Questions selected based on AKTU exam pattern analysis and frequency of repetition over past 5 years.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {subjectData.importantQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 border rounded-lg bg-muted/30 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-foreground font-medium">{q.question}</p>
                          <Badge variant="outline" className="shrink-0">
                            {q.marks} marks
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${getFrequencyColor(q.frequency)}`}>
                            {q.frequency}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {q.unit}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Chapter-wise Notes</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Printer className="h-4 w-4" />
                          Print
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {subjectData.notes.map((unit) => (
                      <Collapsible
                        key={unit.unit}
                        open={openUnits.includes(unit.unit)}
                        onOpenChange={() => toggleUnit(unit.unit)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50">
                            <span className="font-medium text-foreground">{unit.unit}</span>
                            {openUnits.includes(unit.unit) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-3">
                          {unit.chapters.map((chapter, idx) => (
                            <div key={idx} className="ml-4 p-4 border-l-2 border-primary/20 bg-background">
                              <h4 className="font-medium text-foreground mb-3">{chapter.title}</h4>
                              <ul className="space-y-2">
                                {chapter.points.map((point, pidx) => (
                                  <li
                                    key={pidx}
                                    className="text-sm text-muted-foreground"
                                    dangerouslySetInnerHTML={{
                                      __html: point
                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>'),
                                    }}
                                  />
                                ))}
                              </ul>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PYQs Tab */}
              <TabsContent value="pyqs" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Previous Year Questions</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Actual questions from AKTU end semester examinations. Click to download the original question paper.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {subjectData.pyqs.map((yearData) => (
                      <Collapsible
                        key={yearData.year}
                        open={openPyqYears.includes(yearData.year)}
                        onOpenChange={() => togglePyqYear(yearData.year)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-foreground">{yearData.year}</span>
                              <Badge variant="outline" className="text-xs">{yearData.code}</Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {yearData.questions.length} questions
                              </span>
                              <a
                                href={yearData.pdfUrl}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download PDF
                              </a>
                              {openPyqYears.includes(yearData.year) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-4">
                          {yearData.questions.map((q, idx) => (
                            <div key={idx} className="ml-4 border rounded-lg bg-background overflow-hidden">
                              {/* Question Header */}
                              <div className="p-4 bg-muted/40 border-b">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                                      {idx + 1}
                                    </span>
                                    <p className="text-foreground font-medium pt-0.5">{q.question}</p>
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    <Badge variant="outline" className="bg-background">{q.marks} marks</Badge>
                                    <Badge variant="secondary" className="text-xs">{q.unit}</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Model Answer */}
                              {q.answer && (
                                <div className="p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                    <span className="text-sm font-semibold text-primary">Model Answer</span>
                                  </div>
                                  <div 
                                    className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{
                                      __html: q.answer
                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                                        .replace(/```sql([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto my-2"><code class="text-foreground">$1</code></pre>')
                                        .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto my-2"><code class="text-foreground">$1</code></pre>')
                                        .replace(/\n\n/g, '</p><p class="mt-2">')
                                        .replace(/\n- /g, '</p><p class="mt-1 pl-4">• ')
                                        .replace(/\n\d\. /g, (match) => `</p><p class="mt-1 pl-4">${match.trim()} `)
                                        .replace(/\|([^|]+)\|/g, '<span class="inline-block px-2 py-0.5 bg-muted rounded text-xs mr-1">$1</span>')
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>


              {/* Ask AI Tab */}
              <TabsContent value="ai" className="mt-0">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-lg">Ask AI</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Context: {subjectData.name} ({subjectData.code}) - {subjectData.university}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {aiMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg ${
                              msg.role === "assistant"
                                ? "bg-muted/50 mr-8"
                                : "bg-primary/10 ml-8"
                            }`}
                          >
                            <p className="text-sm text-foreground whitespace-pre-line">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Ask about any concept, question, or exam tip..."
                          value={aiMessage}
                          onChange={(e) => setAiMessage(e.target.value)}
                          className="min-h-[60px] resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAiSubmit();
                            }
                          }}
                        />
                        <Button onClick={handleAiSubmit} size="icon" className="shrink-0">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Exam Readiness */}
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Exam Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{subjectData.progress.overall}%</span>
                  </div>
                  <Progress value={subjectData.progress.overall} className="h-2" />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Notes Read</span>
                    <span>{subjectData.progress.notesRead}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PYQs Solved</span>
                    <span>{subjectData.progress.pyqsSolved}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Questions Attempted</span>
                    <span>{subjectData.progress.questionsAttempted}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Focus Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjectData.focusAreas.map((focus, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{focus.area}</span>
                      <Badge
                        variant="outline"
                        className={
                          focus.priority === "High"
                            ? "border-red-200 text-red-700 bg-red-50"
                            : "border-amber-200 text-amber-700 bg-amber-50"
                        }
                      >
                        {focus.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{focus.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Unit Weightage */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Unit Weightage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjectData.units.map((unit) => (
                  <div key={unit.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground truncate pr-2">Unit {unit.id}</span>
                      <span className="font-medium shrink-0">{unit.weight}%</span>
                    </div>
                    <Progress value={unit.weight} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubjectPage;
