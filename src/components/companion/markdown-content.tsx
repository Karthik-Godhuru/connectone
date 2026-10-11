"use client";

import React from "react";
import Link from "next/link";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, safe markdown renderer tailored for ConnectOne AI Companion.
 * Parses headings, bold, italics, bullet/numbered lists, quotes, inline code, and links
 * without raw markdown syntax bleed.
 */
export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];

  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === "ul") {
      renderedElements.push(
        <ul key={`ul-${renderedElements.length}`} className="my-1.5 space-y-1 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-[#DBD3C1]/95">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D5B38B]" />
              <div className="flex-1">{renderInline(item)}</div>
            </li>
          ))}
        </ul>
      );
    } else {
      renderedElements.push(
        <ol key={`ol-${renderedElements.length}`} className="my-1.5 space-y-1 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-[#DBD3C1]/95">
              <span className="shrink-0 font-bold text-[#D5B38B] text-[11px] tabular-nums">
                {idx + 1}.
              </span>
              <div className="flex-1">{renderInline(item)}</div>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList();
      renderedElements.push(
        <h3
          key={`h3-${i}`}
          className="mt-2.5 mb-1.5 text-xs font-bold uppercase tracking-wider text-[#DBD3C1] flex items-center gap-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#D5B38B]" />
          <span>{renderInline(line.slice(4))}</span>
        </h3>
      );
      continue;
    }

    if (line.startsWith("#### ")) {
      flushList();
      renderedElements.push(
        <h4
          key={`h4-${i}`}
          className="mt-2 mb-1 text-xs font-semibold text-[#D5B38B]"
        >
          {renderInline(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushList();
      renderedElements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2 rounded-r-lg border-l-2 border-[#9E532D] bg-[#252E33]/40 px-3 py-1.5 text-xs italic text-[#DBD3C1]/90"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet List (- or *)
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (currentList && currentList.type !== "ul") flushList();
      if (!currentList) currentList = { type: "ul", items: [] };
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered List (1. 2. etc.)
    const numberMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      if (currentList && currentList.type !== "ol") flushList();
      if (!currentList) currentList = { type: "ol", items: [] };
      currentList.items.push(numberMatch[1]);
      continue;
    }

    // Standard paragraph
    flushList();
    renderedElements.push(
      <p key={`p-${i}`} className="my-1 text-xs leading-relaxed text-[#DBD3C1]/95">
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{renderedElements}</div>;
}

/**
 * Parses inline markdown: **bold**, *italic*, `code`, and [link](url)
 */
function renderInline(text: string): React.ReactNode {
  if (!text) return "";

  // Tokenize string for links [label](url), bold **text**, italic *text*, code `text`
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(parseFormatting(text.substring(lastIndex, match.index)));
    }

    const label = match[1];
    const url = match[2];

    const isInternal = url.startsWith("/");

    if (isInternal) {
      parts.push(
        <Link
          key={`link-${match.index}`}
          href={url}
          className="font-medium text-[#D5B38B] underline decoration-[#D5B38B]/40 underline-offset-2 transition hover:text-[#E4C8A6] hover:decoration-[#D5B38B]"
        >
          {label}
        </Link>
      );
    } else {
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[#D5B38B] underline decoration-[#D5B38B]/40 underline-offset-2 transition hover:text-[#E4C8A6] hover:decoration-[#D5B38B]"
        >
          {label}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(parseFormatting(text.substring(lastIndex)));
  }

  return <>{parts}</>;
}

function parseFormatting(segment: string): React.ReactNode {
  // Split on bold **
  const boldParts = segment.split(/(\*\*[^*]+\*\*)/g);

  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith("**") && bPart.endsWith("**")) {
      const inner = bPart.slice(2, -2);
      return (
        <strong key={`b-${bIdx}`} className="font-semibold text-[#F4EFE6]">
          {parseItalicAndCode(inner)}
        </strong>
      );
    }
    return <span key={`nb-${bIdx}`}>{parseItalicAndCode(bPart)}</span>;
  });
}

function parseItalicAndCode(str: string): React.ReactNode {
  // Split on inline code `
  const codeParts = str.split(/(`[^`]+`)/g);

  return codeParts.map((cPart, cIdx) => {
    if (cPart.startsWith("`") && cPart.endsWith("`")) {
      return (
        <code
          key={`c-${cIdx}`}
          className="rounded bg-[#252E33]/80 px-1 py-0.5 text-[11px] font-mono text-[#D5B38B] border border-[#DBD3C1]/10"
        >
          {cPart.slice(1, -1)}
        </code>
      );
    }

    // Split on italic *
    const italicParts = cPart.split(/(\*[^*]+\*)/g);
    return italicParts.map((iPart, iIdx) => {
      if (iPart.startsWith("*") && iPart.endsWith("*") && iPart.length > 2) {
        return (
          <em key={`i-${iIdx}`} className="italic text-[#8FAAB5]">
            {iPart.slice(1, -1)}
          </em>
        );
      }
      return iPart;
    });
  });
}
