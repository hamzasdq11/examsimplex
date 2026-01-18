import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============== STRICT TYPE DEFINITIONS ==============
type Intent = "FACTUAL" | "CONCEPTUAL" | "MATH" | "CODE" | "GRAPH" | "MIXED";

// Strict output schema - ALL responses MUST conform to one of these
type AIResponseType = 
  | { type: "math"; python: string; explanation: string; latex?: string; steps?: string[] }
  | { type: "graph"; python: string; description: string }
  | { type: "code"; language: string; source: string; explanation: string; executable: boolean }
  | { type: "answer"; text: string; citations: Citation[] };

interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
  source: "internal" | "web";
}

interface OrchestratorResponse {
  success: boolean;
  response: AIResponseType;
  intent: Intent;
  confidence: number;
  modelUsed: string;
  processingTime: number;
}

// ============== MODEL ROUTING CONFIGURATION ==============
const MODEL_ROUTING = {
  // Task-specific model selection
  intent_classifier: "google/gemini-2.5-flash-lite",  // Fast, cheap for classification
  query_rewriter: "google/gemini-2.5-flash-lite",     // Fast for rewrites
  reasoning: "google/gemini-2.5-pro",                  // Flagship for complex reasoning
  generation: "google/gemini-3-flash-preview",         // Default balanced model
  math_solver: "google/gemini-2.5-pro",                // Complex math needs flagship
  code_generator: "google/gemini-2.5-pro",             // Code needs precision
};

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Please sign in to use the AI assistant.",
          response: { type: "answer", text: "Please sign in to continue.", citations: [] },
          intent: "CONCEPTUAL",
          confidence: 0,
          modelUsed: "none",
          processingTime: 0
        }),
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
        JSON.stringify({ 
          success: false,
          error: "Please sign in to use the AI assistant.",
          response: { type: "answer", text: "Please sign in to continue.", citations: [] },
          intent: "CONCEPTUAL",
          confidence: 0,
          modelUsed: "none",
          processingTime: 0
        }),
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
        JSON.stringify({ 
          success: false,
          error: "Query is required",
          response: { type: "answer", text: "Please provide a question.", citations: [] },
          intent: "CONCEPTUAL",
          confidence: 0,
          modelUsed: "none",
          processingTime: 0
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`[${user.id}] Processing: "${query.slice(0, 50)}..."`);

    // ============== STEP 1: CLASSIFY INTENT (Fast model) ==============
    const classification = await classifyIntent(query, subject, LOVABLE_API_KEY);
    const { intent, confidence, needsRetrieval, needsWebSearch, needsComputation, needsVisualization } = classification;

    console.log(`Intent: ${intent} (${(confidence * 100).toFixed(0)}%), Web: ${needsWebSearch}, Retrieval: ${needsRetrieval}`);

    // ============== STEP 2: PARALLEL RETRIEVAL ==============
    const retrievalPromises: Promise<any>[] = [];
    
    // Internal knowledge base retrieval
    if (needsRetrieval && subjectId) {
      retrievalPromises.push(
        fetchInternalSources(subjectId, query).catch(e => {
          console.error("Internal retrieval failed:", e);
          return [];
        })
      );
    } else {
      retrievalPromises.push(Promise.resolve([]));
    }
    
    // Web search for factual/current information
    if (needsWebSearch) {
      retrievalPromises.push(
        fetchWebSources(query, subject).catch(e => {
          console.error("Web search failed:", e);
          return { sources: [], summary: "" };
        })
      );
    } else {
      retrievalPromises.push(Promise.resolve({ sources: [], summary: "" }));
    }

    const [internalSources, webResult] = await Promise.all(retrievalPromises);

    // ============== STEP 3: SELECT MODEL BASED ON TASK ==============
    const modelToUse = selectModelForTask(intent, confidence, needsComputation);

    // ============== STEP 4: GENERATE RESPONSE WITH STRICT SCHEMA ==============
    const systemPrompt = buildSystemPrompt(
      type, 
      intent, 
      subject, 
      context, 
      internalSources, 
      webResult.sources || [],
      webResult.summary || ""
    );

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-4),
      { role: "user", content: buildUserPrompt(query, type, intent) }
    ];

    // Use tool calling to enforce strict JSON output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages,
        max_tokens: 4000,
        temperature: intent === "MATH" || intent === "CODE" ? 0.2 : 0.6,
        tools: [
          {
            type: "function",
            function: {
              name: "submit_response",
              description: "Submit a structured response to the user query",
              parameters: {
                type: "object",
                properties: {
                  response_type: {
                    type: "string",
                    enum: ["math", "graph", "code", "answer"],
                    description: "Type of response: math for equations, graph for visualizations, code for programming, answer for text"
                  },
                  content: {
                    type: "object",
                    properties: {
                      text: { type: "string", description: "Main text explanation or answer" },
                      explanation: { type: "string", description: "Detailed explanation" },
                      description: { type: "string", description: "Description of visualization/output" },
                      python: { type: "string", description: "Python code for math or graph" },
                      code: { type: "string", description: "Code content (alias for python/source)" },
                      source: { type: "string", description: "Source code" },
                      language: { type: "string", description: "Programming language" },
                      latex: { type: "string", description: "LaTeX formula" },
                      steps: { type: "array", items: { type: "string" }, description: "Step-by-step solution" },
                      executable: { type: "boolean", description: "Whether code is executable" }
                    },
                    description: "Response content - include relevant fields based on response_type"
                  },
                  confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                    description: "Confidence in the answer (0-1)"
                  }
                },
                required: ["response_type", "content", "confidence"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "submit_response" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LLM API error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add funds to continue.");
      }
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let structuredResponse: AIResponseType;
    let responseConfidence = confidence;

    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        structuredResponse = parseToolResponse(args, internalSources, webResult.sources || []);
        responseConfidence = args.confidence || confidence;
      } catch (e) {
        console.error("Failed to parse tool response:", e);
        // Fallback to raw content parsing
        const rawContent = data.choices?.[0]?.message?.content || "";
        structuredResponse = parseFallbackResponse(rawContent, intent, internalSources, webResult.sources || []);
      }
    } else {
      // Fallback if no tool call
      const rawContent = data.choices?.[0]?.message?.content || "";
      structuredResponse = parseFallbackResponse(rawContent, intent, internalSources, webResult.sources || []);
    }

    const processingTime = Date.now() - startTime;
    console.log(`Generated response using ${modelToUse} in ${processingTime}ms`);

    const result: OrchestratorResponse = {
      success: true,
      response: structuredResponse,
      intent,
      confidence: responseConfidence,
      modelUsed: modelToUse,
      processingTime
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("Error in ai-orchestrator:", error);
    
    const errorResponse: OrchestratorResponse = {
      success: false,
      response: { 
        type: "answer", 
        text: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        citations: [] 
      },
      intent: "CONCEPTUAL",
      confidence: 0,
      modelUsed: "error",
      processingTime
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============== INTENT CLASSIFICATION ==============
async function classifyIntent(query: string, subject: string, apiKey: string) {
  try {
    const classificationPrompt = `Classify this query. Respond ONLY with valid JSON, no markdown.

Categories:
- FACTUAL: Needs external/web search for facts, current events, definitions
- CONCEPTUAL: Explanation from knowledge, understanding concepts
- MATH: Mathematical computation, equations, proofs, derivations
- CODE: Programming, algorithms, code generation
- GRAPH: Visualization, plots, charts, diagrams
- MIXED: Combination requiring multiple approaches

Query: "${query}"
Subject: ${subject || "General"}

JSON format (no markdown):
{"intent":"CATEGORY","confidence":0.9,"needsRetrieval":true,"needsWebSearch":false,"needsComputation":false,"needsVisualization":false}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ROUTING.intent_classifier,
        messages: [{ role: "user", content: classificationPrompt }],
        max_tokens: 150,
        temperature: 0.1,
      }),
    });

    if (!response.ok) throw new Error("Classification failed");

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        intent: parsed.intent || "CONCEPTUAL" as Intent,
        confidence: parsed.confidence || 0.7,
        needsRetrieval: parsed.needsRetrieval ?? true,
        needsWebSearch: parsed.needsWebSearch ?? (parsed.intent === "FACTUAL"),
        needsComputation: parsed.needsComputation ?? false,
        needsVisualization: parsed.needsVisualization ?? false,
      };
    }
  } catch (e) {
    console.error("Classification error:", e);
  }

  return {
    intent: "CONCEPTUAL" as Intent,
    confidence: 0.5,
    needsRetrieval: true,
    needsWebSearch: false,
    needsComputation: false,
    needsVisualization: false,
  };
}

// ============== RETRIEVAL FUNCTIONS ==============
async function fetchInternalSources(subjectId: string, query: string) {
  try {
    const response = await fetch(
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
    
    if (response.ok) {
      const data = await response.json();
      return data.sources || [];
    }
  } catch (e) {
    console.error("Internal retrieval error:", e);
  }
  return [];
}

async function fetchWebSources(query: string, subject: string) {
  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-web-search`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, subject, limit: 5 }),
      }
    );
    
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.error("Web search error:", e);
  }
  return { sources: [], summary: "" };
}

