"use client"; // This page uses react-hook-form, so it needs to be a Client Component

import { useForm } from "react-hook-form";

import { UploadField } from "@/components/form/upload-field"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { t, type StaticDecode } from "@/lib/utils/typebox"; // Import TypeBox
import { typeboxResolver } from "@hookform/resolvers/typebox"; // Assuming this is configured

// 1. Define the schema using TypeBox
const formSchema = t.Object(
  {
    profilePicture: t.Optional(
      t.String({ format: "url", error: "Invalid URL format" })
    ),
    projectDocuments: t.Optional(
      t.Array(t.String({ format: "url", error: "Invalid URL format" }), {
        minItems: 0,
        error: "Must be an array of URLs",
      })
    ),
    notes: t.Optional(t.String()), // Example other field
  },
  { $id: "UploadTestForm" }
);

// 2. Infer the type from the schema
type FormValues = StaticDecode<typeof formSchema>;

export default function TestUploadPage() {
  // 3. Set up the form
  const form = useForm<FormValues>({
    resolver: typeboxResolver(formSchema), // Use the configured Typebox resolver
    defaultValues: {
      profilePicture: undefined,
      projectDocuments: [],
      notes: "",
    },
  });

  // 4. Define the submit handler
  function onSubmit(data: FormValues) {
    console.log("Form Submitted Data:", data);
    // Here you would typically send the data (including the file URLs)
    // to your backend API or another server action for final processing.
    alert(
      `Form Submitted!\nProfile Picture URL: ${data.profilePicture}\nDocuments: ${data.projectDocuments?.join(", ")}`
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Upload Field Test</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Single File Upload */}
          <UploadField
            control={form.control}
            name="images"
            label="Images"
            accept="image/*,application/pdf" // Limit to images
            maxSizeMB={2} // Example: 2MB limit
            uploadPathPrefix="images" // Optional prefix for organization
          />

          {/* Multiple File Upload */}
          <UploadField
            control={form.control}
            name="projectDocuments"
            label="Project Documents"
            // multiple // Enable multiple files
            accept="application/octet-stream, .pdf" // Limit file types
            maxSizeMB={10} // Example: 10MB limit per file
            uploadPathPrefix="documents"
          />

          {/* Example of another standard field (Optional) */}
          {/* <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input placeholder="Optional notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <Button type="submit">Submit Test Form</Button>
        </form>
      </Form>
    </div>
  );
}
