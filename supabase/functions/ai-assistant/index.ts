import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user using the service role to validate the token
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Please sign in to use the AI assistant." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Use service role client to validate the token
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.log("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Please sign in to use the AI assistant." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated request from user: ${user.id}`);

    const { type, message, subject, context } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your OpenAI API key." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response generated";

    console.log(`Successfully generated ${type} response with GPT-4o`);

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
