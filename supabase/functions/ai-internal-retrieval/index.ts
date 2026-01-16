import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export interface RetrievedSource {
  id: string;
  type: "notes" | "pyq" | "question" | "unit";
  title: string;
  content: string;
  url: string;
  metadata: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, subjectId, limit = 5 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const sources: RetrievedSource[] = [];
    const searchTerms = query.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);

    // 1. Search in notes (chapter titles and points)
    let notesQuery = supabase
      .from("notes")
      .select(`
        id,
        chapter_title,
        points,
        unit:units!inner (
          id,
          name,
          number,
          subject:subjects!inner (
            id,
            name,
            slug,
            semester:semesters!inner (
              course:courses!inner (
                university:universities!inner (
                  slug
                )
              )
            )
          )
        )
      `)
      .limit(limit);

    // Text search on chapter title
    if (searchTerms.length > 0) {
      notesQuery = notesQuery.ilike("chapter_title", `%${searchTerms[0]}%`);
    }

    if (subjectId) {
      notesQuery = notesQuery.eq("unit.subject_id", subjectId);
    }

    const { data: notes, error: notesError } = await notesQuery;

    if (!notesError && notes) {
      for (const note of notes) {
        const unit = note.unit as any;
        const subject = unit?.subject;
        const university = subject?.semester?.course?.university;
        
        // Extract text from points JSON
        let pointsText = "";
        if (Array.isArray(note.points)) {
          pointsText = note.points.map((p: any) => {
            if (typeof p === "string") return p;
            if (p.text) return p.text;
            if (p.content) return p.content;
            return JSON.stringify(p);
          }).join("\n");
        }

        sources.push({
          id: note.id,
          type: "notes",
          title: `${note.chapter_title} (Unit ${unit?.number}: ${unit?.name})`,
          content: pointsText.slice(0, 500) + (pointsText.length > 500 ? "..." : ""),
          url: `/${university?.slug}/${subject?.slug}?tab=notes&unit=${unit?.id}`,
          metadata: {
            subjectName: subject?.name,
            unitName: unit?.name,
            unitNumber: unit?.number,
          },
        });
      }
    }

    // 2. Search in PYQ questions
    let pyqQuery = supabase
      .from("pyq_questions")
      .select(`
        id,
        question,
        answer,
        marks,
        pyq_paper:pyq_papers!inner (
          id,
          year,
          subject:subjects!inner (
            id,
            name,
            slug,
            semester:semesters!inner (
              course:courses!inner (
                university:universities!inner (
                  slug
                )
              )
            )
          )
        )
      `)
      .limit(limit);

    if (searchTerms.length > 0) {
      pyqQuery = pyqQuery.ilike("question", `%${searchTerms[0]}%`);
    }

    if (subjectId) {
      pyqQuery = pyqQuery.eq("pyq_paper.subject_id", subjectId);
    }

    const { data: pyqs, error: pyqError } = await pyqQuery;

    if (!pyqError && pyqs) {
      for (const pyq of pyqs) {
        const paper = pyq.pyq_paper as any;
        const subject = paper?.subject;
        const university = subject?.semester?.course?.university;

        sources.push({
          id: pyq.id,
          type: "pyq",
          title: `PYQ ${paper?.year}: ${pyq.question.slice(0, 100)}...`,
          content: pyq.question + (pyq.answer ? `\n\nAnswer: ${pyq.answer}` : ""),
          url: `/${university?.slug}/${subject?.slug}?tab=pyqs`,
          metadata: {
            year: paper?.year,
            marks: pyq.marks,
            subjectName: subject?.name,
          },
        });
      }
    }

    // 3. Search in important questions
    let iqQuery = supabase
      .from("important_questions")
      .select(`
        id,
        question,
        marks,
        frequency,
        subject:subjects!inner (
          id,
          name,
          slug,
          semester:semesters!inner (
            course:courses!inner (
              university:universities!inner (
                slug
              )
            )
          )
        )
      `)
      .limit(limit);

    if (searchTerms.length > 0) {
      iqQuery = iqQuery.ilike("question", `%${searchTerms[0]}%`);
    }

    if (subjectId) {
      iqQuery = iqQuery.eq("subject_id", subjectId);
    }

    const { data: importantQuestions, error: iqError } = await iqQuery;

    if (!iqError && importantQuestions) {
      for (const iq of importantQuestions) {
        const subject = iq.subject as any;
        const university = subject?.semester?.course?.university;

        sources.push({
          id: iq.id,
          type: "question",
          title: `Important (${iq.frequency}): ${iq.question.slice(0, 100)}...`,
          content: iq.question,
          url: `/${university?.slug}/${subject?.slug}?tab=questions`,
          metadata: {
            frequency: iq.frequency,
            marks: iq.marks,
            subjectName: subject?.name,
          },
        });
      }
    }

    // 4. Get unit information for syllabus context
    if (subjectId) {
      const { data: units, error: unitsError } = await supabase
        .from("units")
        .select(`
          id,
          name,
          number,
          weight,
          subject:subjects!inner (
            id,
            name,
            slug,
            semester:semesters!inner (
              course:courses!inner (
                university:universities!inner (
                  slug
                )
              )
            )
          )
        `)
        .eq("subject_id", subjectId)
        .order("number");

      if (!unitsError && units) {
        const subject = units[0]?.subject as any;
        const university = subject?.semester?.course?.university;
        
        sources.push({
          id: "syllabus",
          type: "unit",
          title: `${subject?.name} Syllabus Structure`,
          content: units.map(u => `Unit ${u.number}: ${u.name} (Weight: ${u.weight}%)`).join("\n"),
          url: `/${university?.slug}/${subject?.slug}`,
          metadata: {
            unitCount: units.length,
            subjectName: subject?.name,
          },
        });
      }
    }

    console.log(`Retrieved ${sources.length} sources for query: "${query.slice(0, 50)}..."`);

    return new Response(
      JSON.stringify({ 
        sources,
        query,
        totalFound: sources.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-internal-retrieval:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Retrieval failed",
        sources: [],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
