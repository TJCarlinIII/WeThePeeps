// src/components/foia/FOIAForm.tsx
'use client';
import React, { useState } from 'react';
import { generateFOIATemplate, type RecordCategory } from '@/lib/foia/templates';
import { validateFOIAForm, isFormValid, type FormErrors } from '@/lib/foia/validation';
import PrivacyHeader from './PrivacyHeader';
import RecordCategorySelector from './RecordCategorySelector';
import PreviewPanel from './PreviewPanel';
import DownloadButtons from './DownloadButtons';

interface FormDataState {
  userName: string;
  userAddress: string;
  userPhone: string;
  userEmail: string;
  agencyName: string;
  caseReference: string;
  recordsDescription: string;
  isIndigent: boolean;
  // ✅ NEW: Date range fields
  startDate?: string;
  endDate?: string;
  allRecords?: boolean;
}

export default function FOIAForm() {
  const [formData, setFormData] = useState<FormDataState>({
    userName: '',
    userAddress: '',
    userPhone: '',
    userEmail: '',
    agencyName: '',
    caseReference: '',
    recordsDescription: '',
    isIndigent: false,
    startDate: '',
    endDate: '',
    allRecords: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // ✅ Allow undefined values in errors state
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const handleInputChange = (field: keyof FormDataState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const validationErrors = validateFOIAForm(formData);
    
    // Check if at least one category or custom description is provided
    if (!formData.recordsDescription.trim() && selectedCategories.length === 0) {
      validationErrors.recordsDescription = "Select at least one record category or enter a custom description";
    }
    
    // ✅ Convert FormErrors to compatible Record type before setting state
    const errorsRecord: Record<string, string | undefined> = {};
    Object.keys(validationErrors).forEach(key => {
      const value = validationErrors[key as keyof FormErrors];
      if (value !== undefined) {
        errorsRecord[key] = value;
      }
    });
    setErrors(errorsRecord);
    
    if (isFormValid(validationErrors)) {
      setSubmitted(true);
    } else {
      // Scroll to first error
      const firstError = Object.keys(validationErrors).find(key => validationErrors[key as keyof FormErrors]);
      if (firstError) {
        document.getElementById(`field-${firstError}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const generatedContent = generateFOIATemplate(formData, selectedCategories);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-mono p-4 md:p-8">
      {/* Print styles */}
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
        <PrivacyHeader />

        <div className="bg-slate-950 border border-slate-900 p-6 md:p-8 no-print">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter border-b border-slate-900 pb-4">
                FOIA Document Generator
              </h2>
              
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="userName" className="text-[10px] uppercase font-black text-slate-500">Your Full Name *</label>
                  <input 
                    id="userName"
                    name="name"
                    autoComplete="name"
                    className={`w-full bg-slate-900 border p-3 outline-none focus:border-[#4A90E2] text-slate-200 ${errors.userName ? 'border-red-600' : 'border-slate-800'}`}
                    onChange={handleInputChange('userName')} 
                    required 
                    aria-required="true"
                  />
                  {errors.userName && <p className="text-[9px] text-red-500">{errors.userName}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="userAddress" className="text-[10px] uppercase font-black text-slate-500">Your Address *</label>
                  <input 
                    id="userAddress"
                    name="street-address"
                    autoComplete="street-address"
                    className={`w-full bg-slate-900 border p-3 outline-none focus:border-[#4A90E2] text-slate-200 ${errors.userAddress ? 'border-red-600' : 'border-slate-800'}`}
                    onChange={handleInputChange('userAddress')} 
                    required 
                    aria-required="true"
                  />
                  {errors.userAddress && <p className="text-[9px] text-red-500">{errors.userAddress}</p>}
                </div>
              </div>

              {/* Contact Info (Optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="userPhone" className="text-[10px] uppercase font-black text-slate-500">Phone (Optional)</label>
                  <input 
                    id="userPhone"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200" 
                    onChange={handleInputChange('userPhone')} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="userEmail" className="text-[10px] uppercase font-black text-slate-500">Email (Optional)</label>
                  <input 
                    id="userEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200" 
                    onChange={handleInputChange('userEmail')} 
                  />
                </div>
              </div>

              {/* Case Reference */}
              <div className="space-y-2">
                <label htmlFor="caseReference" className="text-[10px] uppercase font-black text-slate-500">Your Case Reference (Optional)</label>
                <input 
                  id="caseReference"
                  name="case-reference"
                  autoComplete="off"
                  className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200" 
                  placeholder="e.g. GASTMAN-2022-001"
                  onChange={handleInputChange('caseReference')} 
                />
                <p className="text-[9px] text-slate-600 italic">Use this to track your request in your personal records.</p>
              </div>

              {/* Agency Selection */}
              <div className="space-y-2">
                <label htmlFor="agencyName" className="text-[10px] uppercase font-black text-slate-500">Target Agency / Department *</label>
                <select 
                  id="agencyName"
                  name="organization"
                  autoComplete="organization"
                  className={`w-full bg-slate-900 border p-3 outline-none focus:border-[#4A90E2] text-slate-200 ${errors.agencyName ? 'border-red-600' : 'border-slate-800'}`}
                  onChange={handleInputChange('agencyName')} 
                  required
                  aria-required="true"
                >
                  <option value="">Select an agency...</option>
                  <option>Redford Township Police Department</option>
                  <option>Redford Township Clerk's Office</option>
                  <option>Redford Township Prosecutor</option>
                  <option>Michigan Licensing and Regulatory Affairs (LARA)</option>
                  <option>Michigan Department of Health and Human Services (MDHHS)</option>
                  <option>Wayne County Prosecutor's Office</option>
                  <option>Michigan State Police</option>
                  <option>Office of the Attorney General - Dana Nessel</option>
                  <option>Corewell Health Farmington Hills</option>
                  <option>Henry Ford Health System</option>
                </select>
                <input 
                  name="organization-alt"
                  autoComplete="organization"
                  className="w-full bg-slate-900 border border-slate-800 p-3 outline-none focus:border-[#4A90E2] text-slate-200 mt-2" 
                  placeholder="Or type agency name manually..."
                  onChange={handleInputChange('agencyName')} 
                />
                {errors.agencyName && <p className="text-[9px] text-red-500">{errors.agencyName}</p>}
              </div>

              {/* Record Categories Selector */}
              <div className="space-y-2">
                <RecordCategorySelector 
                  selectedCategories={selectedCategories}
                  onToggle={toggleCategory}
                />
              </div>

              {/* ✅ NEW: Date Range / All Records Selector */}
              <div className="space-y-3 p-4 bg-slate-900/30 border border-slate-800 rounded">
                <label className="text-[10px] uppercase font-black text-slate-500 block mb-2">
                  Date Range for Records Request:
                </label>
                
                {/* All Records Toggle */}
                <div className="flex items-center gap-3 mb-3">
                  <input 
                    type="checkbox" 
                    id="allRecords"
                    checked={!!formData.allRecords}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      allRecords: e.target.checked,
                      // Clear dates when "All Records" is checked
                      startDate: e.target.checked ? '' : prev.startDate,
                      endDate: e.target.checked ? '' : prev.endDate
                    }))}
                    className="w-4 h-4 accent-[#4A90E2]"
                  />
                  <label htmlFor="allRecords" className="text-xs font-bold text-white cursor-pointer">
                    Request ALL available records (no date restrictions)
                  </label>
                </div>
                
                {/* Date Inputs (disabled when "All Records" is checked) */}
                <div className={`grid grid-cols-2 gap-3 ${formData.allRecords ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-1">
                    <label htmlFor="startDate" className="text-[9px] text-slate-500 uppercase">Start Date</label>
                    <input 
                      id="startDate"
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 p-2 text-sm text-white focus:border-[#4A90E2] outline-none"
                      disabled={formData.allRecords}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="endDate" className="text-[9px] text-slate-500 uppercase">End Date</label>
                    <input 
                      id="endDate"
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 p-2 text-sm text-white focus:border-[#4A90E2] outline-none"
                      disabled={formData.allRecords}
                    />
                  </div>
                </div>
                
                <p className="text-[9px] text-slate-600 italic">
                  Tip: Leave dates blank + uncheck "All Records" to use default "earliest to present" language.
                </p>
              </div>

              {/* Custom Description */}
              <div className="space-y-2">
                <label htmlFor="recordsDescription" className="text-[10px] uppercase font-black text-slate-500">Additional Details (Optional)</label>
                <textarea 
                  id="recordsDescription"
                  name="records-description"
                  autoComplete="off"
                  className={`w-full bg-slate-900 border p-3 min-h-[100px] outline-none focus:border-[#4A90E2] text-slate-200 ${errors.recordsDescription ? 'border-red-600' : 'border-slate-800'}`} 
                  placeholder="Add any specific details not covered by the categories above..."
                  onChange={handleInputChange('recordsDescription')} 
                />
                {errors.recordsDescription && <p className="text-[9px] text-red-500">{errors.recordsDescription}</p>}
              </div>

              {/* Indigent Fee Waiver */}
              <div className="flex items-start gap-3 p-4 bg-red-950/10 border border-red-900/20">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 mt-1" 
                  onChange={handleInputChange('isIndigent')} 
                  id="indigent-waiver" 
                  name="isIndigent"
                />
                <label htmlFor="indigent-waiver" className="text-xs uppercase font-bold text-red-500 leading-relaxed cursor-pointer">
                  Include Indigent Fee Waiver Clause (MCL 15.234) — Use this if you cannot afford filing fees.
                </label>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#4A90E2] text-black font-black py-4 uppercase hover:bg-white transition-all tracking-widest"
              >
                Generate Legal Document
              </button>
            </form>
          ) : (
            <>
              <PreviewPanel 
                content={generatedContent}
                onEdit={() => setSubmitted(false)}
              />
              <div className="mt-6">
                <DownloadButtons 
                  content={generatedContent}
                  agencyName={formData.agencyName}
                />
              </div>
              <button 
                onClick={() => window.print()} 
                className="w-full mt-4 bg-slate-800 text-white font-bold py-3 uppercase text-xs hover:bg-slate-700 transition-colors no-print"
              >
                🖨️ Print This Document
              </button>
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center no-print">
          <p className="text-[10px] text-slate-600 italic">
            This tool is provided for educational purposes. Consult an attorney for legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}