'use client';
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

const COMMON_AGENCIES = [
  "Redford Township Police Department",
  "Redford Township Clerk's Office",
  "Redford Township Prosecutor",
  "Michigan Licensing and Regulatory Affairs (LARA)",
  "Michigan Department of Health and Human Services (MDHHS)",
  "Wayne County Prosecutor's Office",
  "Michigan State Police",
  "Office of the Attorney General - Dana Nessel",
  "Corewell Health Farmington Hills",
  "Henry Ford Health System"
];

const TEMPLATE_SNIPPETS = [
  {
    label: "Medical Records",
    text: "All medical records, appointment logs, clinical notes, test results, imaging reports, and billing records for patient [YOUR NAME] from [START DATE] to [END DATE], including any records related to neurological assessment, cardiac evaluation, or diaphragm function testing."
  },
  {
    label: "FOIA Correspondence",
    text: "All emails, memos, internal communications, meeting notes, and decision logs regarding FOIA request #[REQUEST NUMBER] submitted on [DATE], including any communications with external legal counsel or insurance representatives."
  },
  {
    label: "Policy Documents",
    text: "All written policies, procedures, training manuals, and protocols regarding [SPECIFIC TOPIC: e.g., 'medical record retention', 'FOIA response timelines', 'vulnerable adult protection'] adopted or revised after January 1, 2020."
  },
  {
    label: "Complaint Records",
    text: "All complaints filed against [PROVIDER NAME] with LARA, MDHHS, or any licensing board from [DATE] to present, including investigation reports, findings, disciplinary actions, and correspondence."
  }
];

interface FormDataState {
  userName: string;
  userAddress: string;
  userPhone: string;
  userEmail: string;
  agencyName: string;
  caseReference: string;
  recordsDescription: string;
  isIndigent: boolean;
}

