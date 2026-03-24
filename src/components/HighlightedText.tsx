interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

export default function HighlightedText({ text, query, className = "" }: HighlightedTextProps) {
  if (!query.trim()) return <span className={className}>{text}</span>;

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return (
    <span className={className}>
      {parts.map((part, i) => (
        part.toLowerCase() === query.toLowerCase() ? (
          <span 
            key={i} 
            className="text-[#4A90E2] shadow-[0_0_8px_rgba(74,144,226,0.5)] font-black"
          >
            {part}
          </span>
        ) : (
          part
        )
      ))}
    </span>
  );
}
