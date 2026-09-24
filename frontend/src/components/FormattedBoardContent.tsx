"use client";

import React from "react";
import dynamic from "next/dynamic";
import "katex/dist/katex.min.css";

const Latex = dynamic(() => import("react-latex-next"), { ssr: false });

interface FormattedBoardContentProps {
  content: string;
  className?: string;
}

// Helper to render inline formatting: code (`code`), bold (**bold**), and LaTeX ($math$)
function renderInlineContent(text: string): React.ReactNode {
  if (!text) return null;

  // Regex to split by inline code `...` or bold **...**
  // Capturing groups allow us to identify delimiter matches
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return (
    <>
      {tokens.map((token, idx) => {
        if (!token) return null;

        // Inline Code `...`
        if (token.startsWith("`") && token.endsWith("`") && token.length >= 2) {
          const codeText = token.slice(1, -1);
          return (
            <code
              key={idx}
              className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 border border-slate-200/80 font-mono text-[13px] text-indigo-700 font-semibold inline-block align-middle"
            >
              {codeText}
            </code>
          );
        }

        // Bold text **...**
        if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
          const boldText = token.slice(2, -2);
          return (
            <strong key={idx} className="font-bold text-slate-900">
              <Latex strict={false}>{boldText}</Latex>
            </strong>
          );
        }

        // Normal text segment (which may contain LaTeX $...$)
        return <Latex key={idx} strict={false}>{token}</Latex>;
      })}
    </>
  );
}

export default function FormattedBoardContent({ content, className = "" }: FormattedBoardContentProps) {
  if (!content) return null;

  // Normalize newlines
  const rawText = content.replace(/\r\n/g, "\n");

  // Step 1: Extract display math blocks ($$...$$) so line splitting doesn't break multi-line equations
  const parts: { type: "math" | "text"; value: string }[] = [];
  const mathRegex = /\$\$([\s\S]*?)\$\$/g;
  let lastIndex = 0;
  let match;

  while ((match = mathRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: rawText.slice(lastIndex, match.index) });
    }
    parts.push({ type: "math", value: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < rawText.length) {
    parts.push({ type: "text", value: rawText.slice(lastIndex) });
  }

  return (
    <div className={`space-y-3 text-slate-800 leading-relaxed ${className}`}>
      {parts.map((part, pIdx) => {
        if (part.type === "math") {
          return (
            <div
              key={`math-block-${pIdx}`}
              className="my-3 py-3.5 px-4 bg-white/90 rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto text-center flex justify-center items-center"
            >
              <div className="text-base sm:text-lg text-slate-900 font-medium">
                <Latex strict={false}>{`$$${part.value}$$`}</Latex>
              </div>
            </div>
          );
        }

        // Parse text lines into headings, numbered lists, bullet lists, and paragraphs
        const lines = part.value.split("\n");
        const renderedElements: React.ReactNode[] = [];
        let currentParagraph: string[] = [];

        const flushParagraph = (key: string) => {
          if (currentParagraph.length > 0) {
            const paraText = currentParagraph.join(" ").trim();
            if (paraText) {
              renderedElements.push(
                <p key={key} className="text-slate-700 text-sm sm:text-base leading-relaxed my-2">
                  {renderInlineContent(paraText)}
                </p>
              );
            }
            currentParagraph = [];
          }
        };

        lines.forEach((line, lIdx) => {
          const trimmed = line.trim();

          // Empty line separates paragraphs
          if (!trimmed) {
            flushParagraph(`p-empty-${lIdx}`);
            return;
          }

          // Heading 2: ## Title
          if (trimmed.startsWith("## ")) {
            flushParagraph(`p-before-h2-${lIdx}`);
            renderedElements.push(
              <h2
                key={`h2-${lIdx}`}
                className="text-xl sm:text-2xl font-black text-slate-900 mt-5 mb-2.5 pb-1.5 border-b border-slate-200 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                {renderInlineContent(trimmed.slice(3).trim())}
              </h2>
            );
            return;
          }

          // Heading 3: ### Title
          if (trimmed.startsWith("### ")) {
            flushParagraph(`p-before-h3-${lIdx}`);
            renderedElements.push(
              <h3
                key={`h3-${lIdx}`}
                className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-100 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
                {renderInlineContent(trimmed.slice(4).trim())}
              </h3>
            );
            return;
          }

          // Heading 4: #### Title
          if (trimmed.startsWith("#### ")) {
            flushParagraph(`p-before-h4-${lIdx}`);
            renderedElements.push(
              <h4
                key={`h4-${lIdx}`}
                className="text-sm sm:text-base font-bold text-slate-800 mt-3 mb-1.5 flex items-center gap-1.5 text-blue-900"
              >
                <span className="w-1 h-3 rounded-full bg-blue-500 inline-block" />
                {renderInlineContent(trimmed.slice(5).trim())}
              </h4>
            );
            return;
          }

          // Divider: ---
          if (trimmed === "---" || trimmed === "***") {
            flushParagraph(`p-before-hr-${lIdx}`);
            renderedElements.push(<hr key={`hr-${lIdx}`} className="my-3 border-slate-200" />);
            return;
          }

          // Numbered list: e.g. "1. Contiguous..." or "2. Pointer Decay..."
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            flushParagraph(`p-before-num-${lIdx}`);
            const num = numMatch[1];
            const itemContent = numMatch[2];
            renderedElements.push(
              <div key={`num-${lIdx}`} className="flex items-start gap-2.5 my-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-extrabold flex items-center justify-center mt-0.5 shadow-2xs border border-blue-200">
                  {num}
                </span>
                <div className="flex-1 text-slate-700 leading-relaxed text-sm sm:text-base">
                  {renderInlineContent(itemContent)}
                </div>
              </div>
            );
            return;
          }

          // Indented bullet: e.g. "   - Item" or "   * Item"
          const isIndentedBullet = /^\s{2,}[-*]\s+(.*)$/.test(line);
          if (isIndentedBullet) {
            flushParagraph(`p-before-ibullet-${lIdx}`);
            const bulletContent = line.replace(/^\s+[-*]\s+/, "");
            renderedElements.push(
              <div key={`ibullet-${lIdx}`} className="flex items-start gap-2.5 my-1.5 ml-6 sm:ml-8">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                <div className="flex-1 text-slate-600 leading-relaxed text-sm sm:text-base">
                  {renderInlineContent(bulletContent)}
                </div>
              </div>
            );
            return;
          }

          // Top-level Bullet: e.g. "- Item" or "* Item"
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            flushParagraph(`p-before-bullet-${lIdx}`);
            const bulletContent = trimmed.slice(2);
            renderedElements.push(
              <div key={`bullet-${lIdx}`} className="flex items-start gap-2.5 my-1.5 ml-2 sm:ml-3">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                <div className="flex-1 text-slate-700 leading-relaxed text-sm sm:text-base">
                  {renderInlineContent(bulletContent)}
                </div>
              </div>
            );
            return;
          }

          // Regular paragraph line
          currentParagraph.push(trimmed);
        });

        flushParagraph(`p-final-${pIdx}`);

        return <div key={`text-block-${pIdx}`} className="space-y-1">{renderedElements}</div>;
      })}
    </div>
  );
}
