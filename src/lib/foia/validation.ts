// src/lib/foia/validation.ts

export interface FormErrors {
  userName?: string;
  userAddress?: string;
  agencyName?: string;
  recordsDescription?: string;
}

export function validateFOIAForm(formData: {
  userName: string;
  userAddress: string;
  agencyName: string;
  recordsDescription: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!formData.userName?.trim()) {
    errors.userName = "Full name is required";
  }

  if (!formData.userAddress?.trim()) {
    errors.userAddress = "Address is required";
  }

  if (!formData.agencyName?.trim()) {
    errors.agencyName = "Target agency is required";
  }

  // At least one of: custom description OR selected categories
  if (!formData.recordsDescription?.trim()) {
    // This will be checked at component level with category selection
  }

  return errors;
}

export function isFormValid(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0;
}