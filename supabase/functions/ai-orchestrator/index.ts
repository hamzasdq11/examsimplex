import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types
type Intent = "FACTUAL" | "CONCEPTUAL" | "MATH" | "CODE" | "GRAPH" | "MIXED";

interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
  type: "internal" | "external";
}

interface OrchestratorResponse {
  content: string;
  citations: Citation[];
  math?: {
    latex: string;
    steps?: string[];
  };
  code?: {
    language: string;
    source: string;
    output?: string;
    executable: boolean;
  };
  graph?: {
    type: "image" | "interactive";
    data: string;
    pythonCode?: string;
  };
  intent: Intent;
  modelUsed: string;
}

// Model routing configuration
const MODEL_ROUTING = {
  classifier: "google/gemini-2.5-flash-lite",
  fast: "google/gemini-2.5-flash",
  default: "google/gemini-3-flash-preview",
  complex: "google/gemini-2.5-pro",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Please sign in to use the AI assistant." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Please sign in to use the AI assistant." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { 
      query, 
      type = "ask", 
      subject, 
      subjectId,
      context,
      conversationHistory = []
    } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing query from user ${user.id}: "${query.slice(0, 50)}..."`);

    // Step 1: Classify intent
    const classificationResponse = await classifyIntent(query, subject, LOVABLE_API_KEY);
    const { intent, needsRetrieval, needsComputation, needsVisualization, suggestedModel } = classificationResponse;

    console.log(`Intent: ${intent}, Model: ${suggestedModel}`);

    // Step 2: Retrieve relevant sources if needed
    let retrievedSources: any[] = [];
    if (needsRetrieval) {
      try {
        const retrievalResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-internal-retrieval`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, subjectId, limit: 5 }),
          }
        );
        
        if (retrievalResponse.ok) {
          const retrievalData = await retrievalResponse.json();
          retrievedSources = retrievalData.sources || [];
        }
      } catch (e) {
        console.error("Retrieval failed:", e);
      }
    }

    // Step 3: Build the system prompt based on intent and type
    const systemPrompt = buildSystemPrompt(type, intent, subject, context, retrievedSources);

    // Step 4: Select model based on classification
    const modelToUse = MODEL_ROUTING[suggestedModel] || MODEL_ROUTING.default;

    // Step 5: Generate response
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-4), // Keep last 4 messages for context
      { role: "user", content: buildUserPrompt(query, type, intent) }
    ];

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages,
        max_tokens: 4000,
        temperature: intent === "MATH" || intent === "CODE" ? 0.3 : 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LLM API error:", response.status, errorText);
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "I couldn't generate a response.";

    // Step 6: Parse and structure the response
    const parsedResponse = parseResponse(rawContent, intent, retrievedSources);

    console.log(`Generated response using ${modelToUse}`);

    return new Response(
      JSON.stringify({
        ...parsedResponse,
        intent,
        modelUsed: modelToUse,
      } as OrchestratorResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-orchestrator:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        content: "I apologize, but I encountered an error. Please try again.",
        citations: [],
        intent: "CONCEPTUAL",
        modelUsed: "error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to classify intent
async function classifyIntent(query: string, subject: string, apiKey: string) {
  try {
    const classificationPrompt = `Classify this query. Respond ONLY with JSON.

Categories: FACTUAL, CONCEPTUAL, MATH, CODE, GRAPH, MIXED

Query: "${query}"
Subject: ${subject || "General"}

JSON format:
{"intent":"CATEGORY","confidence":0.9,"needsRetrieval":true,"needsComputation":false,"needsVisualization":false}`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ROUTING.classifier,
        messages: [{ role: "user", content: classificationPrompt }],
        max_tokens: 150,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error("Classification failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        intent: parsed.intent || "CONCEPTUAL",
        confidence: parsed.confidence || 0.7,
        needsRetrieval: parsed.needsRetrieval ?? true,
        needsComputation: parsed.needsComputation ?? false,
        needsVisualization: parsed.needsVisualization ?? false,
        suggestedModel: determineModel(parsed.intent, parsed.confidence) as "fast" | "default" | "complex",
      };
    }
  } catch (e) {
    console.error("Classification error:", e);
  }

  return {
    intent: "CONCEPTUAL" as Intent,
    confidence: 0.5,
    needsRetrieval: true,
    needsComputation: false,
    needsVisualization: false,
    suggestedModel: "default" as const,
  };
}

function determineModel(intent: string, confidence: number): string {
  if (intent === "MATH" || intent === "MIXED" || intent === "CODE") {
    return "complex";
  }
  if (confidence > 0.9) {
    return "fast";
  }
  return "default";
}

function buildSystemPrompt(
  type: string, 
  intent: Intent, 
  subject: string, 
  context: string,
  sources: any[]
): string {
  let basePrompt = `You are an expert AI study assistant helping university students.
Subject: ${subject || "General"}
Context: ${context || "University curriculum"}

CRITICAL RULES:
1. Use LaTeX for ALL mathematical expressions: inline $x^2$ or block $$\\int f(x)dx$$
2. When citing sources, use [1], [2] etc. in your text
3. For code, use proper markdown code blocks with language specified
4. Be concise but thorough
5. If you include code that can be executed, mark it with \`\`\`python:executable

`;

  // Add retrieved sources as context
  if (sources.length > 0) {
    basePrompt += "\n## Retrieved Knowledge Base Sources:\n";
    sources.forEach((src, idx) => {
      basePrompt += `\n[${idx + 1}] ${src.title}\n${src.content}\nURL: ${src.url}\n`;
    });
    basePrompt += "\nCite these sources when relevant using [1], [2], etc.\n";
  }

  // Add intent-specific instructions
  switch (intent) {
    case "MATH":
      basePrompt += `
## Math Instructions:
- Show step-by-step derivations
- Use LaTeX for all equations
- Verify calculations mentally
- Include the final answer clearly
- If a graph would help, provide Python matplotlib code marked as executable
`;
      break;
    case "CODE":
      basePrompt += `
## Code Instructions:
- Provide working, executable Python code
- Include comments explaining each step
- Show expected output
- Mark executable code blocks with \`\`\`python:executable
`;
      break;
    case "GRAPH":
      basePrompt += `
## Visualization Instructions:
- Provide Python matplotlib/plotly code for graphs
- Mark visualization code with \`\`\`python:executable
- Explain what the graph shows
`;
      break;
  }

  // Add type-specific instructions
  switch (type) {
    case "notes":
      basePrompt += `
## Note Generation:
- Create structured, exam-ready notes
- Use headings, bullet points, and key highlights
- Include important formulas and definitions
- Add memory aids where helpful
`;
      break;
    case "quiz":
      basePrompt += `
## Quiz Generation:
- Create 5 MCQ questions with 4 options each
- Vary difficulty levels
- After questions, provide ANSWER KEY with explanations
- Mark correct answers clearly
`;
      break;
  }

  return basePrompt;
}

function buildUserPrompt(query: string, type: string, intent: Intent): string {
  switch (type) {
    case "notes":
      return `Create detailed study notes on: ${query}`;
    case "quiz":
      return `Create practice MCQ questions on: ${query}`;
    default:
      return query;
  }
}

function parseResponse(content: string, intent: Intent, sources: any[]): Partial<OrchestratorResponse> {
  const citations: Citation[] = sources.map((src, idx) => ({
    id: idx + 1,
    title: src.title,
    url: src.url,
    snippet: src.content.slice(0, 150) + "...",
    type: "internal" as const,
  }));

  // Extract code blocks
  const codeMatch = content.match(/```(python(?::executable)?)\n([\s\S]*?)```/);
  let code: OrchestratorResponse["code"] | undefined;
  if (codeMatch) {
    code = {
      language: "python",
      source: codeMatch[2].trim(),
      executable: codeMatch[1].includes(":executable"),
    };
  }

  // Extract LaTeX blocks for math
  let math: OrchestratorResponse["math"] | undefined;
  const latexMatch = content.match(/\$\$([\s\S]*?)\$\$/);
  if (latexMatch && (intent === "MATH" || intent === "MIXED")) {
    math = {
      latex: latexMatch[1].trim(),
    };
  }

  // Check if there's graph-generating code
  let graph: OrchestratorResponse["graph"] | undefined;
  if (code?.executable && (code.source.includes("plt.") || code.source.includes("plotly"))) {
    graph = {
      type: "image",
      data: "", // Will be populated by frontend execution
      pythonCode: code.source,
    };
  }

  return {
    content,
    citations,
    math,
    code,
    graph,
  };
}
