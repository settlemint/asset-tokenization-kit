# File Actions

This directory contains server actions for file operations in the application.

## File Deletion

For file deletion, use the new consolidated `deleteFile` function in
`delete-file.ts`. This function provides improved reliability and error handling
compared to previous implementations.

### Usage

```typescript
import { deleteFile } from "@/lib/actions/delete-file";

// In a server action or API route
const result = await deleteFile("your/file/path.pdf");

if (result.success) {
  console.log("File deleted successfully:", result.message);
} else {
  console.error("File deletion failed:", result.message);
}
```

### Response Format

The function returns a Promise with the following structure:

```typescript
{
  success: boolean;     // Whether the operation was successful
  message: string;      // Human-readable description of the result
  error?: any;          // Optional error information if an error occurred
}
```

### Deprecation Notice

The following older file deletion implementations are now deprecated:

1. `deleteFile` in `upload.ts` - Will be removed in a future release
2. `deleteFileDirect` in `app/actions/delete-file-direct.ts` - Will be removed
   in a future release

Please migrate to using the new consolidated function for all file deletion
operations.
