import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminContextProvider } from "@/contexts/AdminContext";
import Index from "./pages/Index";
import UniversityPage from "./pages/UniversityPage";
import SubjectPage from "./pages/SubjectPage";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import UserDashboard from "./pages/Dashboard";
import AIStudyMode from "./pages/AIStudyMode";
import Library from "./pages/Library";
import Studylists from "./pages/Studylists";
import StudylistDetail from "./pages/StudylistDetail";
import AdminDashboard from "./pages/admin/Dashboard";
import Universities from "./pages/admin/Universities";
import Courses from "./pages/admin/Courses";
import Subjects from "./pages/admin/Subjects";
import Questions from "./pages/admin/Questions";
import MCQs from "./pages/admin/MCQs";
import Notes from "./pages/admin/Notes";
import PYQs from "./pages/admin/PYQs";
import Users from "./pages/admin/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/dashboard/ai-study" element={<AIStudyMode />} />
                <Route path="/dashboard/study" element={<AIStudyMode />} />
                <Route path="/library" element={<Library />} />
                <Route path="/studylists" element={<Studylists />} />
                <Route path="/studylists/:id" element={<StudylistDetail />} />
                <Route path="/university/:universityId" element={<UniversityPage />} />
                <Route path="/university/:universityId/:courseId/:semesterId/:subjectId" element={<SubjectPage />} />
                
                {/* Admin Routes - wrapped with AdminContextProvider */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminContextProvider><AdminDashboard /></AdminContextProvider></ProtectedRoute>} />
                <Route path="/admin/universities" element={<ProtectedRoute requireAdmin><AdminContextProvider><Universities /></AdminContextProvider></ProtectedRoute>} />
                <Route path="/admin/courses" element={<ProtectedRoute requireAdmin><AdminContextProvider><Courses /></AdminContextProvider></ProtectedRoute>} />
                <Route path="/admin/subjects" element={<ProtectedRoute requireAdmin><AdminContextProvider><Subjects /></AdminContextProvider></ProtectedRoute>} />
                <Route path="/admin/questions" element={<ProtectedRoute requireAdmin><AdminContextProvider><Questions /></AdminContextProvider></ProtectedRoute>} />
                <Route path="/admin/mcqs" element={<ProtectedRoute requireAdmin><AdminContextProvider><MCQs /></AdminContextProvider></ProtectedRoute>} />
                <Route path="/admin/notes" element={<ProtectedRoute requireAdmin><AdminContextProvider><Notes /></AdminContextProvider></ProtectedRoute>} />
                <Route path="/admin/pyqs" element={<ProtectedRoute requireAdmin><AdminContextProvider><PYQs /></AdminContextProvider></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminContextProvider><Users /></AdminContextProvider></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
