const ACTORS = [
  "Redford Twp", "Redford Police", "Corewell Health", 
  "Tandem 365", "Henry Ford", "APS", "LARA", "Attorney General"
];

export default function PriorityCommandBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 px-4">
      {ACTORS.map((name) => (
        <button 
          key={name}
          className="group relative bg-[#0B1021] border border-slate-800/50 p-3 rounded-sm overflow-hidden transition-all hover:border-[#4A90E2]/50 shadow-lg"
        >
          {/* Dashboard-style blue glow on hover */}
          <div className="absolute inset-0 bg-[#4A90E2]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <span className="relative z-10 font-mono text-[9px] font-bold uppercase tracking-tighter text-slate-500 group-hover:text-[#4A90E2] transition-colors">
            {name}
          </span>
          
          {/* Subtle animated border bottom */}
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#4A90E2] transition-all duration-300 group-hover:w-full" />
        </button>
      ))}
    </div>
  );
}