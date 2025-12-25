import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, subject, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = message;

    switch (type) {
      case "ask":
        systemPrompt = `You are an expert tutor helping university students understand complex concepts. 
You provide clear, concise explanations tailored to the student's course and university syllabus.
Subject context: ${subject || "General"}
University context: ${context || "General university curriculum"}
Always be encouraging and break down complex topics into digestible parts.`;
        break;

      case "notes":
        systemPrompt = `You are an expert at creating structured, exam-ready study notes.
Create comprehensive notes that are:
- Well-organized with clear headings and subheadings
- Include key definitions, formulas, and concepts
- Highlight important points that are likely to appear in exams
- Use bullet points for easy scanning
- Include memory aids and mnemonics where helpful
Subject: ${subject || "General"}`;
        userPrompt = `Create detailed study notes on: ${message}`;
        break;

      case "quiz":
        systemPrompt = `You are an expert exam question creator for university students.
Create practice questions that:
- Match the style of university exams
- Include a mix of difficulty levels
- Cover key concepts thoroughly
- Provide detailed explanations for answers
Format: Provide 5 multiple choice questions with 4 options each (A, B, C, D).
After all questions, provide an ANSWER KEY with brief explanations.
Subject: ${subject || "General"}`;
        userPrompt = `Create practice MCQ questions on: ${message}`;
        break;

      default:
        systemPrompt = "You are a helpful educational assistant.";
    }

    console.log(`Processing ${type} request for subject: ${subject}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response generated";

    console.log(`Successfully generated ${type} response`);

    return new Response(
      JSON.stringify({ content, type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-assistant function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
