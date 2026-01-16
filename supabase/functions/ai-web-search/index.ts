import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebSource {
  id: number;
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
}

interface WebSearchResult {
  success: boolean;
  sources: WebSource[];
  summary?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, subject, limit = 5 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required", sources: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    
    if (!PERPLEXITY_API_KEY) {
      console.error("PERPLEXITY_API_KEY not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Web search not configured",
          sources: [] 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Web search for: "${query.slice(0, 50)}..." (subject: ${subject || "general"})`);

    // Build search query with subject context
    const enhancedQuery = subject 
      ? `${query} (in the context of ${subject} for university students)`
      : query;

    // Call Perplexity API with sonar model for grounded search
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `You are a research assistant helping university students find accurate information. 
Provide factual, well-sourced answers. Focus on educational and authoritative sources.`
          },
          {
            role: "user",
            content: enhancedQuery
          }
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Rate limit exceeded. Please try again later.",
            sources: [] 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    // Transform citations into WebSource format
    const sources: WebSource[] = citations.slice(0, limit).map((url: string, idx: number) => ({
      id: idx + 1,
      title: extractDomain(url),
      url,
      snippet: "", // Perplexity doesn't provide snippets per citation
      relevanceScore: 1 - (idx * 0.1), // Decreasing relevance based on order
    }));

    console.log(`Web search found ${sources.length} sources`);

    const result: WebSearchResult = {
      success: true,
      sources,
      summary: content,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-web-search:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Web search failed",
        sources: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return "Source";
  }
}
