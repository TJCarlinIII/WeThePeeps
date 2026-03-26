import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Standard Tailwind class merger
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates SEO-friendly social share URLs for X and Facebook.
 * Uses database tags to automatically create viral hashtags.
 */
export function getSocialShareUrl(platform: 'x' | 'fb', data: {
  title: string,
  url: string,
  tags?: string,
  official?: string
}) {
  const baseUrl = encodeURIComponent(data.url);
  const defaultMessage = `Redford Township Obstruction of Justice on display right here:`;
  
  // Convert "Misconduct, FOIA, Police" -> "Misconduct,FOIA,Police" (comma separated, no spaces)
  const hashtags = data.tags 
    ? data.tags.split(',').map(t => t.trim().replace(/\s+/g, '')).join(',')
    : "RedfordMI,Accountability,WeThePeeps";

  if (platform === 'x') {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(defaultMessage)}&url=${baseUrl}&hashtags=${hashtags}`;
  }
  
  if (platform === 'fb') {
    // Note: Facebook ignores 'text' params now; it relies on your page's OG Meta Tags
    return `https://www.facebook.com/sharer/sharer.php?u=${baseUrl}`;
  }
}

/**
 * Linkify Entities (Dynamic Version)
 * Now accepts an optional entities array fetched from the DB 
 * to keep the utility function "pure" and decoupled from hardcoded data.
 */
export function linkifyEntities(
  text: string | null | undefined, 
  dynamicEntities: { name: string, slug: string }[] = []
): string {
  if (!text) return "";

  let processedText = text;
  
  // Sort by length descending to ensure "Judge Karen Khalil" 
  // is matched before "Karen Khalil"
  const sortedEntities = [...dynamicEntities].sort((a, b) => b.name.length - a.name.length);

  sortedEntities.forEach(entity => {
    // Escape dots for regex (e.g., Dr. Smith)
    const escapedName = entity.name.replace(/\./g, '\\.');
    // Regex ensures we don't linkify something already inside a markdown link
    const regex = new RegExp(`(?<!\\[)\\b${escapedName}\\b(?![^\\[]*\\])`, 'g');
    
    processedText = processedText.replace(regex, `[${entity.name}](/accountability/${entity.slug})`);
  });

  return processedText;
}