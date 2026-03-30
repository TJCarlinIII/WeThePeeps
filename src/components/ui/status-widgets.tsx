import SidebarWidget from './sidebar-widget';

/**
 * Ticking counter showing days since the initial medical assault.
 * Responsive: Scales for TV viewing + desk use
 */
export function NeglectCounter() {
  const assaultDate = new Date('2022-11-22');
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - assaultDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <SidebarWidget title="NEGLECT DURATION COUNTER" variant="alert" label="CRITICAL">
      <div className="text-center py-6 lg:py-8 bg-red-950/20 border border-red-900/30">
        <span className="text-red-500 text-[9px] md:text-[10px] uppercase font-black block mb-3 tracking-widest">
          Days Without Clinical Correction
        </span>
        
        {/* Number scales dramatically for TV visibility */}
        <span className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter font-mono block">
          {diffDays}
        </span>
        
        <span className="text-red-900 text-[8px] md:text-[9px] block mt-4 font-bold uppercase tracking-[0.2em]">
          Since Original Assault Date
        </span>
      </div>
      
      <div className="space-y-3 mt-4">
        <div className="flex justify-between text-[9px] md:text-[10px] uppercase font-black tracking-tight px-2">
          <span className="text-slate-500">Records Withheld</span>
          <span className="text-red-600 italic">{diffDays}+ Days</span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mx-2">
          {/* Static bar for photosensitivity (no pulse) */}
          <div className="bg-red-600 h-full w-[98%]" />
        </div>
      </div>
    </SidebarWidget>
  );
}

/**
 * Status indicator for the SSA case and medical evidence suppression.
 */
export function SSAStatus() {
  return (
    <SidebarWidget title="SSA ADJUDICATION STATUS" variant="default">
      <div className="space-y-4">
        <p className="text-[11px] md:text-sm text-slate-400 leading-relaxed font-mono">
          Medical evidence <span className="text-slate-200">(Ischemia/Obstruction)</span> successfully suppressed by Gastman/LARA for 2+ years.
        </p>
        <div className="pt-2 border-t border-slate-900">
          <span className="flex items-center gap-2 text-red-700 font-black text-[9px] md:text-[10px] uppercase tracking-tighter">
            {/* Static dot for photosensitivity */}
            <span className="h-2 w-2 rounded-full bg-red-600" aria-label="Active status" />
            Status: Asset Depletion Active
          </span>
        </div>
      </div>
    </SidebarWidget>
  );
}