// ============== MODEL SELECTION ==============
function selectModelForTask(intent: Intent, confidence: number, needsComputation: boolean): string {
  // Complex reasoning tasks → flagship model
  if (intent === "MATH" || needsComputation) {
    return MODEL_ROUTING.math_solver;
  }
  
  // Code generation → needs precision
  if (intent === "CODE") {
    return MODEL_ROUTING.code_generator;
  }
  
  // Mixed/complex queries → reasoning model
  if (intent === "MIXED" || confidence < 0.7) {
    return MODEL_ROUTING.reasoning;
  }
  
  // Standard queries → balanced model
  return MODEL_ROUTING.generation;
}

// ============== PROMPT BUILDING ==============
function buildSystemPrompt(
  type: string, 
  intent: Intent, 
  subject: string, 
  context: string,
  internalSources: any[],
  webSources: any[],
  webSummary: string
): string {
  let prompt = `You are an expert AI study assistant for university students.
Subject: ${subject || "General"}
Context: ${context || "University curriculum"}

CRITICAL: You MUST respond using the submit_response tool with structured JSON.

RESPONSE TYPES:
1. For math problems → type: "math", include python code for computation and step-by-step explanation
2. For visualizations → type: "graph", include matplotlib/plotly python code
3. For programming → type: "code", include working code with explanation
4. For explanations → type: "answer", include clear text with citations

FORMATTING RULES:
- Use LaTeX for math: inline $x^2$ or block $$\\int f(x)dx$$
- Cite sources using [1], [2] format
- Provide confidence score (0-1) based on certainty
- Be concise but thorough

`;

  // Add retrieved sources
  if (internalSources.length > 0) {
    prompt += "\n## Internal Knowledge Base:\n";
    internalSources.forEach((src, idx) => {
      prompt += `[${idx + 1}] ${src.title}: ${src.content?.slice(0, 300)}...\n`;
    });
  }

  if (webSources.length > 0) {
    prompt += "\n## Web Sources:\n";
    webSources.forEach((src: any, idx: number) => {
      const sourceNum = internalSources.length + idx + 1;
      prompt += `[${sourceNum}] ${src.title} (${src.url})\n`;
    });
    if (webSummary) {
      prompt += `\nWeb Search Summary: ${webSummary.slice(0, 500)}...\n`;
    }
  }

  // Intent-specific instructions
  switch (intent) {
    case "MATH":
      prompt += `
## Math Response Requirements:
- Show complete step-by-step derivation
- Include Python code for verification when applicable
- Use LaTeX for all equations
- Clearly state the final answer
`;
      break;
    case "CODE":
      prompt += `
## Code Response Requirements:
- Provide complete, executable code
- Include detailed comments
- Show expected output
- Explain the algorithm/approach
`;
      break;
    case "GRAPH":
      prompt += `
## Visualization Requirements:
- Provide complete matplotlib/plotly code
- Include axis labels and title
- Explain what the visualization shows
`;
      break;
  }

  return prompt;
}

