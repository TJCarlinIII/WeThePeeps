import Link from "next/link";

const MAIN_ACTORS = [
  { name: "Redford Twp", slug: "redford-township" },
  { name: "Redford Police", slug: "redford-township-police-department" },
  { name: "Corewell Health", slug: "corewell-health" },
  { name: "Tandem 365", slug: "tandem-365" },
  { name: "Henry Ford", slug: "henry-ford-health" },
  { name: "APS", slug: "adult-protective-services" },
  { name: "LARA", slug: "lara" },
  { name: "Attorney General", slug: "michigan-attorney-general" },
];

export default function EntityActionBar() {
  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-4">
      <div className="flex gap-3 min-w-max px-4">
        {MAIN_ACTORS.map((actor) => (
          <Link
            key={actor.slug}
            href={`/jurisdiction/${actor.slug}`}
            className="group relative bg-[#0B1021] border border-slate-800 px-6 py-3 rounded-sm transition-all duration-300 hover:border-[#4A90E2] hover:shadow-[0_0_15px_rgba(74,144,226,0.2)]"
          >
            {/* The Dashboard-style Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <span className="relative font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white">
              {actor.name}
            </span>
            
            {/* Subtle bottom accent line */}
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#4A90E2] transition-all duration-500 group-hover:w-full" />
          </Link>
        ))}
      </div>
    </div>
  );
}