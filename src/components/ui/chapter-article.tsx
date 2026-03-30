import Link from 'next/link';
import { cn } from "@/lib/utils";

interface ChapterArticleProps {
  label: string;
  title: string;
  description: string;
  borderColor?: string;
  labelColor?: string;
  isTextured?: boolean;
  linkHref?: string;
  linkText?: string;
}

export default function ChapterArticle({
  label,
  title,
  description,
  borderColor = "border-slate-800",
  labelColor = "text-slate-500",
  isTextured = false,
  linkHref,
  linkText,
}: ChapterArticleProps) {
  return (
    <article className={cn("border-l-2 pl-6 space-y-4", borderColor)}>
      <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", labelColor)}>
        {label}
      </span>
      
      {/* Headline: scales with screen width using clamp() */}
      <h2 
        className={cn(
          "font-black leading-tight tracking-tighter uppercase italic",
          "text-[clamp(1.5rem,4vw,3rem)] md:text-[clamp(2rem,5vw,3.5rem)]",
          isTextured ? "text-texture-blood" : "text-white"
        )}
      >
        {title}
      </h2>

      {/* Description: fluid typography */}
      <p className="text-slate-400 text-[13px] md:text-base leading-relaxed font-sans max-w-[90vw] lg:max-w-2xl">
        {description}
      </p>

      {linkHref && linkText && (
        <Link 
          href={linkHref} 
          className="inline-block text-[#4A90E2] font-black text-[10px] md:text-xs uppercase border-b border-[#4A90E2] pb-1 hover:text-white hover:border-white transition-all"
        >
          {linkText} &rarr;
        </Link>
      )}
    </article>
  );
}