import Image from 'next/image';

export default function AuthorBio() {
  return (
    <section className="mt-16 lg:mt-24 border-t border-slate-900 pt-8 lg:pt-12 pb-12 lg:pb-20">
      <div className="max-w-[90vw] lg:max-w-4xl border border-slate-900 bg-slate-950/50 p-8 lg:p-12 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        
        {/* AVATAR - Made larger for better visibility */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[#4A90E2]/30 overflow-hidden shrink-0 bg-slate-900 shadow-[0_0_30px_rgba(74,144,226,0.15)]">
          <Image 
            src="/Thomas J Carlin III.avif" 
            alt="Thomas J. Carlin III - Systems Architect & Investigative Journalist"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 128px, 160px"
            priority
          />
        </div>

        {/* BIO CONTENT */}
        <div className="space-y-6 min-w-0">
          <div>
            {/* Headline: Now much larger (approx 32px on desktop) */}
            <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase">
              Thomas J. Carlin III
            </h3>
            {/* Credentials: Bumped up and brightened for 10ft readability */}
            <p className="text-[#4A90E2] text-sm md:text-base lg:text-lg font-black uppercase tracking-[0.2em] mt-2">
              Systems Architect | MCSE • MCSA • MCP
            </p>
          </div>

          {/* Main Bio Text: Using fluid clamp for high-DPI scaling */}
          <div className="text-slate-200 text-[clamp(16px,1.2vw,22px)] leading-relaxed space-y-5 font-medium border-l-2 border-red-900/60 pl-6">
            <p>
              A lifelong technologist, Thomas began programming at age 10 on a Timex 1000. 
              He spent 25 years engineering high-level infrastructure, specializing in 
              <span className="text-white font-bold"> VMWare Virtualization</span> and <span className="text-white font-bold">SQL Server</span>.
            </p>
            <p>
              During the pandemic, he was the lead architect converting entire office networks 
              to cloud-based remote systems. His technical background in <span className="text-white font-bold">Linux, C#, and Unity 3D</span> 
              provides the clinical analytical baseline for this investigative archive.
            </p>
          </div>
          
          {/* Tags: Made larger and more distinct */}
          <div className="flex flex-wrap gap-3 pt-4">
            {["Identity Verified", "Microsoft Certified", "FOIA Specialist"].map(tag => (
              <span 
                key={tag} 
                className="text-xs md:text-sm text-slate-400 border border-slate-700 px-4 py-1.5 uppercase font-black hover:border-[#4A90E2]/60 hover:text-[#4A90E2] transition-colors bg-slate-900/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}