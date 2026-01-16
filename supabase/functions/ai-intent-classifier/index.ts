import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Intent categories for routing
export type Intent = 
  | "FACTUAL"      // Needs external search for facts/definitions
  | "CONCEPTUAL"   // Explanation from knowledge base
  | "MATH"         // Requires mathematical computation
  | "CODE"         // Generate or explain code
  | "GRAPH"        // Visualization/plotting needed
  | "MIXED";       // Combination (e.g., math + graph)

interface ClassificationResult {
  intent: Intent;
  confidence: number;
  needsRetrieval: boolean;
  needsComputation: boolean;
  needsVisualization: boolean;
  suggestedModel: "fast" | "default" | "complex";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, subject } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use fast model for classification - Gemini Flash Lite
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const classificationPrompt = `Classify the following user query into exactly ONE category. Respond with ONLY a JSON object.

Categories:
- FACTUAL: Questions about facts, definitions, history, or information that needs external sources
- CONCEPTUAL: Questions asking for explanations, understanding concepts, how things work
- MATH: Questions requiring mathematical computation, derivations, equations, proofs
- CODE: Questions about programming, code generation, debugging, algorithms
- GRAPH: Questions explicitly asking for visualizations, plots, charts, or diagrams
- MIXED: Complex questions combining multiple categories (e.g., "solve this equation and plot it")

Query: "${query}"
Subject context: ${subject || "General"}

Respond with this exact JSON format:
{
  "intent": "CATEGORY_NAME",
  "confidence": 0.0-1.0,
  "needsRetrieval": true/false,
  "needsComputation": true/false,
  "needsVisualization": true/false
}`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "user", content: classificationPrompt }
        ],
        max_tokens: 200,
        temperature: 0.1, // Low temperature for consistent classification
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Classification API error:", response.status, errorText);
      throw new Error(`Classification API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON response
    let classification: ClassificationResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and set defaults
      const validIntents: Intent[] = ["FACTUAL", "CONCEPTUAL", "MATH", "CODE", "GRAPH", "MIXED"];
      const intent = validIntents.includes(parsed.intent) ? parsed.intent : "CONCEPTUAL";
      
      // Determine suggested model based on intent
      let suggestedModel: "fast" | "default" | "complex" = "default";
      if (intent === "MATH" || intent === "MIXED" || intent === "CODE") {
        suggestedModel = "complex";
      } else if (parsed.confidence > 0.9 && !parsed.needsRetrieval) {
        suggestedModel = "fast";
      }

      classification = {
        intent,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
        needsRetrieval: parsed.needsRetrieval ?? (intent === "FACTUAL" || intent === "CONCEPTUAL"),
        needsComputation: parsed.needsComputation ?? (intent === "MATH" || intent === "MIXED"),
        needsVisualization: parsed.needsVisualization ?? (intent === "GRAPH" || intent === "MIXED"),
        suggestedModel,
      };
    } catch (parseError) {
      console.error("Failed to parse classification:", parseError, content);
      // Default to CONCEPTUAL if parsing fails
      classification = {
        intent: "CONCEPTUAL",
        confidence: 0.5,
        needsRetrieval: true,
        needsComputation: false,
        needsVisualization: false,
        suggestedModel: "default",
      };
    }

    console.log(`Classified query as: ${classification.intent} (confidence: ${classification.confidence})`);

    return new Response(
      JSON.stringify(classification),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-intent-classifier:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Classification failed",
        // Fallback classification
        intent: "CONCEPTUAL",
        confidence: 0.5,
        needsRetrieval: true,
        needsComputation: false,
        needsVisualization: false,
        suggestedModel: "default"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
