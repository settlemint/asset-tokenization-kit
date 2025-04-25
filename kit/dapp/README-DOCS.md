# Document Upload Component

This component allows users to upload documents to the application, storing
files in MinIO and metadata in the database.

## Setup Instructions

### 1. Database Schema

Run the migration to create the `documents` table:

```bash
bunx drizzle-kit push
```

This will create the documents table with the following structure:

```sql
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  download_url TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### 2. Hasura Configuration

Make sure Hasura is tracking the documents table:

```bash
# Command to track the table in Hasura
settlemint hasura track table documents
settlemint hasura track field documents id
settlemint hasura track field documents user_id
```

### 3. API Routes

The following API routes are available for document management:

- `POST /api/documents` - Upload a document
- `GET /api/documents` - Get all documents for the current user
- `GET /api/documents?id=xxx` - Get a specific document
- `DELETE /api/documents?id=xxx` - Delete a document

## Using the Component

Import the component into your form:

```tsx
import { FormDocumentUpload } from "@/components/blocks/form/inputs/form-document-upload";

// In your form component:
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
/>;
```

This will integrate a document upload field into your form. The documents will
be stored and can be retrieved via the API.

## Troubleshooting

If you're encountering issues with the documents API:

1. Make sure the `documents` table is properly created in the database
2. Ensure Hasura is tracking the table and fields
3. Check that the MinIO storage is properly configured
4. Verify the API routes are properly configured
