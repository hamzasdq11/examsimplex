import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Building2, GraduationCap, BookOpen, HelpCircle, FileText, FileQuestion, Users } from 'lucide-react';

interface Stats {
  universities: number;
  courses: number;
  subjects: number;
  questions: number;
  notes: number;
  pyqPapers: number;
  users: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    universities: 0,
    courses: 0,
    subjects: 0,
    questions: 0,
    notes: 0,
    pyqPapers: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: universities },
          { count: courses },
          { count: subjects },
          { count: questions },
          { count: notes },
          { count: pyqPapers },
          { count: users },
        ] = await Promise.all([
          supabase.from('universities').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('subjects').select('*', { count: 'exact', head: true }),
          supabase.from('important_questions').select('*', { count: 'exact', head: true }),
          supabase.from('notes').select('*', { count: 'exact', head: true }),
          supabase.from('pyq_papers').select('*', { count: 'exact', head: true }),
          supabase.from('user_roles').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          universities: universities || 0,
          courses: courses || 0,
          subjects: subjects || 0,
          questions: questions || 0,
          notes: notes || 0,
          pyqPapers: pyqPapers || 0,
          users: users || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Universities', value: stats.universities, icon: Building2, color: 'text-blue-500' },
    { title: 'Courses', value: stats.courses, icon: GraduationCap, color: 'text-green-500' },
    { title: 'Subjects', value: stats.subjects, icon: BookOpen, color: 'text-purple-500' },
    { title: 'Questions', value: stats.questions, icon: HelpCircle, color: 'text-orange-500' },
    { title: 'Notes', value: stats.notes, icon: FileText, color: 'text-pink-500' },
    { title: 'PYQ Papers', value: stats.pyqPapers, icon: FileQuestion, color: 'text-cyan-500' },
    { title: 'Admin Users', value: stats.users, icon: Users, color: 'text-red-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your content management system</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Use the sidebar to navigate to different sections and manage your content.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mt-4">
                <li>• Add universities and their courses</li>
                <li>• Create subjects with exam details</li>
                <li>• Add important questions and answers</li>
                <li>• Upload notes for each unit</li>
                <li>• Manage previous year question papers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Follow these steps to set up your content:
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 mt-4 list-decimal list-inside">
                <li>Add a university</li>
                <li>Create courses for the university</li>
                <li>Add semesters to each course</li>
                <li>Create subjects with units</li>
                <li>Add questions, notes, and PYQs</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