function buildUserPrompt(query: string, type: string, intent: Intent): string {
  switch (type) {
    case "notes":
      return `Create detailed, exam-ready study notes on: ${query}`;
    case "quiz":
      return `Create 5 MCQ practice questions with explanations on: ${query}`;
    default:
      return query;
  }
}

// ============== RESPONSE PARSING ==============
function parseToolResponse(args: any, internalSources: any[], webSources: any[]): AIResponseType {
  // Debug logging for tool response
  console.log("[DEBUG] Tool response args:", JSON.stringify(args, null, 2));
  
  const allCitations: Citation[] = [
    ...internalSources.map((src, idx) => ({
      id: idx + 1,
      title: src.title || "Note",
      url: src.url || "#",
      snippet: src.content?.slice(0, 150) || "",
      source: "internal" as const
    })),
    ...webSources.map((src: any, idx: number) => ({
      id: internalSources.length + idx + 1,
      title: src.title || "Web Source",
      url: src.url || "#",
      snippet: src.snippet || "",
      source: "web" as const
    }))
  ];

  const responseType = args.response_type;
  const content = args.content || {};

  // Debug: log what fields are being extracted
  console.log(`[DEBUG] Parsing response_type: ${responseType}, content keys: ${Object.keys(content).join(", ")}`);

  switch (responseType) {
    case "math":
      return {
        type: "math",
        python: content.python || content.code || content.source || "",
        explanation: content.explanation || content.text || content.description || "",
        latex: content.latex || content.formula || "",
        steps: Array.isArray(content.steps) ? content.steps : []
      };
    case "graph":
      return {
        type: "graph",
        python: content.python || content.code || content.source || content.plot_code || "",
        description: content.description || content.explanation || content.text || ""
      };
    case "code":
      return {
        type: "code",
        language: content.language || "python",
        source: content.source || content.code || content.python || "",
        explanation: content.explanation || content.text || content.description || "",
        executable: content.executable ?? true
      };
    case "answer":
    default:
      return {
        type: "answer",
        text: content.text || content.explanation || content.description || 
              (typeof content === "string" ? content : JSON.stringify(content)),
        citations: allCitations
      };
  }
}

