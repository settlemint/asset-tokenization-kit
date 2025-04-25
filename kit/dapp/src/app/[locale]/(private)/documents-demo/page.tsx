import { DocumentsDemo } from "./_components/documents-demo";

export const metadata = {
  title: "Document Upload Demo",
  description: "Demonstrate the document upload component for forms",
};

export default function DocumentsDemoPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Document Upload Demo</h1>
      <DocumentsDemo />
    </div>
  );
}
