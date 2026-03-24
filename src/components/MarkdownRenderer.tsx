"use client"; 

import ReactMarkdown from "react-markdown";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none font-lora">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}