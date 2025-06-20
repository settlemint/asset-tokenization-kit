# PDF Viewer Component

A React component for viewing PDF files in a modal dialog using react-pdf.

## Features

- ✅ View PDF files in a modal dialog
- ✅ Page navigation (previous/next)
- ✅ Zoom in/out functionality
- ✅ Download PDF option
- ✅ Loading states and error handling
- ✅ Responsive design
- ✅ Text layer and annotation layer support
- ✅ Automatic state reset when dialog closes

## Usage

```tsx
import { PDFViewer } from "@/components/blocks/pdf-viewer";

function DocumentActions({ document }) {
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsPDFViewerOpen(true)}>
        <Eye className="h-4 w-4" />
      </Button>

      <PDFViewer
        isOpen={isPDFViewerOpen}
        onClose={() => setIsPDFViewerOpen(false)}
        fileUrl={document.url}
        fileName={document.fileName}
      />
    </>
  );
}
```

## Props

| Prop       | Type         | Description                                           |
| ---------- | ------------ | ----------------------------------------------------- |
| `isOpen`   | `boolean`    | Controls whether the PDF viewer dialog is open        |
| `onClose`  | `() => void` | Callback function called when the dialog should close |
| `fileUrl`  | `string`     | URL of the PDF file to display                        |
| `fileName` | `string`     | Display name for the PDF file                         |

## Dependencies

- `react-pdf` - PDF rendering library
- `@radix-ui/react-dialog` - Dialog component
- `lucide-react` - Icons

## Error Handling

The component handles various error states:

- Failed to load PDF file
- Network errors
- Corrupted PDF files
- Unsupported PDF formats

When an error occurs, users are provided with a fallback option to download the
PDF directly.

## Styling

The component uses Tailwind CSS classes and includes custom styles for:

- PDF page rendering
- Dialog layout and sizing
- Loading and error states
- Responsive design

Custom CSS classes are defined in `globals.css`:

- `.pdf-container` - Centers the PDF content
- `.pdf-page` - Adds shadow to PDF pages
- `.react-pdf__*` - Overrides default react-pdf styles
