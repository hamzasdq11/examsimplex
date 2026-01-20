import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubjectAIChat } from '@/components/SubjectAIChat';
import { SEO } from '@/components/SEO';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id: string;
  name: string;
  code: string;
  slug: string;
}

export default function AIStudyMode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  const initialQuery = searchParams.get('q') || '';
  const subjectId = searchParams.get('subject');

  useEffect(() => {
    async function fetchSubject() {
      if (subjectId) {
        const { data } = await supabase
          .from('subjects')
          .select('id, name, code, slug')
          .eq('id', subjectId)
          .single();
        
        if (data) {
          setSubject(data);
        }
      }
      setLoading(false);
    }

    fetchSubject();
  }, [subjectId]);

  // Create a mock subject for general AI study mode
  const generalSubject: Subject = {
    id: 'general',
    name: 'General Study',
    code: 'AI',
    slug: 'general'
  };

  const activeSubject = subject || generalSubject;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading AI Study Mode...</div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="AI Study Mode | ExamSimplex"
        description="Get personalized study help with AI-powered explanations, quiz questions, and exam preparation."
      />
      
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-14 items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex-1">
              <h1 className="text-sm font-medium">
                AI Study Mode
                {subject && (
                  <span className="text-muted-foreground ml-2">
                    • {subject.name}
                  </span>
                )}
              </h1>
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 container py-4">
          <SubjectAIChat 
            subject={activeSubject}
            universityName="AKTU"
            initialQuery={initialQuery}
          />
        </main>
      </div>
    </>
  );
}
