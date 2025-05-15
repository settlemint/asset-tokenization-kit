"use client";

import {
  FormDocumentUpload,
  type UploadedDocument,
} from "@/components/blocks/form/inputs/form-document-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { t } from "@/lib/utils/typebox";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Define our form schema
const DocumentUploadSchema = t.Object(
  {
    documents: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        url: t.String(),
        size: t.Number(),
        type: t.String(),
        objectName: t.String(),
        uploadedAt: t.String(),
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
      }),
      { minItems: 1, error: "Please upload at least one document" }
    ),
  },
  { $id: "DocumentUploadForm" }
);

type FormValues = {
  documents: UploadedDocument[];
};

export default function DocumentUploadTestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: typeboxResolver(DocumentUploadSchema),
    defaultValues: {
      documents: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // In a real application, you might want to perform some additional processing here
      console.log("Submitted documents:", data.documents);

      // Show success message
      toast.success(
        `Successfully uploaded ${data.documents.length} document(s)`
      );

      // Reset form after successful submission if needed
      // form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSuccess = (files: UploadedDocument[]) => {
    toast.success(`Successfully uploaded ${files.length} file(s)`);
  };

  const handleUploadError = (error: Error) => {
    toast.error(`Upload error: ${error.message}`);
  };

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Document Upload Test</CardTitle>
          <CardDescription>
            This page demonstrates the document upload component using
            SettleMint&apos;s Minio SDK.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="documents"
                render={({ field }) => (
                  <FormDocumentUpload
                    name="documents"
                    control={form.control}
                    label="Upload Documents"
                    description="Upload one or more documents (PDF, DOC, DOCX, XLS, XLSX, etc.)"
                    maxSize={10 * 1024 * 1024} // 10MB
                    maxFiles={5}
                    documentType="test"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                  />
                )}
              />

              <CardFooter className="flex justify-end px-0">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Submit"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Current Form Values:</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
          {JSON.stringify(form.watch(), null, 2)}
        </pre>
      </div>
    </div>
  );
}
