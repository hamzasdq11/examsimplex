import { memo, useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface MathRendererProps {
  latex: string;
  display?: "inline" | "block";
  className?: string;
}

// Memoized component to prevent unnecessary re-renders
export const MathRenderer = memo(function MathRenderer({
  latex,
  display = "inline",
  className = "",
}: MathRendererProps) {
  const [error, setError] = useState<string | null>(null);

  // Clean the latex string
  const cleanLatex = latex
    .replace(/^\s+|\s+$/g, "") // Trim whitespace
    .replace(/\\\\/g, "\\") // Fix double backslashes from JSON
    .replace(/&amp;/g, "&") // Fix HTML entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  if (error) {
    return (
      <span className={`text-destructive text-sm ${className}`} title={error}>
        [Math Error: {cleanLatex.slice(0, 20)}...]
      </span>
    );
  }

  try {
    if (display === "block") {
      return (
        <div className={`my-4 overflow-x-auto ${className}`}>
          <BlockMath
            math={cleanLatex}
            errorColor="#ef4444"
            renderError={(err) => {
              console.error("KaTeX error:", err);
              return (
                <span className="text-destructive text-sm">
                  [Math rendering error]
                </span>
              );
            }}
          />
        </div>
      );
    }

    return (
      <span className={className}>
        <InlineMath
          math={cleanLatex}
          errorColor="#ef4444"
          renderError={(err) => {
            console.error("KaTeX error:", err);
            return (
              <span className="text-destructive text-sm">[Math error]</span>
            );
          }}
        />
      </span>
    );
  } catch (e) {
    console.error("MathRenderer error:", e);
    return (
      <span className={`text-muted-foreground italic ${className}`}>
        {cleanLatex}
      </span>
    );
  }
});

// Helper component to render mixed content with math
interface MixedMathContentProps {
  content: string;
  className?: string;
}

export function MixedMathContent({ content, className }: MixedMathContentProps) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // Match block math first ($$...$$)
  const blockPattern = /\$\$([\s\S]*?)\$\$/g;
  let match;

  while ((match = blockPattern.exec(content)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>{content.slice(lastIndex, match.index)}</span>
      );
    }

    // Add block math
    parts.push(
      <MathRenderer key={key++} latex={match[1]} display="block" />
    );

    lastIndex = match.index + match[0].length;
  }

  // Process remaining content for inline math
  const remainingContent = content.slice(lastIndex);
  if (remainingContent) {
    const inlinePattern = /\$([^\$\n]+?)\$/g;
    let inlineLastIndex = 0;
    let inlineMatch;

    while ((inlineMatch = inlinePattern.exec(remainingContent)) !== null) {
      if (inlineMatch.index > inlineLastIndex) {
        parts.push(
          <span key={key++}>
            {remainingContent.slice(inlineLastIndex, inlineMatch.index)}
          </span>
        );
      }

      parts.push(
        <MathRenderer key={key++} latex={inlineMatch[1]} display="inline" />
      );

      inlineLastIndex = inlineMatch.index + inlineMatch[0].length;
    }

    if (inlineLastIndex < remainingContent.length) {
      parts.push(
        <span key={key++}>{remainingContent.slice(inlineLastIndex)}</span>
      );
    }
  }

  return <div className={className}>{parts}</div>;
}
