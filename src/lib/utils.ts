import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function linkifyEntities(text: string | null | undefined): string {
  if (!text) return "";

  const entities = [
    { name: "Pat McRae", slug: "pat-mcrae" },
    { name: "Jennifer Mansfield", slug: "jennifer-mansfield" },
    { name: "Karla M. Sanders", slug: "karla-sanders" },
    { name: "Joe Abel", slug: "joe-abel" },
    { name: "Michael Bosnic", slug: "michael-bosnic" },
    { name: "Judge Karen Khalil", slug: "karen-khalil" },
    { name: "Dr. Irvin Gastman", slug: "irvin-gastman" },
    { name: "Dr. Steven Kohl", slug: "steven-kohl" },
    { name: "Dr. William Boudaris", slug: "william-boudaris" },
    { name: "Dr. Asadulla Mohammed", slug: "asadulla-mohammed" },
    { name: "Dr. Scott H. Lagerveld", slug: "scott-lagerveld" },
    { name: "Christian E. Schutte", slug: "christian-schutte" },
    { name: "Adam M. Tawney", slug: "adam-tawney" },
    { name: "Regina Harris", slug: "regina-harris" },
    { name: "Dana Nessel", slug: "dana-nessel" },
    { name: "Gretchen Whitmer", slug: "gretchen-whitmer" },
    { name: "Elizabeth Hertel", slug: "elizabeth-hertel" },
    { name: "Col. James F. Grady II", slug: "james-grady" },
    { name: "Rashida Tlaib", slug: "rashida-tlaib" },
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
  
  const sortedEntities = [...entities].sort((a, b) => b.name.length - a.name.length);

  sortedEntities.forEach(entity => {
    const escapedName = entity.name.replace(/\./g, '\\.');
    const regex = new RegExp(`(?<!\\[)\\b${escapedName}\\b(?![^\\[]*\\])`, 'g');
    
    processedText = processedText.replace(regex, `[${entity.name}](/accountability/${entity.slug})`);
  });

  return processedText;
}