function parseFallbackResponse(content: string, intent: Intent, internalSources: any[], webSources: any[]): AIResponseType {
  // Debug logging for fallback parsing
  console.log("[DEBUG] Fallback parsing triggered, intent:", intent);
  console.log("[DEBUG] Content preview:", content.slice(0, 200));
  
  const allCitations: Citation[] = [
    ...internalSources.map((src, idx) => ({
      id: idx + 1,
      title: src.title || "Note",
      url: src.url || "#",
      snippet: src.content?.slice(0, 150) || "",
      source: "internal" as const
    })),
    ...webSources.map((src: any, idx: number) => ({
      id: internalSources.length + idx + 1,
      title: src.title || "Web Source",
      url: src.url || "#",
      snippet: src.snippet || "",
      source: "web" as const
    }))
  ];

  // Extract code blocks - more flexible regex
  const codeMatch = content.match(/```(python(?::executable)?|py)\n([\s\S]*?)```/);
  
  // Check for graph-related keywords in content
  const hasGraphKeywords = /\b(plot|graph|chart|visuali[sz]e|matplotlib|pyplot|plt\.)\b/i.test(content);
  
  if (codeMatch && (intent === "MATH" || intent === "MIXED")) {
    return {
      type: "math",
      python: codeMatch[2].trim(),
      explanation: content.replace(codeMatch[0], "").trim()
    };
  }

  // GRAPH intent OR content has graph keywords with code
  if (codeMatch && (intent === "GRAPH" || hasGraphKeywords)) {
    return {
      type: "graph",
      python: codeMatch[2].trim(),
      description: content.replace(codeMatch[0], "").trim()
    };
  }

  if (codeMatch && intent === "CODE") {
    return {
      type: "code",
      language: "python",
      source: codeMatch[2].trim(),
      explanation: content.replace(codeMatch[0], "").trim(),
      executable: codeMatch[1].includes(":executable") || true
    };
  }

  // If there's code but intent wasn't matched, still extract as code
  if (codeMatch) {
    console.log("[DEBUG] Found code block but intent was:", intent, "- treating as code");
    return {
      type: "code",
      language: "python",
      source: codeMatch[2].trim(),
      explanation: content.replace(codeMatch[0], "").trim(),
      executable: true
    };
  }

  // Default to answer type
  return {
    type: "answer",
    text: content,
    citations: allCitations
  };
}
