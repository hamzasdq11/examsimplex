import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import GetStarted from "./pages/GetStarted";
import UniversityPage from "./pages/UniversityPage";
import SubjectPage from "./pages/SubjectPage";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import UserDashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import Universities from "./pages/admin/Universities";
import Courses from "./pages/admin/Courses";
import Semesters from "./pages/admin/Semesters";
import Subjects from "./pages/admin/Subjects";
import Units from "./pages/admin/Units";
import Questions from "./pages/admin/Questions";
import Notes from "./pages/admin/Notes";
import PYQs from "./pages/admin/PYQs";
import Users from "./pages/admin/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/university/:universityId" element={<UniversityPage />} />
            <Route path="/university/:universityId/:courseId/:semesterId/:subjectId" element={<SubjectPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/universities" element={<ProtectedRoute requireAdmin><Universities /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute requireAdmin><Courses /></ProtectedRoute>} />
            <Route path="/admin/semesters" element={<ProtectedRoute requireAdmin><Semesters /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute requireAdmin><Subjects /></ProtectedRoute>} />
            <Route path="/admin/units" element={<ProtectedRoute requireAdmin><Units /></ProtectedRoute>} />
            <Route path="/admin/questions" element={<ProtectedRoute requireAdmin><Questions /></ProtectedRoute>} />
            <Route path="/admin/notes" element={<ProtectedRoute requireAdmin><Notes /></ProtectedRoute>} />
            <Route path="/admin/pyqs" element={<ProtectedRoute requireAdmin><PYQs /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><Users /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
