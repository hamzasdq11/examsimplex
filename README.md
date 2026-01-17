<p align="center">
  <img src="public/favicon.svg" alt="EXAM Simplex Logo" width="80" height="80">
</p>

<h1 align="center">EXAM Simplex</h1>

<p align="center">
  <strong>AI-powered exam preparation for university students in India</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind">
</p>

---

## About

**EXAM Simplex** is a free, AI-powered study platform designed to help university students in India prepare for their exams more effectively. Currently supporting **AKTU (Abdul Kalam Technical University)** with an expandable architecture for other universities.

The platform provides organized study materials, previous year question papers (PYQs), and an intelligent AI assistant that can answer questions, solve problems, and provide explanations with proper citations.

## Key Features

### 📚 Smart Study Notes
- Organized hierarchically: University → Course → Semester → Subject → Unit
- Point-wise notes for quick revision
- Easy navigation with breadcrumb trails

### 📝 Previous Year Questions (PYQs)
- Downloadable past exam papers
- Organized by subject and year
- Understand exam patterns and important topics

### 🤖 AI Study Assistant
A sophisticated multi-model AI system featuring:
- **Math Rendering** - Beautiful equation display using KaTeX
- **Code Execution** - Run Python code directly in browser (Pyodide)
- **Web Search** - Real-time information with citations (Perplexity integration)
- **Graph Visualization** - Render mathematical graphs and diagrams
- **Confidence Scoring** - AI indicates how confident it is in answers
- **Smart Model Routing** - Uses different AI models based on task complexity:
  - Flash-lite for intent classification
  - Gemini Pro for complex reasoning
  - Flash for fast generation

### 📖 Personal Library
- Save favorite subjects, notes, and papers
- Quick access to your study materials

### 📋 Studylists
- Create custom collections of study materials
- Organize resources by exam or topic

### 🎓 University Support
- Currently: AKTU (B.Tech CSE, and more)
- Expandable architecture for additional universities

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Backend** | Lovable Cloud (Supabase) |
| **AI** | Lovable AI Gateway (Gemini 2.5/3, GPT-5 models) |
| **Auth** | Email OTP Authentication |
| **Database** | PostgreSQL with Row Level Security |

## Architecture

### Content Hierarchy
```
Universities
└── Courses (B.Tech CSE, ECE, etc.)
    └── Semesters (1-8)
        └── Subjects (DBMS, OS, etc.)
            └── Units (1-5)
                ├── Notes (chapter-wise points)
                ├── PYQ Papers (yearly)
                └── Important Questions
```

### AI Pipeline
```
User Query
    ↓
Intent Classification (gemini-flash-lite)
    ↓
┌───────────────────┐
│ Needs Web Search? │──Yes──→ Perplexity API
└───────────────────┘              ↓
    │ No                    Web Sources
    ↓                           ↓
Internal Retrieval ←────────────┘
    ↓
Model Routing (based on intent)
    ↓
Response Generation (with confidence score)
    ↓
Structured Output (math/code/graph/answer)
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or bun

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd exam-simplex

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### No-Code Editing
Visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) to make changes using the AI editor.

## Project Structure

```
src/
├── components/
│   ├── landing/      # Landing page sections
│   ├── admin/        # Admin dashboard components
│   ├── ai/           # AI chat components (citations, code, math)
│   └── ui/           # shadcn/ui components
├── pages/
│   ├── SubjectPage   # Subject detail with AI chat
│   ├── UniversityPage# University overview
│   ├── Dashboard     # User dashboard
│   └── admin/        # Admin pages
├── hooks/            # Custom React hooks
└── lib/              # Utilities and helpers

supabase/
└── functions/
    ├── ai-orchestrator/      # Main AI routing logic
    ├── ai-intent-classifier/ # Query intent detection
    ├── ai-internal-retrieval/# Database content search
    └── ai-web-search/        # Perplexity web search
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `universities` | University information |
| `courses` | Degree programs |
| `semesters` | Academic semesters |
| `subjects` | Course subjects |
| `units` | Subject units/chapters |
| `notes` | Study notes content |
| `pyq_papers` | Past exam papers |
| `important_questions` | Frequently asked questions |
| `profiles` | User profiles |
| `studylists` | User-created collections |

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for students preparing for their exams
</p>
