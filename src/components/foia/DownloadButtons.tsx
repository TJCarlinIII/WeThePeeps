// src/components/foia/DownloadButtons.tsx
'use client';
import React, { useState } from 'react';
import { generatePDF, generateDOCX, copyToClipboard } from '@/lib/foia/formatters';

interface DownloadButtonsProps {
  content: string;
  agencyName: string;
}

export default function DownloadButtons({ content, agencyName }: DownloadButtonsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
      <button 
        onClick={handleCopy} 
        className={`font-bold py-3 uppercase text-xs transition-colors ${
          copyStatus === 'copied' 
            ? 'bg-emerald-700 text-white' 
            : 'bg-slate-800 text-white hover:bg-slate-700'
        }`}
        aria-live="polite"
      >
        {copyStatus === 'copied' ? '✓ Copied to Clipboard!' : 'Copy to Clipboard'}
      </button>
      
      <button 
        onClick={() => generateDOCX(content, agencyName)} 
        className="bg-slate-800 text-white font-bold py-3 uppercase text-xs hover:bg-slate-700 transition-colors"
      >
        Download .DOC
      </button>
      
      {/* ✅ TV-Visible PDF Button */}
      <button 
        onClick={() => generatePDF(content, { agencyName, userName: '' })} 
        className="bg-red-900 text-white font-bold py-4 px-6 uppercase text-sm md:text-base hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(153,27,27,0.4)]"
      >
        Download PDF
      </button>
    </div>
  );
}