import Link from 'next/link';

const HIERARCHY = [
  {
    branch: "Executive Office",
    lead: "Governor",
    departments: [
      { 
        name: "LARA", 
        individuals: ["Individual Name A", "Individual Name B"] 
      },
      { 
        name: "State Police (MSP)", 
        individuals: ["Officer X", "Officer Y"] 
      }
    ]
  },
  {
    branch: "Legal Oversight",
    lead: "Attorney General",
    departments: [
      { 
        name: "Criminal Division", 
        individuals: ["Prosecutor Z"] 
      }
    ]
  }
];

export default function ArchiveSidebar() {
  return (
    <nav className="h-full bg-black p-6 font-mono text-[11px] overflow-y-auto no-scrollbar">
      <div className="mb-10">
        <h2 className="text-[#4A90E2] font-black tracking-[0.3em] uppercase mb-1">Navigation_Matrix</h2>
        <div className="h-1 w-12 bg-[#4A90E2]"></div>
      </div>

      {HIERARCHY.map((section) => (
        <div key={section.branch} className="mb-8">
          <h3 className="text-white font-black uppercase tracking-widest mb-2 border-b border-slate-900 pb-1">
            {section.branch}
          </h3>
          <p className="text-[#4A90E2]/60 italic mb-4 ml-2 uppercase text-[9px] tracking-widest">
            Lead: {section.lead}
          </p>
          
          {section.departments.map((dept) => (
            <div key={dept.name} className="ml-4 mb-4">
              <h4 className="text-slate-500 font-bold uppercase mb-2 tracking-tighter">
                {dept.name}
              </h4>
              <ul className="space-y-1 border-l border-slate-900 ml-1 pl-4">
                {dept.individuals.map((person) => (
                  <li key={person}>
                    <Link 
                      href={`/evidence/${person.toLowerCase().replace(/ /g, '-')}`} 
                      className="hover:text-[#4A90E2] text-slate-400 transition-colors block py-1"
                    >
                      {person}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}