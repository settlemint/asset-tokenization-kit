import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc, client } from "@/orpc/orpc-client";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { TopicUpdateInputSchema } from "@/orpc/routes/system/claim-topics/routes/topic.update.schema";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

interface EditTopicDialogProps {
  topic: TopicScheme;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for editing claim topic signatures
 * Allows administrators to update the verification signature for custom topics
 */
export function EditTopicDialog({ topic, open, onOpenChange }: EditTopicDialogProps) {
  const queryClient = useQueryClient();

  // Update topic mutation
  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof TopicUpdateInputSchema>) =>
      client.system.topicUpdate(data),
    onSuccess: (result) => {
      toast.success(`Topic "${result.name}" updated successfully`);
      // Invalidate and refetch topics data
      void queryClient.invalidateQueries({
        queryKey: orpc.system.topicList.queryKey(),
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update topic: ${error.message}`);
    },
  });

  const onValidate = useCallback(
    ({ value }: { value: z.infer<typeof TopicUpdateInputSchema> }) => {
      const result = TopicUpdateInputSchema.safeParse(value);
      if (result.error) {
        return result.error.issues.reduce<Record<string, string>>((acc, issue) => {
          acc[issue.path[0] as keyof typeof value] = issue.message;
          return acc;
        }, {});
      }
      
      // Additional validation: signature must be different from current
      if (value.signature === topic.signature) {
        return { signature: "New signature must be different from current signature" };
      }
    },
    [topic.signature]
  );

  const form = useForm({
    defaultValues: {
      name: topic.name,
      signature: topic.signature,
    },
    validators: {
      onChange: onValidate,
      onSubmit: onValidate,
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  // Reset form when topic changes
  useEffect(() => {
    if (open) {
      form.setFieldValue("name", topic.name);
      form.setFieldValue("signature", topic.signature);
    }
  }, [open, topic.name, topic.signature, form]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Topic Signature</DialogTitle>
          <DialogDescription>
            Update the verification signature for this claim topic.
            The topic name cannot be changed after creation.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Topic Name</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  readOnly
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Topic ID: {Number(topic.topicId)} • Topic name cannot be changed
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="signature">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Function Signature <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => { field.handleChange(e.target.value); }}
                  placeholder="e.g., hasLicense(address,bytes32)"
                  disabled={updateMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Current: <code className="bg-muted px-1 py-0.5 rounded">{topic.signature}</code></p>
                  <p>Function signature for claim verification. Must follow the format: functionName(parameterTypes)</p>
                </div>
              </div>
            )}
          </form.Field>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !form.state.canSubmit}
            >
              {updateMutation.isPending ? "Updating..." : "Update Signature"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}