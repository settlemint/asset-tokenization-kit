'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { InputProps } from '@/components/ui/input';
import { type VariantProps, cva } from 'class-variance-authority';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { omit } from 'lodash';
import {
  CheckIcon,
  CloudUploadIcon,
  FileIcon,
  FileSymlinkIcon,
  FileTextIcon,
  ImageIcon,
  TriangleAlertIcon,
  X,
} from 'lucide-react';
import ReactDropzone from 'react-dropzone';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { createPresignedUrlAction } from '../actions/create-presigned-file-upload-url.action';
import { useMultiFormStep } from '../form-multistep';

/**
 * Dropzone component for the file input
 */

interface DropzoneProps {
  label: string;
  name: string;
  accept?: {
    images: Array<'.jpg' | '.jpeg' | '.png' | '.webp'>;
    text: Array<'.pdf' | '.docx' | '.doc' | '.txt' | '.md' | '.csv' | '.xls' | '.xlsx'>;
  };
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  server?: {
    storage: 'minio' | 's3' | 'local';
    bucket?: string;
    uploadDir?: string;
  };
}

type Action = {
  id: string;
  file: File;
  file_name: string;
  file_size: number;
  from: string;
  to: string | null;
  file_type: string;
  isUploading?: boolean;
  isUploaded?: boolean;
  is_error?: boolean;
  url?: string;
  output?: File;
};

function bytesToSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return '0 Byte';
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / 1024 ** i).toFixed(2);
  return `${size} ${sizes[i]}`;
}

function truncateFileName(fileName: string): string {
  const maxSubstrLength = 18;
  if (fileName.length > maxSubstrLength) {
    const fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
    const fileExtension = fileName.split('.').pop() ?? '';
    const charsToKeep = maxSubstrLength - (fileNameWithoutExtension.length + fileExtension.length + 3);
    const compressedFileName = `${fileNameWithoutExtension.substring(
      0,
      maxSubstrLength - fileExtension.length - 3
    )}...${fileNameWithoutExtension.slice(-charsToKeep)}.${fileExtension}`;
    return compressedFileName;
  }
  return fileName.trim();
}

function fileToIcon(fileType: string): React.ReactNode {
  if (fileType.includes('application')) {
    return <FileTextIcon />;
  }
  if (fileType.includes('text')) {
    return <FileTextIcon />;
  }
  if (fileType.includes('image')) {
    return <ImageIcon />;
  }
  return <FileIcon />;
}

