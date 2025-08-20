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
import { useAppForm } from "@/hooks/use-app-form";
import { orpc, client } from "@/orpc/orpc-client";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { TopicUpdateInputSchema } from "@/orpc/routes/system/claim-topics/routes/topic.update.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

  const form = useAppForm({
    defaultValues: {
      name: topic.name,
      signature: topic.signature,
    } as z.infer<typeof TopicUpdateInputSchema>,
    validators: {
      onChange: TopicUpdateInputSchema,
      onSubmit: ({ value }) => {
        // Additional validation: signature must be different from current
        if (value.signature === topic.signature) {
          return { signature: "New signature must be different from current signature" };
        }
      },
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

        <form.AppForm>
          <div className="space-y-4">
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

          <form.AppField
            name="signature"
            children={(field) => (
              <field.TextField
                label="Function Signature"
                required={true}
                description="Function signature for claim verification. Must follow the format: functionName(parameterTypes). E.g., hasLicense(address,bytes32)"
              />
            )}
          />
          <div className="text-xs text-muted-foreground">
            <p>Current: <code className="bg-muted px-1 py-0.5 rounded">{topic.signature}</code></p>
          </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe>
              {(state) => (
                <Button
                  type="button"
                  onClick={() => void form.handleSubmit()}
                  disabled={
                    updateMutation.isPending ||
                    !state.canSubmit ||
                    Object.keys(state.errors).length > 0
                  }
                >
                  {updateMutation.isPending ? "Updating..." : "Update Signature"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}