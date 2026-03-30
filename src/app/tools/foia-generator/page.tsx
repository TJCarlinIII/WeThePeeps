// src/app/tools/foia-generator/page.tsx
import FOIAForm from '@/components/foia/FOIAForm';

export const metadata = {
  title: "FOIA Document Generator | WeThePeeps",
  description: "Generate legally precise FOIA requests for Michigan government and healthcare entities. Client-side processing, no data stored."
};

export default function FOIAGeneratorPage() {
  return <FOIAForm />;
}