export default function FOIAGenerator() {
  const [formData, setFormData] = useState<FormDataState>({
    userName: '',
    userAddress: '',
    userPhone: '',
    userEmail: '',
    agencyName: '',
    caseReference: '',
    recordsDescription: '',
    isIndigent: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleInputChange = (field: keyof FormDataState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev: FormDataState) => ({ ...prev, [field]: value }));
  };

  const generateTemplate = () => {
    const indigentClause = formData.isIndigent 
      ? "\n\nI am also requesting a fee waiver as an indigent person under MCL 15.234(2)(a). I am currently receiving public assistance or am able to provide facts showing inability to pay due to financial indigence."
      : "";

    const caseRefLine = formData.caseReference 
      ? "\n\nCASE REFERENCE: " + formData.caseReference
      : "";

    return `
${formData.userName}
${formData.userAddress}
${formData.userPhone ? formData.userPhone + '\n' : ''}${formData.userEmail ? formData.userEmail + '\n' : ''}
${new Date().toLocaleDateString()}

RE: Freedom of Information Act Request${caseRefLine}

To the FOIA Coordinator of ${formData.agencyName}:

Under the Michigan Freedom of Information Act, Public Act 442 of 1976, MCL 15.231, et seq., I am writing to request a copy of the following public records:

${formData.recordsDescription}${indigentClause}

If there are any fees for searching or copying these records, please inform me if the cost will exceed $20.00. I expect a response within five (5) business days, as required by the Act.

If you deny any or all of this request, please cite each specific exemption under MCL 15.243 and notify me of appeal procedures under MCL 15.240.

Sincerely,

${formData.userName}

__________________________
Signature of Requester

Date: _______________
    `.trim();
  };

  // ✅ ENHANCED: PDF Download with Header, Footer & Page Numbers
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Basic PDF Formatting
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(generateTemplate(), 170);
    doc.text(splitText, 20, 25);
    
    // ✅ Add Header & Page Numbers to every page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Header: Agency name + date
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`FOIA Request: ${formData.agencyName}`, 20, 15);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 180, 15, { align: 'right' });
      
      // Footer: Page number + source attribution
      doc.text(`Page ${i} of ${pageCount}`, 180, 290, { align: 'right' });
      if (i === pageCount) {
        doc.text('Generated via WeThePeeps.net', 20, 290);
      }
    }
    
    // Save with organized filename
    doc.save(`FOIA_Request_${formData.agencyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const downloadDocx = () => {
    const element = document.createElement("a");
    const file = new Blob([generateTemplate()], {type: 'application/msword'});
    element.href = URL.createObjectURL(file);
    element.download = `FOIA_Request_${formData.agencyName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateTemplate());
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-mono p-4 md:p-8">
      <style>{`
        @media print {
          body { background: white !important; color: black !important; font-size: 11pt !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          pre { font-size: 10pt !important; padding: 15pt !important; box-shadow: none !important; border: 1pt solid #000 !important; white-space: pre-wrap !important; word-wrap: break-word !important; }
          .preview-container { border: 2pt solid #000 !important; padding: 20pt !important; margin: 10pt !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <div className="mb-10 space-y-4 no-print">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-slate-900/50 border border-emerald-900/30 p-4 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" aria-hidden="true" />
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-500">System Status</span>
                <span className="text-sm font-bold text-white uppercase tracking-tighter italic">&quot;Cookieless Environment&quot;</span>
              </div>
            </div>
            <div className="flex-1 bg-slate-900/50 border border-blue-900/30 p-4 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[#4A90E2] shadow-[0_0_8px_#4A90E2]" aria-hidden="true" />
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-[#4A90E2]">Data Protocol</span>
                <span className="text-sm font-bold text-white uppercase tracking-tighter italic">&quot;Local Client-Side Only&quot;</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] md:text-xs text-slate-500 font-medium leading-relaxed max-w-3xl italic border-l border-slate-800 pl-4">
            Verification: This site does not utilize HTTP cookies, tracking pixels, or server-side logging for visitors. 
            Information entered into this generator is held in temporary browser memory and is purged upon page refresh. 
            <span className="text-slate-300 font-bold uppercase ml-1 underline decoration-red-900">&quot;No data is stored.&quot;</span>
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-900 p-6 md:p-8 no-print">
          {!submitted ? (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter border-b border-slate-900 pb-4">FOIA Document Generator</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500">Your Full Name *</label>
                  <input className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200" onChange={handleInputChange('userName')} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500">Your Address *</label>
                  <input className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200" onChange={handleInputChange('userAddress')} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500">Phone (Optional)</label>
                  <input type="tel" className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200" onChange={handleInputChange('userPhone')} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500">Email (Optional)</label>
                  <input type="email" className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200" onChange={handleInputChange('userEmail')} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Your Case Reference (Optional)</label>
                <input className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200" placeholder="e.g. GASTMAN-2022-001" onChange={handleInputChange('caseReference')} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Target Agency / Department *</label>
                <select className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200" onChange={handleInputChange('agencyName')} required>
                  <option value="">Select an agency...</option>
                  {COMMON_AGENCIES.map(agency => <option key={agency} value={agency}>{agency}</option>)}
                </select>
                <input className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200 mt-2" placeholder="Or type agency name manually..." onChange={handleInputChange('agencyName')} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Records Requested *</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {TEMPLATE_SNIPPETS.map(snippet => (
                    <button
                      key={snippet.label}
                      type="button"
                      onClick={() => setFormData((prev: FormDataState) => ({
                        ...prev, 
                        recordsDescription: prev.recordsDescription ? prev.recordsDescription + '\n\n• ' + snippet.text : '• ' + snippet.text
                      }))}
                      className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors hover:border-[#4A90E2]/40"
                    >
                      + {snippet.label}
                    </button>
                  ))}
                </div>
                <textarea className="w-full bg-slate-900 border border-slate-800 p-3 min-h-[140px] outline-none focus:border-[#4A90E2] text-slate-200" value={formData.recordsDescription} onChange={handleInputChange('recordsDescription')} required />
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-950/10 border border-red-900/20">
                <input type="checkbox" className="w-4 h-4 mt-1" onChange={handleInputChange('isIndigent')} id="indigent-waiver" />
                <label htmlFor="indigent-waiver" className="text-xs uppercase font-bold text-red-500 leading-relaxed cursor-pointer">
                  Include Indigent Fee Waiver Clause (MCL 15.234) — Use this if you cannot afford filing fees.
                </label>
              </div>

              <button type="submit" className="w-full bg-[#4A90E2] text-black font-black py-4 uppercase hover:bg-white transition-all tracking-widest">Generate Legal Document</button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase">Preview</h2>
                <button onClick={() => setSubmitted(false)} className="text-[10px] font-black uppercase text-[#4A90E2] hover:underline">Edit Info</button>
              </div>
              
              <div className="preview-container bg-white text-black p-6 md:p-10 overflow-auto whitespace-pre-wrap font-serif text-sm shadow-2xl leading-relaxed rounded-sm border border-slate-300">
                <pre className="m-0 p-0 bg-transparent border-0 shadow-none">{generateTemplate()}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                <button onClick={handleCopy} className={`font-bold py-3 uppercase text-xs transition-colors ${copyStatus === 'copied' ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                  {copyStatus === 'copied' ? '✓ Copied to Clipboard!' : 'Copy to Clipboard'}
                </button>
                <button onClick={downloadDocx} className="bg-slate-800 text-white font-bold py-3 uppercase text-xs hover:bg-slate-700 transition-colors">Download .DOC</button>
                
                {/* ✅ ENHANCED: TV-Visible Download Button */}
                <button 
                  onClick={downloadPDF} 
                  className="bg-red-900 text-white font-bold py-4 px-6 uppercase text-sm md:text-base hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(153,27,27,0.4)]"
                >
                  Download PDF
                </button>
              </div>
              <button onClick={() => window.print()} className="w-full mt-4 bg-slate-800 text-white font-bold py-3 uppercase text-xs hover:bg-slate-700 transition-colors no-print">🖨️ Print This Document</button>

              <div className="print-only mt-6 p-4 border-2 border-black bg-yellow-50">
                <p className="font-bold text-sm mb-2">📬 Mailing Instructions:</p>
                <ol className="text-xs list-decimal list-inside space-y-1">
                  <li>Print this document on standard 8.5&quot; x 11&quot; paper</li>
                  <li>Sign above your typed name</li>
                  <li>Send via certified mail with return receipt requested</li>
                  <li>Keep a copy for your records with the certified mail receipt</li>
                  <li>Michigan law requires a response within 5 business days</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}