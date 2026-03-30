// src/components/foia/PreviewPanel.tsx
'use client';

interface PreviewPanelProps {
  content: string;
  onEdit: () => void;
}

export default function PreviewPanel({ content, onEdit }: PreviewPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase">Preview</h2>
        <button 
          onClick={onEdit} 
          className="text-[10px] font-black uppercase text-[#4A90E2] hover:underline"
        >
          Edit Info
        </button>
      </div>
      
      <div className="preview-container bg-white text-black p-6 md:p-10 overflow-auto whitespace-pre-wrap font-serif text-sm shadow-2xl leading-relaxed rounded-sm border border-slate-300">
        <pre className="m-0 p-0 bg-transparent border-0 shadow-none whitespace-pre-wrap">
          {content}
        </pre>
      </div>

      {/* Print-only mailing instructions */}
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
  );
}