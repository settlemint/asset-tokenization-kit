"use client";

import {
  FormDocumentUpload,
  type Document,
} from "@/components/blocks/form/inputs/form-document-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useState } from "react";
import { useForm } from "react-hook-form";

// Define the form schema
const formSchema = t.Object(
  {
    documents: t.Optional(t.String()),
  },
  { $id: "DocumentsDemo" }
);

type FormValues = StaticDecode<typeof formSchema>;

export function DocumentsDemo() {
  const [message, setMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: typeboxResolver(formSchema),
    defaultValues: {
      documents: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // In a real application you would do something with the document IDs
      const documentIds = data.documents?.split(",").filter(Boolean) || [];

      setMessage(`Form submitted with ${documentIds.length} documents`);
      console.log("Document IDs:", documentIds);
      console.log("Documents:", documents);
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUploaded = (document: Document) => {
    console.log("Document uploaded:", document);
    setDocuments((prev) => [...prev, document]);
  };

  const handleDocumentDeleted = (documentId: string) => {
    console.log("Document deleted:", documentId);
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Document Upload Demo</CardTitle>
          <CardDescription>
            This demo shows how to use the FormDocumentUpload component to
            upload and manage documents in your forms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormDocumentUpload
                control={form.control}
                name="documents"
                title="Compliance Documentation"
                description="Upload legal, audit, and compliance documents"
                documentTypes={[
                  { value: "audit", label: "Audit" },
                  { value: "legal", label: "Legal" },
                  { value: "compliance", label: "Compliance" },
                  { value: "whitepaper", label: "White Paper" },
                  { value: "other", label: "Other" },
                ]}
                onDocumentUploaded={handleDocumentUploaded}
                onDocumentDeleted={handleDocumentDeleted}
              />

              {message && (
                <Alert variant="default" className="mt-4">
                  <AlertTitle>Form Status</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Form"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
