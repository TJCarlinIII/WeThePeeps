import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Standard Tailwind class merger
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Automatically transforms names into links for the accountability dossiers.
 * This ensures that every mention of a key figure becomes a "rabbit hole" link.
 */
export function linkifyEntities(text: string) {
  const entities = [
    // Redford Leadership & Legal
    { name: "Pat McRae", slug: "pat-mcrae" },
    { name: "Jennifer Mansfield", slug: "jennifer-mansfield" },
    { name: "Karla M. Sanders", slug: "karla-sanders" },
    { name: "Joe Abel", slug: "joe-abel" },
    { name: "Michael Bosnic", slug: "michael-bosnic" },
    { name: "Judge Karen Khalil", slug: "karen-khalil" },
    
    // Medical / APS / Professional
    { name: "Dr. Irvin Gastman", slug: "irvin-gastman" },
    { name: "Dr. Steven Kohl", slug: "steven-kohl" },
    { name: "Dr. William Boudaris", slug: "william-boudaris" },
    { name: "Dr. Asadulla Mohammed", slug: "asadulla-mohammed" },
    { name: "Dr. Scott H. Lagerveld", slug: "scott-lagerveld" },
    { name: "Christian E Schutte", slug: "christian-schutte" },
    { name: "Adam M Tawney", slug: "adam-tawney" },
    { name: "Regina Harris", slug: "regina-harris" },
    
    // State & Federal Officials
    { name: "Dana Nessel", slug: "dana-nessel" },
    { name: "Gretchen Whitmer", slug: "gretchen-whitmer" },
    { name: "Elizabeth Hertel", slug: "elizabeth-hertel" },
    { name: "Col. James F. Grady II", slug: "james-grady" },
    { name: "Rashida Tlaib", slug: "rashida-tlaib" },
    
    // Others mentioned
    { name: "Sarah Jelsomeno", slug: "sarah-jelsomeno" },
    { name: "Sherry Gosset", slug: "sherry-gosset" },
    { name: "Robyn Liddell", slug: "robyn-liddell" },
    { name: "Tracy A. Cyrus", slug: "tracy-cyrus" },
    { name: "April Sydsow", slug: "april-sydsow" },
    { name: "Vonda Watts", slug: "vonda-watts" },
    { name: "Stephanie Rosenthal", slug: "stephanie-rosenthal" },
    { name: "Alena Bogara", slug: "alena-bogara" },
    { name: "Kristin Gildner", slug: "kristin-gildner" },
    { name: "Jon Campbell", slug: "jon-campbell" },
    { name: "Willeona Brown", slug: "willeona-brown" }
  ];

  let processedText = text;
  
  // Sort by length descending to ensure "Dr. Irvin Gastman" matches 
  // before "Irvin Gastman" if both were in the list.
  const sortedEntities = [...entities].sort((a, b) => b.name.length - a.name.length);

  sortedEntities.forEach(entity => {
    // Escaping dots for regex (e.g., Dr. becomes Dr\.)
    const escapedName = entity.name.replace(/\./g, '\\.');
    const regex = new RegExp(`(?<!\\[)${escapedName}(?!\\])`, 'g');
    processedText = processedText.replace(regex, `[${entity.name}](/accountability/${entity.slug})`);
  });

  return processedText;
}