export function Dropzone({
  label,
  name,
  accept = { images: ['.jpg', '.jpeg', '.png', '.webp'], text: ['.pdf'] },
  maxSize,
  maxFiles,
  multiple = true,
  server = { storage: 'minio' },
}: DropzoneProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [isHover, setIsHover] = useState<boolean>(false);
  const [_multiple] = useState<boolean>(Boolean(multiple));
  const [actions, setActions] = useState<Action[]>([]);
  const [, setIsReady] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [, setIsDone] = useState<boolean>(false);
  const [activeUploads, setActiveUploads] = useState<Record<string, XMLHttpRequest>>({});
  const { formId } = useMultiFormStep();
  const [storageState] = useLocalStorage<Record<string, unknown>>(
    'files',
    JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('files') ?? '{}') : '{}')
  );
  const [, setIsNavigate] = useState(true);

  const [storageStateActions, setStorageStateActions] = useState<Action[]>(
    Object.values(storageState[formId] ?? {}).map(
      (file) =>
        ({
          id: file.id,
          file_name: file.name,
          file_size: file.size,
          from: file.name.slice(((file.name.lastIndexOf('.') - 1) >>> 0) + 2),
          to: null,
          file_type: file.type,
          file: file,
          isUploaded: true,
          isUploading: false,
        }) as Action
    )
  );

  const generateUniqueId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleUpload = async (files: File[]): Promise<void> => {
    handleExitHover();
    setFiles((prevFiles) => [...prevFiles, ...files]);
    const _actions: Action[] = [...storageStateActions];

    for (const file of files) {
      const id = generateUniqueId();
      (file as File & { id: string }).id = id;
      _actions.push({
        id,
        file_name: file.name,
        file_size: file.size,
        from: file.name.slice(((file.name.lastIndexOf('.') - 1) >>> 0) + 2),
        to: null,
        file_type: file.type,
        file,
        isUploaded: false,
        isUploading: true,
        is_error: false,
      });
    }
    setActions(_actions);
    setStorageStateActions(_actions);

    for (const file of files) {
      try {
        const id = (file as File & { id: string }).id;

        const result = await createPresignedUrlAction({
          bucketName: server.bucket ?? '',
          objectName: file.name,
          expirySeconds: 3600,
        });

        const uploadUrl = result?.data?.data?.uploadUrl ?? '';

        if (!result?.data?.success) {
          throw new Error('Failed to get upload URL');
        }

        const xhr = new XMLHttpRequest();

        xhr.open('PUT', uploadUrl, true);
        setActiveUploads((prev) => ({ ...prev, [id]: xhr }));

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: progress,
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            setActions((prev) =>
              prev.map((action) =>
                action.file_name === file.name ? { ...action, isUploaded: true, isUploading: false, id } : action
              )
            );
            toast.success(`Upload file ${file.name} successfully`);

            const localStorageFiles = JSON.parse(localStorage.getItem('files') ?? '{}')[formId] ?? {};
            const localStorageState = {
              [formId]: {
                ...localStorageFiles,
                [(file as File & { id: string }).id]: {
                  id: (file as File & { id: string }).id,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                },
              },
            };
            localStorage.setItem('files', JSON.stringify(localStorageState));
          } else {
            setActions((prev) =>
              prev.map((action) =>
                action.file_name === file.name ? { ...action, is_error: true, isUploading: false, id } : action
              )
            );
            toast.error(`Failed to upload ${file.name}`);
          }
        };

        xhr.onerror = () => {
          setActions((prev) =>
            prev.map((action) =>
              action.file_name === file.name ? { ...action, is_error: true, isUploading: false, id } : action
            )
          );

          setActiveUploads((prev) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: _, ...rest } = prev;
            return rest;
          });

          toast.error(`Failed to upload ${file.name}`);
        };

        xhr.send(file);
      } catch {
        toast.error('There was an error initiating your upload.');
      }
    }
  };

  const handleHover = (): void => setIsHover(true);

  const handleExitHover = (): void => setIsHover(false);

  const checkIsReady = useCallback((): void => {
    const tempIsReady = actions.every((action) => action.to);
    setIsReady(tempIsReady);
  }, [actions]);

  const deleteAction = async (action: Action): Promise<void> => {
    const localStoragefiles = JSON.parse(localStorage.getItem('files') ?? '{}');
    delete localStoragefiles[formId][action.id];
    localStorage.setItem('files', JSON.stringify(localStoragefiles));
    setStorageStateActions(storageStateActions.filter((a) => a.id !== action.id));
    setActions(actions.filter((a) => a !== action));
    setFiles(files.filter((a) => a.name !== action.file_name));

    // Cancel the upload if it's still in progress
    if (activeUploads[action.id]) {
      activeUploads[action.id].abort();
      setActiveUploads((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [action.id]: _, ...rest } = prev;
        return rest;
      });
    }

    try {
      const fileName = action.file_name.split('.').slice(0, -1).join('.');
      const extension = action.file_name.split('.').pop();
      const response = await fetch(`/api/upload?fileName=${fileName}_id_${action.id}.${extension}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // If the server deletion was successful, update the local state
      setActions(actions.filter((elt) => elt !== action));
      setFiles(files.filter((elt) => elt.name !== action.file_name));

      toast.success(`File ${action.file_name} deleted successfully`);
    } catch {
      toast.error(`Failed to delete ${action.file_name}`);
    }
  };

  useEffect(() => {
    if (actions.length) {
      checkIsReady();
    } else {
      setIsDone(false);
      setFiles([]);
      setIsReady(false);
    }
  }, [actions, checkIsReady]);

  useEffect(() => {
    setIsNavigate(false);
  }, []);

  const fileuploads = Array.from(new Map([...storageStateActions, ...actions].map((item) => [item.id, item])).values());

  return (
    <div className="Dropzone">
      <div className="mb-6 space-y-6">
        {fileuploads.map((action: Action, i: number) => (
          <div
            key={`${action.file_name}-${i}`}
            className="relative flex h-fit w-full flex-wrap items-center justify-between space-y-2 overflow-hidden rounded-xl border px-4 py-4 lg:h-20 lg:flex-nowrap lg:py-0"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{fileToIcon(action.file_type)}</span>
              <div className="flex w-96 items-center gap-1">
                <span className="overflow-x-hidden font-medium text-md">{truncateFileName(action.file_name)}</span>
                <span className="text-muted-foreground text-sm">({bytesToSize(action.file_size)})</span>
              </div>
            </div>

            {action.is_error ? (
              <Badge variant="destructive" className="flex gap-2">
                <span>Error Uploading File</span>
                <TriangleAlertIcon />
              </Badge>
            ) : action.isUploaded ? (
              <div>
                <CheckIcon />
              </div>
            ) : action.isUploading ? (
              <Badge variant="default" className="flex gap-2 bg-transparent">
                <span className="text-black text-xs dark:text-white">{uploadProgress[action.file_name]}%</span>
              </Badge>
            ) : (
              <></>
            )}

            <button
              onClick={() => deleteAction(action)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-foreground hover:bg-muted"
              aria-label="Delete file"
              type="button"
            >
              <X />
            </button>

            {action.isUploading && (
              <span
                className="absolute bottom-0 left-0 inline-block h-1 bg-black dark:bg-white"
                style={{ width: `${uploadProgress[action.file_name]}%` }}
              />
            )}
          </div>
        ))}
      </div>

      <div
        className={
          Array.from(fileuploads).length === 1 && multiple === false ? 'Dropzone__content hidden' : 'Dropzone__content'
        }
      >
        <ReactDropzone
          onDrop={handleUpload}
          onDragEnter={handleHover}
          onDragLeave={handleExitHover}
          accept={{
            'image/*': accept.images,
            'text/*': accept.text,
          }}
          maxSize={maxSize}
          maxFiles={maxFiles}
          multiple={_multiple}
          onDropRejected={() => {
            handleExitHover();
            toast.error('Error uploading your file(s). Allowed Files: Audio, Video and Images.');
          }}
          onError={() => {
            handleExitHover();
            toast.error('Error uploading your file(s). Allowed Files: Audio, Video and Images.');
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps()}
              className=" flex h-72 cursor-pointer items-center justify-center rounded-3xl border-2 border-secondary border-dashed bg-background shadow-sm lg:h-80 xl:h-40"
            >
              <input {...getInputProps()} name={name} multiple={_multiple} />
              <div className="space-y-4 text-foreground">
                {isHover ? (
                  <>
                    <div className="flex justify-center text-6xl">
                      <FileSymlinkIcon />
                    </div>
                    <h3 className="text-center font-medium text-md">Yes, right here</h3>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center text-6xl">
                      <CloudUploadIcon />
                    </div>
                    <h3 className="text-center font-medium text-md">{label}</h3>
                  </>
                )}
              </div>
            </div>
          )}
        </ReactDropzone>
      </div>
    </div>
  );
}

/**
 * FileInput component
 */

const inputVariants = cva('', {
  variants: {
    variant: {
      default: '',
      icon: 'pl-8',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const iconVariants = cva('absolute', {
  variants: {
    variant: {
      default: 'hidden',
      icon: 'top-8 left-2 flex h-[1.2rem] w-[1.2rem] items-center justify-center',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type FileInputProps<T extends FieldValues> = {
  label: string;
  description?: string;
  icon?: ReactNode;
} & Omit<InputProps, 'name'> &
  VariantProps<typeof inputVariants> & {
    name: Path<T>;
    control: Control<T>;
    shouldUnregister?: boolean;
    rules?: Pick<RegisterOptions<T, Path<T>>, 'required' | 'minLength' | 'maxLength' | 'pattern'>;
  };

export function FileInput<T extends FieldValues>({
  variant,
  label,
  description,
  icon,
  name,
  control,
  className,
  ...props
}: FileInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>Token Logo</FormLabel>
            <FormControl>
              <Dropzone
                label="Click, or drop your logo here"
                name={field.name}
                accept={{
                  images: ['.jpg', '.jpeg', '.png', '.webp'],
                  text: [],
                }}
                maxSize={1024 * 1024 * 10} // 10MB
                multiple={false}
                server={{
                  bucket: 'default-bucket',
                  storage: 'minio',
                }}
                {...omit(props, 'accept')}
              />
            </FormControl>
            <FormDescription>This is the logo of the token</FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

FileInput.displayName = 'FileInput';
