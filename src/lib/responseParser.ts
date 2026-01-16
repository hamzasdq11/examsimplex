// Response parser for AI chat messages
// Parses markdown content and extracts structured segments

export type SegmentType = "text" | "citation" | "math" | "code" | "graph";

export interface TextSegment {
  type: "text";
  content: string;
}

export interface CitationSegment {
  type: "citation";
  id: number;
}

export interface MathSegment {
  type: "math";
  latex: string;
  display: "inline" | "block";
}

export interface CodeSegment {
  type: "code";
  language: string;
  content: string;
  executable: boolean;
}

export interface GraphSegment {
  type: "graph";
  pythonCode: string;
}

export type Segment = TextSegment | CitationSegment | MathSegment | CodeSegment | GraphSegment;

export interface ParsedResponse {
  segments: Segment[];
  hasExecutableCode: boolean;
  hasMath: boolean;
  hasGraph: boolean;
}

// Regular expressions for parsing
const PATTERNS = {
  // Block math: $$...$$ 
  blockMath: /\$\$([\s\S]*?)\$\$/g,
  // Inline math: $...$
  inlineMath: /\$([^\$\n]+?)\$/g,
  // Code blocks: ```language:executable or ```language
  codeBlock: /```([\w]+)(?::executable)?\n([\s\S]*?)```/g,
  // Citations: [1], [2], etc.
  citation: /\[(\d+)\]/g,
};

export function parseAIResponse(content: string): ParsedResponse {
  const segments: Segment[] = [];
  let hasExecutableCode = false;
  let hasMath = false;
  let hasGraph = false;

  // First, extract code blocks to prevent interference
  const codeBlocks: { placeholder: string; segment: CodeSegment }[] = [];
  let processedContent = content.replace(PATTERNS.codeBlock, (match, lang, code) => {
    const isExecutable = match.includes(":executable");
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    
    const segment: CodeSegment = {
      type: "code",
      language: lang.replace(":executable", ""),
      content: code.trim(),
      executable: isExecutable,
    };
    
    if (isExecutable) {
      hasExecutableCode = true;
      // Check if it's graph-generating code
      if (code.includes("plt.") || code.includes("plotly") || code.includes("matplotlib")) {
        hasGraph = true;
      }
    }
    
    codeBlocks.push({ placeholder, segment });
    return placeholder;
  });

  // Extract block math
  const mathBlocks: { placeholder: string; segment: MathSegment }[] = [];
  processedContent = processedContent.replace(PATTERNS.blockMath, (match, latex) => {
    const placeholder = `__MATH_BLOCK_${mathBlocks.length}__`;
    mathBlocks.push({
      placeholder,
      segment: {
        type: "math",
        latex: latex.trim(),
        display: "block",
      },
    });
    hasMath = true;
    return placeholder;
  });

  // Now split by lines and process
  const lines = processedContent.split("\n");
  let currentText = "";

  const flushText = () => {
    if (currentText.trim()) {
      // Process inline elements in the text
      const inlineSegments = parseInlineElements(currentText);
      segments.push(...inlineSegments);
      currentText = "";
    }
  };

  for (const line of lines) {
    // Check for code block placeholder
    const codeMatch = line.match(/__CODE_BLOCK_(\d+)__/);
    if (codeMatch) {
      flushText();
      const idx = parseInt(codeMatch[1]);
      segments.push(codeBlocks[idx].segment);
      continue;
    }

    // Check for math block placeholder
    const mathMatch = line.match(/__MATH_BLOCK_(\d+)__/);
    if (mathMatch) {
      flushText();
      const idx = parseInt(mathMatch[1]);
      segments.push(mathBlocks[idx].segment);
      continue;
    }

    currentText += line + "\n";
  }

  flushText();

  return {
    segments,
    hasExecutableCode,
    hasMath,
    hasGraph,
  };
}

function parseInlineElements(text: string): Segment[] {
  const segments: Segment[] = [];
  let remaining = text;
  let lastIndex = 0;

  // Create a combined pattern for inline elements
  const combinedPattern = /(\$[^\$\n]+?\$)|(\[\d+\])/g;
  let match;

  while ((match = combinedPattern.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        segments.push({ type: "text", content: textBefore });
      }
    }

    if (match[1]) {
      // Inline math
      const latex = match[1].slice(1, -1); // Remove $ delimiters
      segments.push({
        type: "math",
        latex,
        display: "inline",
      });
    } else if (match[2]) {
      // Citation
      const citationId = parseInt(match[2].slice(1, -1));
      segments.push({
        type: "citation",
        id: citationId,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText.trim()) {
      segments.push({ type: "text", content: remainingText });
    }
  }

  // If no segments were created, return the whole text
  if (segments.length === 0 && text.trim()) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}

// Helper to extract just text content (for copy functionality)
export function extractTextContent(segments: Segment[]): string {
  return segments
    .map((seg) => {
      switch (seg.type) {
        case "text":
          return seg.content;
        case "math":
          return seg.display === "block" ? `$$${seg.latex}$$` : `$${seg.latex}$`;
        case "code":
          return `\`\`\`${seg.language}\n${seg.content}\n\`\`\``;
        case "citation":
          return `[${seg.id}]`;
        case "graph":
          return `[Graph]`;
        default:
          return "";
      }
    })
    .join("");
}

// Check if content has any special elements
export function hasSpecialContent(content: string): boolean {
  return (
    PATTERNS.blockMath.test(content) ||
    PATTERNS.inlineMath.test(content) ||
    PATTERNS.codeBlock.test(content) ||
    PATTERNS.citation.test(content)
  );
}
